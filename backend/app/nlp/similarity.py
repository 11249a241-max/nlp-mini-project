import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from app.nlp.preprocessing import preprocess_text, extract_keywords
from app.nlp.embeddings import compute_embedding, get_sentence_transformer

def calculate_tfidf_similarity(query_text: str, corpus_texts: List[str]) -> List[float]:
    """Calculates TF-IDF Cosine Similarity between query and corpus items."""
    if not corpus_texts:
        return []
    
    clean_query = preprocess_text(query_text)
    clean_corpus = [preprocess_text(t) for t in corpus_texts]
    
    all_docs = [clean_query] + clean_corpus
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
        # Cosine similarity of first row (query) with remaining rows
        query_vec = tfidf_matrix[0:1]
        corpus_vecs = tfidf_matrix[1:]
        sims = cosine_similarity(query_vec, corpus_vecs)[0]
        return [float(s) for s in sims]
    except Exception:
        return [0.0] * len(corpus_texts)

def calculate_semantic_similarity(query_embedding: List[float], corpus_embeddings: List[List[float]]) -> List[float]:
    """Calculates cosine similarity between Sentence-BERT embedding vectors."""
    if not corpus_embeddings:
        return []
    q_vec = np.array(query_embedding, dtype=np.float32)
    c_vecs = np.array(corpus_embeddings, dtype=np.float32)
    
    # Vectors are already normalized, dot product equals cosine similarity
    dot_products = np.dot(c_vecs, q_vec)
    # Clip between 0 and 1
    sims = np.clip(dot_products, 0.0, 1.0)
    return [float(s) for s in sims]

def generate_innovation_directions(title: str, abstract: str, tech_stack: List[str]) -> List[str]:
    """Generates context-aware innovation suggestions for students to differentiate their work."""
    text_lower = (title + " " + abstract).lower()
    tech_str = " ".join(tech_stack).lower()
    
    suggestions = []
    
    if any(k in text_lower for k in ["plant", "crop", "leaf", "disease", "agriculture"]):
        suggestions.extend([
            "Integrate Edge AI / offline mobile inference for remote farmers without internet connectivity.",
            "Incorporate Explainable AI (Grad-CAM / LIME) to show agricultural experts which leaf symptoms triggered the diagnosis.",
            "Add localized multi-lingual voice feedback in regional languages for ease of adoption.",
            "Pair image classification with micro-climate weather forecasts and fertilizer dosage recommendations."
        ])
    elif any(k in text_lower for k in ["health", "medical", "disease", "patient", "cancer", "mri", "x-ray", "e-health"]):
        suggestions.extend([
            "Implement Federated Learning to train models collaboratively across hospitals while preserving patient privacy.",
            "Add uncertainty quantification (Bayesian Deep Learning) to indicate model confidence on rare pathology cases.",
            "Integrate HL7 / FHIR healthcare interoperability standards for clinical EHR integration.",
            "Include an automated medical report summarizer for patients with simplified explanations."
        ])
    elif any(k in text_lower for k in ["sentiment", "fake news", "social media", "twitter", "nlp", "chatbot"]):
        suggestions.extend([
            "Support multimodal sentiment analysis (combining text, audio tones, and facial video expressions).",
            "Incorporate cross-lingual transfer learning to detect misinformation across vernacular social platforms.",
            "Implement dynamic source credibility scoring and factual claim verification against trusted fact-check registries.",
            "Add adversarial robustness testing to mitigate prompt injection and evasive text obfuscation."
        ])
    elif any(k in text_lower for k in ["iot", "smart home", "sensor", "traffic", "energy", "monitoring"]):
        suggestions.extend([
            "Deploy lightweight quantization (TinyML) directly on ESP32/microcontroller hardware for micro-power consumption.",
            "Implement decentralized blockchain telemetry logs for tamper-proof audit trails.",
            "Introduce predictive maintenance anomaly detection using temporal LSTM or Transformer models."
        ])
    else:
        suggestions.extend([
            "Integrate Explainable AI (SHAP/LIME) to provide interpretability for automated algorithmic decisions.",
            "Implement offline-first Progressive Web App (PWA) capabilities with local indexed vector caching.",
            "Add real-time collaborative multi-user editing with conflict-free replicated data types (CRDTs).",
            "Incorporate automated benchmark evaluations and fairness/bias auditing across demographic subgroups."
        ])
        
    return suggestions[:4]

def analyze_project_similarity(
    submitted_project: Dict[str, Any],
    existing_projects: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Performs hybrid TF-IDF + Sentence-BERT similarity detection against repository of projects.
    """
    if not existing_projects:
        # No existing projects in repository to compare against
        query_full_text = f"{submitted_project.get('title', '')} {submitted_project.get('abstract', '')} {submitted_project.get('description', '')}"
        q_emb = compute_embedding(query_full_text)
        return {
            "textual_similarity_score": 0.0,
            "semantic_similarity_score": 0.0,
            "overall_similarity_score": 0.0,
            "top_matches": [],
            "matching_keywords": extract_keywords(query_full_text, top_n=6),
            "similarity_explanations": ["No conflicting or overlapping student projects found in the university repository."],
            "innovation_suggestions": generate_innovation_directions(
                submitted_project.get("title", ""),
                submitted_project.get("abstract", ""),
                submitted_project.get("technologies", [])
            ),
            "query_embedding": q_emb
        }
        
    query_text = f"{submitted_project.get('title', '')} {submitted_project.get('abstract', '')} {submitted_project.get('description', '')}"
    corpus_texts = [
        f"{p.get('title', '')} {p.get('abstract', '')} {p.get('description', '')}"
        for p in existing_projects
    ]
    
    # 1. TF-IDF Textual Similarity
    tfidf_sims = calculate_tfidf_similarity(query_text, corpus_texts)
    
    # 2. Sentence-BERT Semantic Similarity
    q_emb = compute_embedding(query_text)
    corpus_embs = [
        p.get("embedding") if p.get("embedding") else compute_embedding(corpus_texts[i])
        for i, p in enumerate(existing_projects)
    ]
    sem_sims = calculate_semantic_similarity(q_emb, corpus_embs)
    
    # 3. Hybrid scoring: 40% TF-IDF keyword overlap + 60% semantic similarity
    scored_projects = []
    for i, p in enumerate(existing_projects):
        tfidf_score = round(tfidf_sims[i] * 100, 2)
        sem_score = round(sem_sims[i] * 100, 2)
        hybrid_score = round((0.40 * tfidf_score) + (0.60 * sem_score), 2)
        
        # Overlapping keywords
        q_kws = set(extract_keywords(query_text, top_n=10))
        p_kws = set(extract_keywords(corpus_texts[i], top_n=10))
        overlap = list(q_kws.intersection(p_kws))
        
        scored_projects.append({
            "project_id": p.get("id"),
            "title": p.get("title"),
            "abstract": p.get("abstract", "")[:250] + "...",
            "technologies": p.get("technologies", []),
            "student_name": p.get("student_name", "Anonymous"),
            "textual_similarity": tfidf_score,
            "semantic_similarity": sem_score,
            "overall_similarity": hybrid_score,
            "matching_keywords": overlap
        })
        
    # Sort descending by overall similarity
    scored_projects.sort(key=lambda x: x["overall_similarity"], reverse=True)
    top_matches = scored_projects[:5]
    
    top_overall = top_matches[0]["overall_similarity"] if top_matches else 0.0
    top_textual = top_matches[0]["textual_similarity"] if top_matches else 0.0
    top_semantic = top_matches[0]["semantic_similarity"] if top_matches else 0.0
    
    # Generate qualitative explanation
    explanations = []
    if top_overall > 70:
        explanations.append(f"Significant overlap ({top_overall}%) detected with prior work: '{top_matches[0]['title']}'. Core problem formulation and methodology are highly congruent.")
    elif top_overall > 40:
        explanations.append(f"Moderate similarity ({top_overall}%) with '{top_matches[0]['title']}'. The topic area aligns closely, but unique architectural contributions are present.")
    else:
        explanations.append(f"Low overall similarity ({top_overall}%). The proposed submission demonstrates a distinct problem statement relative to current department archives.")
        
    if top_matches and top_matches[0]["matching_keywords"]:
        explanations.append(f"Shared domain concepts: {', '.join(top_matches[0]['matching_keywords'][:5])}.")
        
    all_matched_kws = []
    for m in top_matches:
        all_matched_kws.extend(m.get("matching_keywords", []))
    unique_matched_kws = list(dict.fromkeys(all_matched_kws))[:8]
    
    innovation_suggestions = generate_innovation_directions(
        submitted_project.get("title", ""),
        submitted_project.get("abstract", ""),
        submitted_project.get("technologies", [])
    )
    
    return {
        "textual_similarity_score": top_textual,
        "semantic_similarity_score": top_semantic,
        "overall_similarity_score": top_overall,
        "top_matches": top_matches,
        "matching_keywords": unique_matched_kws,
        "similarity_explanations": explanations,
        "innovation_suggestions": innovation_suggestions,
        "query_embedding": q_emb
    }
