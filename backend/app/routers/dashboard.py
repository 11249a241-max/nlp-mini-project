from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import User, Project, ProjectSimilarityResult, Complaint, ComplaintAnalysis, Notice, Discussion
from app.middleware.auth import get_current_user, require_faculty, require_student

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/student")
def get_student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    # 1. Project stats
    my_projects = db.query(Project).filter(Project.student_id == current_user.id).order_by(Project.created_at.desc()).all()
    total_projects = len(my_projects)
    
    latest_project = my_projects[0] if my_projects else None
    latest_sim_score = None
    if latest_project and latest_project.similarity_result:
        latest_sim_score = {
            "title": latest_project.title,
            "overall_similarity": latest_project.similarity_result.overall_similarity_score,
            "faculty_status": latest_project.similarity_result.faculty_status,
            "top_match_title": latest_project.similarity_result.top_matches[0]["title"] if latest_project.similarity_result.top_matches else "None"
        }
        
    # 2. Complaint stats
    my_complaints = db.query(Complaint).filter(Complaint.student_id == current_user.id).all()
    total_complaints = len(my_complaints)
    pending_complaints = sum(1 for c in my_complaints if c.status != "Resolved")
    
    # 3. Discussion stats
    my_discussions = db.query(Discussion).filter(Discussion.user_id == current_user.id).count()
    
    # 4. Recent Notices
    recent_notices = db.query(Notice).order_by(Notice.publication_date.desc()).limit(4).all()
    notices_data = [{
        "id": n.id,
        "title": n.title,
        "category": n.category,
        "summary": n.summary,
        "publication_date": n.publication_date,
        "important_deadlines": n.important_deadlines or []
    } for n in recent_notices]
    
    # 5. Project History
    project_history = [{
        "id": p.id,
        "title": p.title,
        "status": p.status,
        "created_at": p.created_at,
        "similarity_score": p.similarity_result.overall_similarity_score if p.similarity_result else 0.0,
        "faculty_status": p.similarity_result.faculty_status if p.similarity_result else "Pending"
    } for p in my_projects[:5]]

    return {
        "user_name": current_user.full_name,
        "role": current_user.role,
        "identifier": current_user.identifier,
        "total_projects": total_projects,
        "latest_similarity": latest_sim_score,
        "total_complaints": total_complaints,
        "pending_complaints": pending_complaints,
        "active_discussions": my_discussions,
        "recent_notices": notices_data,
        "project_history": project_history
    }

@router.get("/faculty")
def get_faculty_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_faculty)):
    # 1. Project stats
    total_projects = db.query(Project).count()
    awaiting_review = db.query(ProjectSimilarityResult).filter(ProjectSimilarityResult.faculty_status == "Pending Review").count()
    
    # 2. Complaint stats
    total_complaints = db.query(Complaint).count()
    pending_complaints = db.query(Complaint).filter(Complaint.status.in_(["Submitted", "Under Review", "In Progress"])).count()
    
    # 3. Notices & Discussions
    total_notices = db.query(Notice).count()
    total_discussions = db.query(Discussion).count()
    
    # 4. Sentiment analytics from actual DB records
    sentiment_counts = db.query(
        ComplaintAnalysis.sentiment, func.count(ComplaintAnalysis.id)
    ).group_by(ComplaintAnalysis.sentiment).all()
    sentiment_dist = [{"name": s[0] or "Neutral", "value": s[1]} for s in sentiment_counts]
    
    # 5. Category analytics
    category_counts = db.query(
        ComplaintAnalysis.category, func.count(ComplaintAnalysis.id)
    ).group_by(ComplaintAnalysis.category).all()
    category_dist = [{"category": c[0] or "General", "count": c[1]} for c in category_counts]
    
    # 6. Similarity trends
    all_sims = db.query(ProjectSimilarityResult.overall_similarity_score).all()
    sim_buckets = {"0-25%": 0, "26-50%": 0, "51-75%": 0, "76-100%": 0}
    for (s,) in all_sims:
        score = s or 0.0
        if score <= 25:
            sim_buckets["0-25%"] += 1
        elif score <= 50:
            sim_buckets["26-50%"] += 1
        elif score <= 75:
            sim_buckets["51-75%"] += 1
        else:
            sim_buckets["76-100%"] += 1
    similarity_trends = [{"range": k, "count": v} for k, v in sim_buckets.items()]
    
    # 7. Recent projects needing review
    recent_projects = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    projects_list = [{
        "id": p.id,
        "title": p.title,
        "student_name": p.student.full_name if p.student else "Student",
        "overall_similarity": p.similarity_result.overall_similarity_score if p.similarity_result else 0.0,
        "faculty_status": p.similarity_result.faculty_status if p.similarity_result else "Pending Review",
        "created_at": p.created_at
    } for p in recent_projects]

    return {
        "faculty_name": current_user.full_name,
        "total_projects": total_projects,
        "awaiting_review": awaiting_review,
        "total_complaints": total_complaints,
        "pending_complaints": pending_complaints,
        "total_notices": total_notices,
        "total_discussions": total_discussions,
        "sentiment_distribution": sentiment_dist,
        "category_distribution": category_dist,
        "similarity_trends": similarity_trends,
        "recent_projects": projects_list
    }
