import unittest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.nlp.preprocessing import clean_text, preprocess_text, extract_keywords, tokenize_sentences
from app.nlp.embeddings import compute_embedding, compute_embeddings_batch
from app.nlp.similarity import (
    calculate_tfidf_similarity,
    calculate_semantic_similarity,
    analyze_project_similarity,
    generate_innovation_directions
)
from app.nlp.classification import classify_complaint, classify_discussion
from app.nlp.sentiment import analyze_sentiment, extract_aspect_sentiments
from app.nlp.summarization import summarize_text
from app.nlp.entity_extraction import extract_notice_entities, extract_dates_and_deadlines
from app.nlp.semantic_search import FAISSIndexManager
from app.nlp.rag import AcademicRAGService

class TestCampusMindNLP(unittest.TestCase):

    def test_preprocessing(self):
        raw = "Check out https://nlp.org! Deep Learning & NLP are amazing in 2026."
        cleaned = clean_text(raw)
        self.assertNotIn("https://nlp.org", cleaned)

        preprocessed = preprocess_text("Students are studying neural networks in universities.")
        self.assertIn("student", preprocessed)
        self.assertIn("neural", preprocessed)

        kws = extract_keywords("machine learning machine learning model training parameters", top_n=3)
        self.assertIn(kws[0], ["machine", "learning"])

    def test_similarity_engine(self):
        query = "Plant Disease Classification using Convolutional Neural Networks on leaf images"
        corpus = [
            "Leaf pathology detection using CNN and deep neural networks",
            "Blockchain decentralized voting system on Ethereum network",
            "Automated image processing for foliar disease identification in crops"
        ]
        tfidf_sims = calculate_tfidf_similarity(query, corpus)
        self.assertGreater(tfidf_sims[0], tfidf_sims[1])

        q_emb = compute_embedding(query)
        self.assertEqual(len(q_emb), 384)
        c_embs = compute_embeddings_batch(corpus)
        sem_sims = calculate_semantic_similarity(q_emb, c_embs)
        self.assertGreater(sem_sims[0], sem_sims[1])

        # Test innovation generator
        innovations = generate_innovation_directions("AI Plant Disease", "Detection of leaf pathogens", ["Python", "CNN"])
        self.assertGreater(len(innovations), 0)

    def test_complaint_nlp(self):
        text = "The practical sessions are insufficient, and students cannot understand programming concepts properly."
        cat, subcat = classify_complaint(text)
        self.assertEqual(cat, "Academics")

        sentiment = analyze_sentiment(text)
        self.assertEqual(sentiment["sentiment"], "Negative")
        self.assertLess(sentiment["sentiment_score"], 0)

        aspects = extract_aspect_sentiments(text)
        self.assertGreater(len(aspects), 0)

    def test_entity_extraction_and_summary(self):
        notice_text = (
            "Circular CIR/2026/04: The last date for examination registration form submission "
            "is 15th April 2026. Students must remit a fee of Rs. 1200 via the portal. "
            "Hall tickets will be released on 20th April 2026 by the Department of Computer Science and Engineering."
        )
        entities = extract_notice_entities(notice_text)
        self.assertIn("Rs. 1200", entities["fees"])
        self.assertIn("Computer Science and Engineering", entities["departments"])
        self.assertGreater(len(entities["deadlines"]), 0)

        summary = summarize_text(notice_text, max_sentences=2)
        self.assertIsInstance(summary, str)
        self.assertGreater(len(summary), 20)

    def test_faiss_and_rag(self):
        index = FAISSIndexManager(dimension=384)
        doc1 = compute_embedding("Students must maintain a minimum of 75 percent attendance to appear for final examinations.")
        doc2 = compute_embedding("The university library operates from 8 AM to 10 PM on all weekdays.")
        
        index.add_vectors([doc1, doc2], [
            {"doc_title": "Academic Regulations", "page_number": 4, "text": "Minimum 75% attendance rule."},
            {"doc_title": "Library Guide", "page_number": 1, "text": "Library operating hours."}
        ])

        query = "What is the minimum attendance required for exams?"
        q_emb = compute_embedding(query)
        matches = index.search(q_emb, top_k=1)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["doc_title"], "Academic Regulations")

if __name__ == "__main__":
    unittest.main()
