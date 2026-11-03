from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import User, Project, ProjectSimilarityResult, ProjectEmbedding
from app.schemas.schemas import ProjectCreate, ProjectOut, ProjectSimilarityReport, ProjectReviewUpdate
from app.middleware.auth import get_current_user, require_faculty
from app.nlp.similarity import analyze_project_similarity

router = APIRouter(prefix="/projects", tags=["Projects"])

def _get_corpus_projects(db: Session, exclude_id: Optional[int] = None) -> List[dict]:
    query = db.query(Project)
    if exclude_id:
        query = query.filter(Project.id != exclude_id)
    projects = query.all()
    
    corpus = []
    for p in projects:
        emb = p.embedding.embedding_vector if p.embedding else None
        corpus.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract,
            "description": p.description,
            "technologies": p.technologies or [],
            "student_name": p.student.full_name if p.student else "Anonymous",
            "embedding": emb
        })
    return corpus

@router.post("", response_model=ProjectOut)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Fetch existing project corpus for similarity detection
    existing_corpus = _get_corpus_projects(db)
    
    # 2. Run NLP similarity engine
    submitted_dict = {
        "title": project_in.title,
        "abstract": project_in.abstract,
        "description": project_in.description,
        "technologies": project_in.technologies
    }
    analysis = analyze_project_similarity(submitted_dict, existing_corpus)
    
    # 3. Save Project
    project = Project(
        student_id=current_user.id,
        title=project_in.title,
        abstract=project_in.abstract,
        description=project_in.description,
        technologies=project_in.technologies,
        main_objectives=project_in.main_objectives,
        status="Under Faculty Review" if analysis["overall_similarity_score"] > 60 else "Approved for Review"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # 4. Save Embedding Vector
    proj_emb = ProjectEmbedding(
        project_id=project.id,
        embedding_vector=analysis["query_embedding"]
    )
    db.add(proj_emb)
    
    # 5. Save Similarity Result
    sim_result = ProjectSimilarityResult(
        project_id=project.id,
        textual_similarity_score=analysis["textual_similarity_score"],
        semantic_similarity_score=analysis["semantic_similarity_score"],
        overall_similarity_score=analysis["overall_similarity_score"],
        top_matches=analysis["top_matches"],
        matching_keywords=analysis["matching_keywords"],
        similarity_explanations=analysis["similarity_explanations"],
        innovation_suggestions=analysis["innovation_suggestions"],
        faculty_status="Pending Review"
    )
    db.add(sim_result)
    db.commit()
    db.refresh(project)
    
    return ProjectOut(
        id=project.id,
        student_id=project.student_id,
        student_name=current_user.full_name,
        title=project.title,
        abstract=project.abstract,
        description=project.description,
        technologies=project.technologies or [],
        main_objectives=project.main_objectives,
        status=project.status,
        created_at=project.created_at,
        similarity_result=project.similarity_result
    )

@router.post("/analyze")
def analyze_project_draft(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Live preview of similarity analysis before permanent submission."""
    existing_corpus = _get_corpus_projects(db)
    submitted_dict = {
        "title": project_in.title,
        "abstract": project_in.abstract,
        "description": project_in.description,
        "technologies": project_in.technologies
    }
    analysis = analyze_project_similarity(submitted_dict, existing_corpus)
    return {
        "textual_similarity_score": analysis["textual_similarity_score"],
        "semantic_similarity_score": analysis["semantic_similarity_score"],
        "overall_similarity_score": analysis["overall_similarity_score"],
        "top_matches": analysis["top_matches"],
        "matching_keywords": analysis["matching_keywords"],
        "similarity_explanations": analysis["similarity_explanations"],
        "innovation_suggestions": analysis["innovation_suggestions"]
    }

@router.get("", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "FACULTY":
        projects = db.query(Project).order_by(Project.created_at.desc()).all()
    else:
        # Students see their own projects by default
        projects = db.query(Project).filter(Project.student_id == current_user.id).order_by(Project.created_at.desc()).all()
    
    results = []
    for p in projects:
        results.append(ProjectOut(
            id=p.id,
            student_id=p.student_id,
            student_name=p.student.full_name if p.student else "Anonymous",
            title=p.title,
            abstract=p.abstract,
            description=p.description,
            technologies=p.technologies or [],
            main_objectives=p.main_objectives,
            status=p.status,
            created_at=p.created_at,
            similarity_result=p.similarity_result
        ))
    return results

@router.get("/{project_id}/similarity-report", response_model=ProjectSimilarityReport)
def get_similarity_report(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    if current_user.role == "STUDENT" and project.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this project report.")
        
    if not project.similarity_result:
        raise HTTPException(status_code=404, detail="Similarity report not yet generated.")
        
    return project.similarity_result

@router.patch("/{project_id}/review", response_model=ProjectSimilarityReport)
def review_project(project_id: int, review_in: ProjectReviewUpdate, db: Session = Depends(get_db), faculty_user: User = Depends(require_faculty)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.similarity_result:
        raise HTTPException(status_code=404, detail="Project or similarity report not found.")
        
    project.similarity_result.faculty_status = review_in.faculty_status
    if review_in.faculty_review_notes:
        project.similarity_result.faculty_review_notes = review_in.faculty_review_notes
        
    if review_in.faculty_status == "Approved":
        project.status = "Approved by Faculty"
    elif review_in.faculty_status == "Revision Needed":
        project.status = "Revision Requested"
        
    db.commit()
    db.refresh(project.similarity_result)
    return project.similarity_result
