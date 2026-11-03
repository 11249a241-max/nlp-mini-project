from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import User, Discussion, DiscussionAnswer
from app.schemas.schemas import DiscussionCreate, DiscussionOut, AnswerCreate, AnswerOut
from app.middleware.auth import get_current_user
from app.nlp.classification import classify_discussion
from app.nlp.embeddings import compute_embedding
from app.nlp.similarity import calculate_semantic_similarity
from app.nlp.summarization import summarize_text

router = APIRouter(prefix="/discussions", tags=["Discussions"])

@router.post("", response_model=DiscussionOut)
def create_discussion(disc_in: DiscussionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Automatic category classification if not explicitly provided
    category = disc_in.category
    if not category or category == "Auto-Detect":
        category = classify_discussion(disc_in.title, disc_in.content)
        
    discussion = Discussion(
        user_id=current_user.id,
        title=disc_in.title,
        content=disc_in.content,
        category=category,
        tags=disc_in.tags or [category]
    )
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    
    return DiscussionOut(
        id=discussion.id,
        user_id=discussion.user_id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        title=discussion.title,
        content=discussion.content,
        category=discussion.category,
        tags=discussion.tags or [],
        is_resolved=discussion.is_resolved,
        created_at=discussion.created_at,
        answers_count=0,
        answers=[]
    )

@router.get("", response_model=List[DiscussionOut])
def list_discussions(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Discussion)
    if category and category != "All":
        query = query.filter(Discussion.category == category)
    discussions = query.order_by(Discussion.created_at.desc()).all()
    
    output = []
    for d in discussions:
        ans_list = []
        for a in d.answers:
            ans_list.append(AnswerOut(
                id=a.id,
                discussion_id=a.discussion_id,
                user_id=a.user_id,
                user_name=a.user.full_name if a.user else "User",
                user_role=a.user.role if a.user else "STUDENT",
                content=a.content,
                is_faculty_verified=a.is_faculty_verified,
                votes=a.votes,
                created_at=a.created_at
            ))
        output.append(DiscussionOut(
            id=d.id,
            user_id=d.user_id,
            user_name=d.user.full_name if d.user else "Anonymous",
            user_role=d.user.role if d.user else "STUDENT",
            title=d.title,
            content=d.content,
            category=d.category,
            tags=d.tags or [],
            is_resolved=d.is_resolved,
            created_at=d.created_at,
            answers_count=len(d.answers),
            answers=ans_list
        ))
    return output

@router.post("/{discussion_id}/answers", response_model=AnswerOut)
def post_answer(discussion_id: int, ans_in: AnswerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion topic not found.")
        
    is_faculty = (current_user.role == "FACULTY")
    answer = DiscussionAnswer(
        discussion_id=discussion.id,
        user_id=current_user.id,
        content=ans_in.content,
        is_faculty_verified=is_faculty,
        votes=1 if is_faculty else 0
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    
    return AnswerOut(
        id=answer.id,
        discussion_id=answer.discussion_id,
        user_id=answer.user_id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        content=answer.content,
        is_faculty_verified=answer.is_faculty_verified,
        votes=answer.votes,
        created_at=answer.created_at
    )

@router.patch("/{discussion_id}/resolve")
def toggle_resolve_status(discussion_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found.")
        
    if current_user.role != "FACULTY" and discussion.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only topic author or faculty can mark resolved.")
        
    discussion.is_resolved = not discussion.is_resolved
    db.commit()
    return {"id": discussion.id, "is_resolved": discussion.is_resolved}

@router.get("/{discussion_id}/summary")
def summarize_discussion_thread(discussion_id: int, db: Session = Depends(get_db)):
    """NLP Summarizer for lengthy discussion threads."""
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found.")
        
    full_thread = f"Question: {discussion.title}\n{discussion.content}\n\n"
    for a in discussion.answers:
        verified_tag = " (Faculty Verified Answer)" if a.is_faculty_verified else ""
        full_thread += f"Response{verified_tag}: {a.content}\n"
        
    summary = summarize_text(full_thread, max_sentences=3)
    return {
        "discussion_id": discussion_id,
        "title": discussion.title,
        "summary": summary
    }
