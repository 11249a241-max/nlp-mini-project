from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import ResearchPaper
from app.schemas.schemas import ResearchPaperOut, ResearchSearchRequest
from app.nlp.embeddings import compute_embedding
from app.nlp.similarity import calculate_semantic_similarity

router = APIRouter(prefix="/research", tags=["Research Discovery"])

DOMAINS = [
    "Artificial Intelligence",
    "Healthcare",
    "Agriculture",
    "Cybersecurity",
    "Natural Language Processing",
    "Education Technology"
]

@router.get("/domains")
def get_research_domains():
    return DOMAINS

@router.get("/recommendations", response_model=List[ResearchPaperOut])
def get_recommendations(domain: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ResearchPaper)
    if domain and domain != "All":
        query = query.filter(ResearchPaper.domain == domain)
    papers = query.limit(8).all()
    return papers

@router.post("/search", response_model=List[ResearchPaperOut])
def search_research_topics(search_in: ResearchSearchRequest, db: Session = Depends(get_db)):
    query = db.query(ResearchPaper)
    if search_in.domain and search_in.domain != "All":
        query = query.filter(ResearchPaper.domain == search_in.domain)
        
    papers = query.all()
    if not papers:
        return []
        
    # Semantic search using embeddings
    q_emb = compute_embedding(search_in.query)
    corpus_embs = []
    for p in papers:
        if p.embedding:
            corpus_embs.append(p.embedding)
        else:
            corpus_embs.append(compute_embedding(f"{p.title} {p.abstract}"))
            
    sims = calculate_semantic_similarity(q_emb, corpus_embs)
    
    scored = []
    for idx, paper in enumerate(papers):
        scored.append((sims[idx], paper))
        
    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:10]]
