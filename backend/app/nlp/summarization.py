import re
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.nlp.preprocessing import tokenize_sentences, clean_text

def summarize_text(text: str, max_sentences: int = 4) -> str:
    """
    Extractive text summarization using sentence-level TF-IDF salience scoring.
    Selects the most informative sentences in natural presentation order.
    """
    if not text:
        return "No text provided for summarization."
        
    sentences = tokenize_sentences(text)
    if len(sentences) <= max_sentences:
        return " ".join(sentences)
        
    # Clean sentences for vectorizer
    cleaned_sents = [clean_text(s) for s in sentences if len(s.split()) > 3]
    if len(cleaned_sents) <= max_sentences:
        return " ".join(cleaned_sents)
        
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(cleaned_sents)
        
        # Sentence score = sum of tf-idf weights normalized by sentence length
        sentence_scores = []
        for i, row in enumerate(tfidf_matrix):
            score = row.sum()
            # Positional bias: earlier sentences in official notices/papers carry higher summary value
            position_multiplier = 1.0 + (1.0 / (i + 1)) * 0.4
            sentence_scores.append((i, float(score) * position_multiplier))
            
        # Top scoring sentences
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        top_indices = sorted([idx for idx, _ in sentence_scores[:max_sentences]])
        
        selected_sentences = [cleaned_sents[idx] for idx in top_indices]
        return " ".join(selected_sentences)
    except Exception:
        # Fallback to leading sentences
        return " ".join(sentences[:max_sentences])

def summarize_bullets(text: str, max_bullets: int = 4) -> List[str]:
    """Generates a structured bulleted summary."""
    summary_paragraph = summarize_text(text, max_sentences=max_bullets)
    return tokenize_sentences(summary_paragraph)
