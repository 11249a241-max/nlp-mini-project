import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.config import settings
from app.models.models import User, Notice, NoticeChunk
from app.schemas.schemas import NoticeOut, NoticeAskRequest
from app.middleware.auth import get_current_user, require_faculty
from app.nlp.rag import extract_pdf_pages, chunk_document_pages, rag_service
from app.nlp.summarization import summarize_text
from app.nlp.entity_extraction import extract_notice_entities
from app.nlp.embeddings import compute_embedding

router = APIRouter(prefix="/notices", tags=["Notices"])

@router.post("/upload", response_model=NoticeOut)
async def upload_notice(
    title: str = Form(...),
    description: Optional[str] = Form(""),
    category: str = Form("General Announcement"),
    department_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    faculty_user: User = Depends(require_faculty)
):
    saved_file_path = None
    file_name = None
    file_size = 0
    extracted_text = description or ""
    
    if file:
        file_name = file.filename
        dest_folder = os.path.join(settings.UPLOAD_DIR, "notices")
        safe_name = f"{int(datetime.utcnow().timestamp())}_{file_name}"
        saved_file_path = os.path.join(dest_folder, safe_name)
        
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(saved_file_path)
        
        # If PDF, extract full content using PyMuPDF
        if file_name.lower().endswith(".pdf"):
            pages = extract_pdf_pages(saved_file_path)
            extracted_text += "\n" + "\n".join([p["text"] for p in pages])
            
    # 1. NLP Summarization
    summary = summarize_text(extracted_text, max_sentences=4)
    
    # 2. NLP Entity & Deadline Extraction
    entities = extract_notice_entities(extracted_text)
    deadlines = entities.get("deadlines", [])
    
    # 3. Create Notice DB record
    notice = Notice(
        faculty_id=faculty_user.id,
        title=title,
        description=description,
        category=category,
        department_id=department_id or faculty_user.department_id,
        file_path=saved_file_path,
        file_name=file_name,
        file_size=file_size,
        summary=summary,
        important_deadlines=deadlines,
        extracted_entities=entities
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    
    # 4. Chunk & Index in RAG / FAISS
    if file_name and file_name.lower().endswith(".pdf") and saved_file_path:
        pages = extract_pdf_pages(saved_file_path)
        chunks = chunk_document_pages(pages, chunk_size=350)
        for c in chunks:
            chunk_db = NoticeChunk(
                notice_id=notice.id,
                chunk_text=c["text"],
                page_number=c["page_number"],
                chunk_index=c["chunk_index"],
                embedding=compute_embedding(c["text"])
            )
            db.add(chunk_db)
        db.commit()
        # Index in Academic RAG Service
        rag_service.index_document(f"notice_{notice.id}", notice.title, chunks)
    elif extracted_text:
        # Index raw description
        chunk_data = [{"page_number": 1, "chunk_index": 0, "text": extracted_text}]
        rag_service.index_document(f"notice_{notice.id}", notice.title, chunk_data)
        
    return notice

@router.get("", response_model=List[NoticeOut])
def get_notices(category: Optional[str] = None, department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Notice)
    if category and category != "All":
        query = query.filter(Notice.category == category)
    if department_id:
        query = query.filter(Notice.department_id == department_id)
        
    notices = query.order_by(Notice.publication_date.desc()).all()
    results = []
    for n in notices:
        results.append(NoticeOut(
            id=n.id,
            faculty_id=n.faculty_id,
            faculty_name=n.faculty.full_name if n.faculty else "Administration",
            title=n.title,
            description=n.description,
            category=n.category,
            department_id=n.department_id,
            department_name=n.department.name if n.department else "All Departments",
            file_path=n.file_path,
            file_name=n.file_name,
            summary=n.summary,
            publication_date=n.publication_date,
            important_deadlines=n.important_deadlines or [],
            extracted_entities=n.extracted_entities or {},
            created_at=n.created_at
        ))
    return results

@router.post("/ask")
def ask_notice_query(req: NoticeAskRequest, db: Session = Depends(get_db)):
    """
    NLP Question answering grounded strictly on official notices.
    """
    # If FAISS index is empty in current process, warm it up from DB
    if rag_service.index_manager.index.ntotal == 0:
        notices = db.query(Notice).all()
        for n in notices:
            text = n.description or n.summary or n.title
            if text:
                rag_service.index_document(f"notice_{n.id}", n.title, [{"page_number": 1, "chunk_index": 0, "text": text}])

    answer_result = rag_service.answer_query(req.question, top_k=3)
    return {
        "question": req.question,
        "answer": answer_result["answer"],
        "is_grounded": answer_result["is_grounded"],
        "citations": answer_result["citations"]
    }
