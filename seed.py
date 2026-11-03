from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models.models import (
    Department, User, Project, ProjectSimilarityResult, ProjectEmbedding,
    Complaint, ComplaintAnalysis, Notice, Discussion, DiscussionAnswer, ResearchPaper
)
from app.utils.security import get_password_hash
from app.nlp.embeddings import compute_embedding
from app.nlp.rag import rag_service
from app.nlp.summarization import summarize_text

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).count() > 0:
        db.close()
        return

    print("Seeding CampusMind AI database...")

    # 1. Departments
    dept_cs = Department(name="Computer Science and Engineering", code="CSE", description="Department of CSE")
    dept_ai = Department(name="Artificial Intelligence and Data Science", code="AI&DS", description="Department of AI and Data Science")
    dept_ece = Department(name="Electronics and Communication", code="ECE", description="Department of ECE")
    db.add_all([dept_cs, dept_ai, dept_ece])
    db.commit()

    # 2. Users
    student = User(
        email="student@campusmind.edu",
        full_name="Alex Rivera",
        hashed_password=get_password_hash("password123"),
        role="STUDENT",
        identifier="2024CS101",
        department_id=dept_cs.id,
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=AlexRivera"
    )
    faculty = User(
        email="faculty@campusmind.edu",
        full_name="Dr. Eleanor Vance",
        hashed_password=get_password_hash("password123"),
        role="FACULTY",
        identifier="FAC-CSE-8802",
        department_id=dept_cs.id,
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=EleanorVance"
    )
    db.add_all([student, faculty])
    db.commit()

    # 3. Existing Project Repository (for similarity engine comparisons)
    sample_projects = [
        {
            "title": "Plant Disease Classification Using CNN",
            "abstract": "This project utilizes deep convolutional neural networks (VGG16 and ResNet50) to classify foliar diseases in tomato and potato crops from leaf images. The model was trained on the PlantVillage dataset achieving 96% accuracy in controlled conditions.",
            "description": "Deep learning model trained with PyTorch using image augmentation, transfer learning, and cross-entropy loss to diagnose early blight, late blight, and leaf mold.",
            "tech": ["Python", "PyTorch", "OpenCV", "CNN", "ResNet50"],
            "objectives": "Automate leaf pathology detection and reduce agricultural crop losses."
        },
        {
            "title": "Leaf Infection Detection Using Machine Learning",
            "abstract": "An image-processing pipeline extracting GLCM texture and color histogram features from agricultural leaves. Random Forest and Support Vector Machines classify fungal vs bacterial infections.",
            "description": "Classical feature extraction approach using OpenCV for leaf segmentation, background subtraction, and scikit-learn classifier training with 88% cross-validation accuracy.",
            "tech": ["Python", "scikit-learn", "OpenCV", "Random Forest", "SVM"],
            "objectives": "Provide low-compute pathogen recognition for agricultural extension workers."
        },
        {
            "title": "Crop Disease Prediction Using Image Processing",
            "abstract": "Smartphone based crop health monitoring applying image filtering, morphological contours, and K-Means color clustering to identify pest infestations and leaf scorch in maize fields.",
            "description": "Android-connected mobile client transmitting captured leaf photographs to a Flask web service for contour area infection ratio computation.",
            "tech": ["Android", "Flask", "OpenCV", "Image Processing"],
            "objectives": "Real-time crop damage estimation on handheld mobile devices."
        },
        {
            "title": "Automated Brain Tumor Segmentation on MRI Scans",
            "abstract": "A 3D U-Net deep learning architecture for multi-class glioma sub-region segmentation on BraTS multi-parametric magnetic resonance imaging scans.",
            "description": "Implementation of volumetric convolutional networks with dice loss optimization and deep supervision across T1, T2, and FLAIR modality sequences.",
            "tech": ["Python", "PyTorch", "SimpleITK", "3D U-Net", "Medical Imaging"],
            "objectives": "Delineate enhancing tumor and peritumoral edema boundaries to aid neurosurgeons."
        },
        {
            "title": "Decentralized Academic Credential Verification on Ethereum",
            "abstract": "A smart contract framework issuing tamper-proof verifiable digital diplomas and transcripts on an EVM blockchain, eliminating forged academic credentials.",
            "description": "Solidity smart contracts storing IPFS document hashes with cryptographic signatures from accredited university registrars.",
            "tech": ["Solidity", "Ethereum", "IPFS", "Web3.js", "React"],
            "objectives": "Provide instant cryptographic validation of student degrees for international employers."
        }
    ]

    for sp in sample_projects:
        p = Project(
            student_id=student.id,
            title=sp["title"],
            abstract=sp["abstract"],
            description=sp["description"],
            technologies=sp["tech"],
            main_objectives=sp["objectives"],
            status="Archived in Repository"
        )
        db.add(p)
        db.commit()
        db.refresh(p)

        full_p_text = f"{p.title} {p.abstract} {p.description}"
        emb = compute_embedding(full_p_text)
        p_emb = ProjectEmbedding(project_id=p.id, embedding_vector=emb)
        db.add(p_emb)

        sim_res = ProjectSimilarityResult(
            project_id=p.id,
            textual_similarity_score=25.0,
            semantic_similarity_score=35.0,
            overall_similarity_score=31.0,
            top_matches=[],
            matching_keywords=["classification", "detection", "learning"],
            similarity_explanations=["Verified archival repository entry."],
            innovation_suggestions=["Expand test sets with field lighting variation."],
            faculty_status="Approved"
        )
        db.add(sim_res)
    db.commit()

    # 4. Seed Complaints
    complaints_data = [
        {
            "title": "Insufficient practical sessions for programming concepts",
            "text": "The practical sessions in the computer science lab are insufficient, and students cannot understand programming concepts properly. We need more hands-on lab hours and guidance from teaching assistants.",
            "category": "Academics",
            "subcat": "Practical Sessions",
            "sentiment": "Negative",
            "score": -0.65,
            "priority": "High",
            "status": "In Progress"
        },
        {
            "title": "Frequent Wi-Fi disconnections in 3rd Floor Library",
            "text": "The campus Wi-Fi constantly drops connections on the 3rd floor study hall. It makes downloading research papers and watching recorded lectures impossible.",
            "category": "Internet and Wi-Fi",
            "subcat": "Campus Wi-Fi",
            "sentiment": "Negative",
            "score": -0.70,
            "priority": "Medium",
            "status": "Under Review"
        },
        {
            "title": "Appreciation for the new robotics hardware in AI Lab",
            "text": "The recently installed GPU workstations and robotic arm kits in the AI Lab are excellent. The lab assistants were very helpful in setting up PyTorch environments.",
            "category": "Laboratories",
            "subcat": "Lab Assistant Support",
            "sentiment": "Positive",
            "score": 0.85,
            "priority": "Low",
            "status": "Resolved"
        },
        {
            "title": "Late arrival of Route 4 Morning Campus Bus",
            "text": "Route 4 shuttle bus has been arriving 25 minutes late for three consecutive days, causing students to miss attendance in their 8:30 AM lectures.",
            "category": "Transportation",
            "subcat": "Bus Timings",
            "sentiment": "Negative",
            "score": -0.55,
            "priority": "Medium",
            "status": "Submitted"
        }
    ]

    for cd in complaints_data:
        comp = Complaint(
            student_id=student.id,
            title=cd["title"],
            raw_text=cd["text"],
            status=cd["status"]
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)

        analysis = ComplaintAnalysis(
            complaint_id=comp.id,
            category=cd["category"],
            subcategory=cd["subcat"],
            sentiment=cd["sentiment"],
            sentiment_score=cd["score"],
            priority_level=cd["priority"],
            keywords=["programming", "sessions", "lab", "network", "hardware"],
            aspect_sentiments=[{"aspect": cd["category"], "sentiment": cd["sentiment"], "score": cd["score"]}]
        )
        db.add(analysis)
    db.commit()

    # 5. University Notices
    notices_data = [
        {
            "title": "End-Semester Examination Registration & Hall Ticket Circular",
            "category": "Examination",
            "description": (
                "Official Circular: All undergraduate and postgraduate engineering students must complete examination form submission "
                "for the upcoming Spring 2026 End-Semester Examinations on or before 15th April 2026. "
                "The examination fee of Rs. 1200 must be remitted via the student portal. "
                "Hall tickets will be released on 20th April 2026. Practical examinations commence on 25th April 2026."
            ),
            "deadlines": [
                {"date": "15th April 2026", "type": "Important Deadline", "context": "Last date for examination registration form submission and fee payment."},
                {"date": "20th April 2026", "type": "Referenced Date", "context": "Hall ticket release on student portal."},
                {"date": "25th April 2026", "type": "Important Deadline", "context": "Commencement of practical laboratory examinations."}
            ],
            "entities": {
                "departments": ["Computer Science and Engineering", "Electronics and Communication"],
                "fees": ["Rs. 1200"],
                "circular_refs": ["CIR/EXAM/2026/04"]
            }
        },
        {
            "title": "Summer AI & Cloud Computing Internship Announcements",
            "category": "Internship",
            "description": (
                "Department of Computer Science invites applications for the 8-week Summer AI Research Internship. "
                "Students with a minimum GPA of 7.5 and proficiency in Python, Machine Learning, and Cloud services are eligible. "
                "Selected interns will receive a monthly stipend of Rs. 15,000. Registrations close on 30th April 2026."
            ),
            "deadlines": [
                {"date": "30th April 2026", "type": "Important Deadline", "context": "Internship application registration deadline."}
            ],
            "entities": {
                "departments": ["Computer Science and Engineering", "Artificial Intelligence and Data Science"],
                "fees": ["Rs. 15,000"],
                "circular_refs": ["NOT/INT/2026/12"]
            }
        }
    ]

    for nd in notices_data:
        notice = Notice(
            faculty_id=faculty.id,
            title=nd["title"],
            category=nd["category"],
            description=nd["description"],
            summary=summarize_text(nd["description"], max_sentences=3),
            important_deadlines=nd["deadlines"],
            extracted_entities=nd["entities"],
            publication_date=datetime.utcnow() - timedelta(days=2)
        )
        db.add(notice)
        db.commit()
        db.refresh(notice)
        # Register in RAG service
        rag_service.index_document(f"notice_{notice.id}", notice.title, [{"page_number": 1, "chunk_index": 0, "text": nd["description"]}])

    # 6. Seed Research Papers
    research_seeds = [
        {
            "title": "Transformers in Healthcare: Diagnostic Reasoning and Clinical EHR Modeling",
            "authors": "Dr. E. Vance, Dr. R. Patel",
            "domain": "Healthcare",
            "abstract": "We explore the clinical adaptation of transformer architectures for multi-modal patient telemetry and automated medical report generation, examining model calibration under high data sparsity.",
            "keywords": ["Transformer", "Clinical NLP", "EHR", "Healthcare AI"],
            "extensions": [
                "Investigate differential privacy bounds during federated fine-tuning across hospital clusters.",
                "Incorporate clinician-in-the-loop interactive reinforcement learning for treatment recommendation sanity checks."
            ]
        },
        {
            "title": "Self-Supervised Vision Transformers for Aerial Agricultural Crop Health Assessment",
            "authors": "K. Sundaram, L. Chen",
            "domain": "Agriculture",
            "abstract": "Unmanned aerial vehicles (UAVs) capture high-resolution multispectral imagery of crop canopies. We demonstrate self-supervised pretraining (DINOv2) to identify water-stress and soil nutrient deficiencies.",
            "keywords": ["UAV", "Agriculture", "Vision Transformer", "Self-Supervised"],
            "extensions": [
                "Pair hyperspectral bands with edge TPU micro-controllers for real-time spray actuation.",
                "Combine canopy NDVI vegetation indices with subsurface soil moisture sensors."
            ]
        },
        {
            "title": "Mitigating Adversarial Prompt Injections in Retrieval-Augmented LLM Systems",
            "authors": "M. Al-Hassan, S. Gupta",
            "domain": "Cybersecurity",
            "abstract": "Retrieval-Augmented Generation (RAG) pipelines are susceptible to poisoned document injection. We propose semantic boundary gating and perplexity anomaly filtering to secure vector retrieval.",
            "keywords": ["RAG", "Prompt Injection", "Cybersecurity", "Defensive AI"],
            "extensions": [
                "Implement homomorphic encryption across external vector databases.",
                "Build dynamic canary token detection for sensitive data exfiltration attempts."
            ]
        },
        {
            "title": "Low-Resource Cross-Lingual Knowledge Transfer for Educational Chatbots",
            "authors": "A. Sharma, J. Gomez",
            "domain": "Education Technology",
            "abstract": "Educational support systems often fail in multilingual university environments. We develop parameter-efficient LoRA adapters for Hindi, Spanish, and English bilingual tutoring assistants.",
            "keywords": ["EdTech", "Cross-Lingual", "LoRA", "Conversational AI"],
            "extensions": [
                "Deploy speech-to-speech phonetic synthesis for low-latency voice doubt resolution.",
                "Incorporate Socratic questioning pedagogical heuristics rather than direct answer dumps."
            ]
        }
    ]

    for rs in research_seeds:
        paper = ResearchPaper(
            title=rs["title"],
            authors=rs["authors"],
            domain=rs["domain"],
            abstract=rs["abstract"],
            keywords=rs["keywords"],
            potential_extensions=rs["extensions"],
            embedding=compute_embedding(f"{rs['title']} {rs['abstract']}")
        )
        db.add(paper)
    db.commit()

    # 7. Seed Discussions
    disc1 = Discussion(
        user_id=student.id,
        title="What is the optimal learning rate and optimizer for fine-tuning BERT on student feedback?",
        content="I am working on fine-tuning bert-base-uncased for multi-class complaint classification. Should I use AdamW with a warmup schedule or RMSprop? Also what learning rate is recommended?",
        category="Artificial Intelligence",
        tags=["BERT", "Transformers", "Hyperparameters", "PyTorch"]
    )
    db.add(disc1)
    db.commit()
    db.refresh(disc1)

    ans1 = DiscussionAnswer(
        discussion_id=disc1.id,
        user_id=faculty.id,
        content="For transformer models like BERT, always prefer AdamW over standard Adam or RMSprop because of decoupled weight decay. Recommended learning rate is between 2e-5 and 5e-5 with a linear warmup over the first 10% of total training steps.",
        is_faculty_verified=True,
        votes=5
    )
    db.add(ans1)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
