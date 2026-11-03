import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    users = relationship("User", back_populates="department")
    notices = relationship("Notice", back_populates="department")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "STUDENT" or "FACULTY"
    identifier = Column(String(50), nullable=True)  # Roll Number or Faculty ID
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="users")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="student", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="faculty")
    discussions = relationship("Discussion", back_populates="user", cascade="all, delete-orphan")
    answers = relationship("DiscussionAnswer", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("AcademicDocument", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    abstract = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(JSON, default=list)  # list of strings
    main_objectives = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="projects")
    similarity_result = relationship("ProjectSimilarityResult", back_populates="project", uselist=False, cascade="all, delete-orphan")
    embedding = relationship("ProjectEmbedding", back_populates="project", uselist=False, cascade="all, delete-orphan")


class ProjectSimilarityResult(Base):
    __tablename__ = "project_similarity_results"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    textual_similarity_score = Column(Float, default=0.0)
    semantic_similarity_score = Column(Float, default=0.0)
    overall_similarity_score = Column(Float, default=0.0)
    top_matches = Column(JSON, default=list)  # list of similar projects metadata
    matching_keywords = Column(JSON, default=list)
    similarity_explanations = Column(JSON, default=list)
    innovation_suggestions = Column(JSON, default=list)
    faculty_review_notes = Column(Text, nullable=True)
    faculty_status = Column(String(50), default="Pending Review")  # "Pending Review", "Approved", "Revision Needed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="similarity_result")


class ProjectEmbedding(Base):
    __tablename__ = "project_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    embedding_vector = Column(JSON, nullable=False)  # list of floats
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="embedding")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted")  # "Submitted", "Under Review", "In Progress", "Resolved"
    faculty_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("User", back_populates="complaints")
    analysis = relationship("ComplaintAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")


class ComplaintAnalysis(Base):
    __tablename__ = "complaint_analysis"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True, nullable=False)
    category = Column(String(100), default="General")
    subcategory = Column(String(100), default="General")
    sentiment = Column(String(20), default="Neutral")  # "Positive", "Neutral", "Negative"
    sentiment_score = Column(Float, default=0.0)  # -1.0 to +1.0
    priority_level = Column(String(20), default="Medium")  # "Low", "Medium", "High", "Critical"
    keywords = Column(JSON, default=list)
    aspect_sentiments = Column(JSON, default=list)
    similar_complaint_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="analysis")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="General Announcement")  # Examination, Circular, Event, Internship, etc.
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    file_path = Column(String(255), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    publication_date = Column(DateTime, default=datetime.datetime.utcnow)
    important_deadlines = Column(JSON, default=list)
    extracted_entities = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    faculty = relationship("User", back_populates="notices")
    department = relationship("Department", back_populates="notices")
    chunks = relationship("NoticeChunk", back_populates="notice", cascade="all, delete-orphan")


class NoticeChunk(Base):
    __tablename__ = "notice_chunks"

    id = Column(Integer, primary_key=True, index=True)
    notice_id = Column(Integer, ForeignKey("notices.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    embedding = Column(JSON, nullable=True)

    notice = relationship("Notice", back_populates="chunks")


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General Academics")
    tags = Column(JSON, default=list)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="discussions")
    answers = relationship("DiscussionAnswer", back_populates="discussion", cascade="all, delete-orphan")


class DiscussionAnswer(Base):
    __tablename__ = "discussion_answers"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_faculty_verified = Column(Boolean, default=False)
    votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    discussion = relationship("Discussion", back_populates="answers")
    user = relationship("User", back_populates="answers")


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    authors = Column(String(255), default="Academic Researchers")
    abstract = Column(Text, nullable=False)
    publication_year = Column(Integer, default=2024)
    domain = Column(String(100), nullable=False, index=True)
    keywords = Column(JSON, default=list)
    potential_extensions = Column(JSON, default=list)
    url = Column(String(255), nullable=True)
    embedding = Column(JSON, nullable=True)


class AcademicDocument(Base):
    __tablename__ = "academic_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    document_type = Column(String(50), default="PDF")
    num_pages = Column(Integer, default=1)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentEmbedding", back_populates="document", cascade="all, delete-orphan")


class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("academic_documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    embedding = Column(JSON, nullable=True)

    document = relationship("AcademicDocument", back_populates="chunks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
