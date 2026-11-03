from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = Field(..., pattern="^(STUDENT|FACULTY)$")
    identifier: Optional[str] = None  # Roll Number or Faculty ID
    department_id: Optional[int] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=5)
    abstract: str = Field(..., min_length=20)
    description: str = Field(..., min_length=30)
    technologies: List[str] = Field(default_factory=list)
    main_objectives: str = Field(..., min_length=15)

class ProjectSimilarItem(BaseModel):
    project_id: Optional[int] = None
    title: str
    abstract: str
    technologies: List[str] = []
    student_name: str = "Anonymous"
    textual_similarity: float
    semantic_similarity: float
    overall_similarity: float
    matching_keywords: List[str] = []

class ProjectSimilarityReport(BaseModel):
    id: Optional[int] = None
    project_id: int
    textual_similarity_score: float
    semantic_similarity_score: float
    overall_similarity_score: float
    top_matches: List[ProjectSimilarItem] = []
    matching_keywords: List[str] = []
    similarity_explanations: List[str] = []
    innovation_suggestions: List[str] = []
    faculty_review_notes: Optional[str] = None
    faculty_status: str = "Pending Review"
    disclaimer: str = "Similarity scores are indicators for academic review and do not automatically imply plagiarism."

class ProjectOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    title: str
    abstract: str
    description: str
    technologies: List[str] = []
    main_objectives: str
    status: str
    created_at: datetime
    similarity_result: Optional[ProjectSimilarityReport] = None

    class Config:
        from_attributes = True

class ProjectReviewUpdate(BaseModel):
    faculty_status: str  # "Approved", "Revision Needed", "Pending Review"
    faculty_review_notes: Optional[str] = None

# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5)
    raw_text: str = Field(..., min_length=10)

class ComplaintAnalysisOut(BaseModel):
    id: int
    complaint_id: int
    category: str
    subcategory: str
    sentiment: str
    sentiment_score: float
    priority_level: str
    keywords: List[str] = []
    aspect_sentiments: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class ComplaintOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    title: str
    raw_text: str
    status: str
    faculty_response: Optional[str] = None
    created_at: datetime
    analysis: Optional[ComplaintAnalysisOut] = None

    class Config:
        from_attributes = True

class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Submitted|Under Review|In Progress|Resolved)$")
    faculty_response: Optional[str] = None

# --- Notice Schemas ---
class NoticeOut(BaseModel):
    id: int
    faculty_id: int
    faculty_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    summary: Optional[str] = None
    publication_date: datetime
    important_deadlines: List[Dict[str, Any]] = []
    extracted_entities: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class NoticeAskRequest(BaseModel):
    question: str = Field(..., min_length=3)

# --- Assistant Schemas ---
class ChatMessage(BaseModel):
    sender: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None
    citations: Optional[List[Dict[str, Any]]] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)

class ChatResponse(BaseModel):
    reply: str
    is_grounded: bool = False
    citations: List[Dict[str, Any]] = []

# --- Discussion Schemas ---
class AnswerCreate(BaseModel):
    content: str = Field(..., min_length=3)

class AnswerOut(BaseModel):
    id: int
    discussion_id: int
    user_id: int
    user_name: str
    user_role: str
    content: str
    is_faculty_verified: bool
    votes: int
    created_at: datetime

    class Config:
        from_attributes = True

class DiscussionCreate(BaseModel):
    title: str = Field(..., min_length=5)
    content: str = Field(..., min_length=10)
    category: Optional[str] = None
    tags: List[str] = []

class DiscussionOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_role: str
    title: str
    content: str
    category: str
    tags: List[str] = []
    is_resolved: bool
    created_at: datetime
    answers_count: int = 0
    answers: List[AnswerOut] = []

    class Config:
        from_attributes = True

# --- Research Schemas ---
class ResearchPaperOut(BaseModel):
    id: int
    title: str
    authors: str
    abstract: str
    publication_year: int
    domain: str
    keywords: List[str] = []
    potential_extensions: List[str] = []
    url: Optional[str] = None

    class Config:
        from_attributes = True

class ResearchSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    domain: Optional[str] = None
