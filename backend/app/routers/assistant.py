import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.config import settings
from app.models.models import User, AcademicDocument, DocumentEmbedding
from app.schemas.schemas import ChatRequest, ChatResponse
from app.middleware.auth import get_current_user
from app.nlp.rag import extract_pdf_pages, chunk_document_pages, AcademicRAGService
from app.nlp.summarization import summarize_text
from app.nlp.embeddings import compute_embedding

router = APIRouter(prefix="/assistant", tags=["Academic Assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    chat_in: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Context-aware question answering with citation retrieval."""
    rag_service = AcademicRAGService()
    documents = db.query(AcademicDocument).filter(AcademicDocument.user_id == current_user.id).all()
    vectors = []
    metadata = []
    for document in documents:
        for chunk in document.chunks:
            if chunk.embedding:
                vectors.append(chunk.embedding)
                metadata.append({
                    "doc_id": f"user_doc_{document.id}",
                    "doc_title": document.title,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.chunk_text,
                })
    rag_service.index_manager.add_vectors(vectors, metadata)
    result = rag_service.answer_query(chat_in.message, top_k=3)
    return ChatResponse(
        reply=result["answer"],
        is_grounded=result["is_grounded"],
        citations=result["citations"]
    )

@router.post("/upload")
async def upload_academic_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF academic documents are supported.")
        
    dest_folder = os.path.join(settings.UPLOAD_DIR, "assistant")
    safe_name = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(dest_folder, safe_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract pages with PyMuPDF
    pages = extract_pdf_pages(file_path)
    if not pages:
        raise HTTPException(status_code=400, detail="Could not extract readable text from the uploaded PDF.")
        
    full_text = "\n".join([p["text"] for p in pages])
    summary = summarize_text(full_text, max_sentences=4)
    
    doc = AcademicDocument(
        user_id=current_user.id,
        title=file.filename,
        file_path=file_path,
        document_type="PDF",
        num_pages=len(pages),
        summary=summary
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Chunk and embed
    chunks = chunk_document_pages(pages, chunk_size=350)
    for c in chunks:
        doc_emb = DocumentEmbedding(
            document_id=doc.id,
            chunk_text=c["text"],
            page_number=c["page_number"],
            chunk_index=c["chunk_index"],
            embedding=compute_embedding(c["text"])
        )
        db.add(doc_emb)
    db.commit()
    
    return {
        "document_id": doc.id,
        "title": doc.title,
        "num_pages": doc.num_pages,
        "summary": doc.summary,
        "message": f"Document '{doc.title}' successfully indexed with {len(chunks)} searchable semantic passages. You can now ask questions about it!"
    }

@router.get("/history")
def get_assistant_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieves list of user's uploaded academic documents and summaries."""
    docs = db.query(AcademicDocument).filter(AcademicDocument.user_id == current_user.id).order_by(AcademicDocument.created_at.desc()).all()
    return [{
        "id": d.id,
        "title": d.title,
        "document_type": d.document_type,
        "num_pages": d.num_pages,
        "summary": d.summary,
        "created_at": d.created_at
    } for d in docs]
