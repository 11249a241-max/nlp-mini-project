from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import User, Complaint, ComplaintAnalysis
from app.schemas.schemas import ComplaintCreate, ComplaintOut, ComplaintStatusUpdate
from app.middleware.auth import get_current_user, require_faculty
from app.nlp.classification import classify_complaint
from app.nlp.sentiment import analyze_sentiment, extract_aspect_sentiments
from app.nlp.preprocessing import extract_keywords

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintOut)
def submit_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    combined_text = f"{complaint_in.title} {complaint_in.raw_text}"
    
    # 1. NLP Classification
    category, subcategory = classify_complaint(combined_text)
    
    # 2. NLP Sentiment Analysis & Priority Determination
    sentiment_data = analyze_sentiment(combined_text)
    
    # 3. Aspect-Based Sentiments
    aspects = extract_aspect_sentiments(combined_text)
    
    # 4. Keyword Extraction
    keywords = extract_keywords(combined_text, top_n=6)
    
    # Create Complaint
    complaint = Complaint(
        student_id=current_user.id,
        title=complaint_in.title,
        raw_text=complaint_in.raw_text,
        status="Submitted"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    # Create Analysis Record
    analysis = ComplaintAnalysis(
        complaint_id=complaint.id,
        category=category,
        subcategory=subcategory,
        sentiment=sentiment_data["sentiment"],
        sentiment_score=sentiment_data["sentiment_score"],
        priority_level=sentiment_data["priority_level"],
        keywords=keywords,
        aspect_sentiments=aspects
    )
    db.add(analysis)
    db.commit()
    db.refresh(complaint)
    
    return ComplaintOut(
        id=complaint.id,
        student_id=complaint.student_id,
        student_name=current_user.full_name,
        title=complaint.title,
        raw_text=complaint.raw_text,
        status=complaint.status,
        faculty_response=complaint.faculty_response,
        created_at=complaint.created_at,
        analysis=analysis
    )

@router.get("", response_model=List[ComplaintOut])
def list_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "FACULTY":
        complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    else:
        complaints = db.query(Complaint).filter(Complaint.student_id == current_user.id).order_by(Complaint.created_at.desc()).all()
    
    results = []
    for c in complaints:
        results.append(ComplaintOut(
            id=c.id,
            student_id=c.student_id,
            student_name=c.student.full_name if c.student else "Student",
            title=c.title,
            raw_text=c.raw_text,
            status=c.status,
            faculty_response=c.faculty_response,
            created_at=c.created_at,
            analysis=c.analysis
        ))
    return results

@router.get("/analytics")
def get_complaint_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_faculty)):
    total = db.query(Complaint).count()
    pending = db.query(Complaint).filter(Complaint.status.in_(["Submitted", "Under Review", "In Progress"])).count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    
    # Sentiment distribution
    sentiment_counts = db.query(
        ComplaintAnalysis.sentiment, func.count(ComplaintAnalysis.id)
    ).group_by(ComplaintAnalysis.sentiment).all()
    sentiment_dist = [{"name": s[0] or "Neutral", "value": s[1]} for s in sentiment_counts]
    
    # Category distribution
    cat_counts = db.query(
        ComplaintAnalysis.category, func.count(ComplaintAnalysis.id)
    ).group_by(ComplaintAnalysis.category).all()
    category_dist = [{"category": c[0] or "General", "count": c[1]} for c in cat_counts]
    
    # Priority breakdown
    priority_counts = db.query(
        ComplaintAnalysis.priority_level, func.count(ComplaintAnalysis.id)
    ).group_by(ComplaintAnalysis.priority_level).all()
    priority_dist = [{"priority": p[0] or "Medium", "count": p[1]} for p in priority_counts]
    
    # Recurring keywords
    analyses = db.query(ComplaintAnalysis).all()
    kw_freq = {}
    for a in analyses:
        for kw in (a.keywords or []):
            kw_freq[kw] = kw_freq.get(kw, 0) + 1
    recurring_keywords = sorted([{"keyword": k, "count": v} for k, v in kw_freq.items()], key=lambda x: x["count"], reverse=True)[:8]

    # Department-wise statistics
    dept_complaints = db.query(
        User.department_id, func.count(Complaint.id)
    ).join(Complaint, Complaint.student_id == User.id).group_by(User.department_id).all()
    
    dept_stats = []
    for dept_id, count in dept_complaints:
        dept_name = "General"
        if dept_id and current_user.department:
            dept_name = current_user.department.name
        dept_stats.append({"department": dept_name, "count": count})

    return {
        "total_complaints": total,
        "pending_complaints": pending,
        "resolved_complaints": resolved,
        "sentiment_distribution": sentiment_dist,
        "category_distribution": category_dist,
        "priority_distribution": priority_dist,
        "recurring_keywords": recurring_keywords,
        "department_distribution": dept_stats
    }

@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
def update_complaint_status(complaint_id: int, status_in: ComplaintStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_faculty)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
        
    complaint.status = status_in.status
    if status_in.faculty_response:
        complaint.faculty_response = status_in.faculty_response
        
    db.commit()
    db.refresh(complaint)
    return ComplaintOut(
        id=complaint.id,
        student_id=complaint.student_id,
        student_name=complaint.student.full_name if complaint.student else "Student",
        title=complaint.title,
        raw_text=complaint.raw_text,
        status=complaint.status,
        faculty_response=complaint.faculty_response,
        created_at=complaint.created_at,
        analysis=complaint.analysis
    )
