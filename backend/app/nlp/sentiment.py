import re
from typing import Dict, Any, List

# Lexicon of positive, negative, and urgency keywords
POSITIVE_WORDS = {
    "good", "great", "excellent", "supportive", "helpful", "improved", "fast",
    "clean", "polite", "well", "appreciate", "satisfied", "thank", "effective"
}

NEGATIVE_WORDS = {
    "bad", "terrible", "poor", "broken", "dirty", "insufficient", "slow",
    "worst", "not working", "fails", "failed", "unusable", "unhelpful",
    "rude", "crowded", "delayed", "useless", "disappointed", "struggle",
    "difficult", "issue", "problem", "defect", "faulty", "lacking", "cannot"
}

URGENCY_WORDS = {
    "immediately", "urgent", "emergency", "danger", "hazard", "fire",
    "electric", "shock", "injury", "severe", "critical", "harassment",
    "exam", "hall ticket", "blocked", "penalty"
}

ASPECT_KEYWORDS = {
    "teaching": ["teach", "faculty", "professor", "lecture", "explaining", "concept", "syllabus"],
    "equipment": ["pc", "computer", "machine", "device", "ac", "fan", "projector", "lab"],
    "connectivity": ["wifi", "wi-fi", "internet", "network", "bandwidth", "login"],
    "hygiene": ["water", "restroom", "washroom", "toilet", "food", "mess", "canteen", "cleanliness"],
    "transport": ["bus", "shuttle", "route", "driver", "punctual", "stop"],
    "admin": ["fee", "registrar", "certificate", "id card", "portal", "approval", "marksheet"]
}

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Performs sentiment analysis and priority determination on complaint/feedback text.
    Returns sentiment, score (-1.0 to +1.0), and priority level (Low, Medium, High, Critical).
    """
    if not text:
        return {"sentiment": "Neutral", "sentiment_score": 0.0, "priority_level": "Low"}
        
    lower_text = text.lower()
    words = re.findall(r"\b\w+\b", lower_text)
    
    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)
    urg_count = sum(1 for w in words if w in URGENCY_WORDS)
    
    # Check for negative multi-word phrases
    for phrase in ["not working", "not enough", "cannot understand", "no water", "very slow", "extremely poor"]:
        if phrase in lower_text:
            neg_count += 2
            
    total_sentiment_words = pos_count + neg_count
    if total_sentiment_words == 0:
        score = 0.0
        sentiment = "Neutral"
    else:
        score = (pos_count - neg_count) / max(total_sentiment_words, 1)
        score = round(max(-1.0, min(1.0, score)), 2)
        if score > 0.15:
            sentiment = "Positive"
        elif score < -0.15:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
            
    # Priority determination
    if urg_count >= 1 or score <= -0.75 or any(w in lower_text for w in ["harassment", "emergency", "shock", "fire", "danger"]):
        priority = "Critical"
    elif score <= -0.40 or urg_count > 0:
        priority = "High"
    elif score < 0.0 or any(k in lower_text for k in ["delay", "broken", "issue"]):
        priority = "Medium"
    else:
        priority = "Low"
        
    return {
        "sentiment": sentiment,
        "sentiment_score": score,
        "priority_level": priority
    }

def extract_aspect_sentiments(text: str) -> List[Dict[str, Any]]:
    """Identifies which specific aspect the student is praising or complaining about."""
    lower_text = text.lower()
    aspect_results = []
    
    for aspect_name, triggers in ASPECT_KEYWORDS.items():
        if any(t in lower_text for t in triggers):
            # Extract sentence with trigger
            sentences = [s for s in re.split(r"[.!?]+", lower_text) if any(t in s for t in triggers)]
            aspect_text = " ".join(sentences)
            aspect_analysis = analyze_sentiment(aspect_text)
            aspect_results.append({
                "aspect": aspect_name.capitalize(),
                "sentiment": aspect_analysis["sentiment"],
                "score": aspect_analysis["sentiment_score"]
            })
            
    if not aspect_results:
        aspect_results.append({
            "aspect": "General",
            "sentiment": analyze_sentiment(text)["sentiment"],
            "score": analyze_sentiment(text)["sentiment_score"]
        })
        
    return aspect_results
