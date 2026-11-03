import unittest
import sys
import os
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.database import SessionLocal
from app.models.models import AcademicDocument, DocumentEmbedding, User
from app.nlp.embeddings import compute_embedding

class TestCampusMindAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_student_authentication(self):
        res = self.client.post("/api/auth/login", json={
            "email": "student@campusmind.edu",
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "STUDENT")

        # Test auth/me with bearer token
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        me_res = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "student@campusmind.edu")

    def test_assistant_only_retrieves_current_users_documents(self):
        private_text = "Confidential key: jade lighthouse 739. This detail belongs only to one student."
        question = "What confidential key is written in my uploaded document?"
        db = SessionLocal()
        document_id = None
        try:
            student = db.query(User).filter(User.email == "student@campusmind.edu").first()
            self.assertIsNotNone(student)
            document = AcademicDocument(
                user_id=student.id,
                title="Privacy regression test",
                file_path="test.pdf",
            )
            db.add(document)
            db.flush()
            document_id = document.id
            db.add(DocumentEmbedding(
                document_id=document.id,
                chunk_text=private_text,
                page_number=1,
                chunk_index=0,
                embedding=compute_embedding(private_text),
            ))
            db.commit()

            for email, expected_access in (
                ("student@campusmind.edu", True),
                ("faculty@campusmind.edu", False),
            ):
                login_res = self.client.post("/api/auth/login", json={
                    "email": email,
                    "password": "password123",
                })
                headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
                chat_res = self.client.post("/api/assistant/chat", json={"message": question}, headers=headers)
                self.assertEqual(chat_res.status_code, 200)
                if expected_access:
                    self.assertIn("jade lighthouse 739", chat_res.json()["reply"])
                else:
                    self.assertNotIn("jade lighthouse 739", chat_res.json()["reply"])
        finally:
            if document_id is not None:
                db.query(DocumentEmbedding).filter(DocumentEmbedding.document_id == document_id).delete()
                db.query(AcademicDocument).filter(AcademicDocument.id == document_id).delete()
                db.commit()
            db.close()

    def test_faculty_authentication_and_role_protection(self):
        # 1. Login as Student
        student_res = self.client.post("/api/auth/login", json={
            "email": "student@campusmind.edu",
            "password": "password123"
        })
        student_token = student_res.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # Student trying to access faculty dashboard MUST receive 403 Forbidden
        restricted_res = self.client.get("/api/dashboard/faculty", headers=student_headers)
        self.assertEqual(restricted_res.status_code, 403)

        # 2. Login as Faculty
        faculty_res = self.client.post("/api/auth/login", json={
            "email": "faculty@campusmind.edu",
            "password": "password123"
        })
        self.assertEqual(faculty_res.status_code, 200)
        faculty_token = faculty_res.json()["access_token"]
        faculty_headers = {"Authorization": f"Bearer {faculty_token}"}

        # Faculty accessing faculty dashboard MUST succeed (200 OK)
        fac_dash = self.client.get("/api/dashboard/faculty", headers=faculty_headers)
        self.assertEqual(fac_dash.status_code, 200)
        self.assertIn("total_projects", fac_dash.json())
        self.assertIn("sentiment_distribution", fac_dash.json())

    def test_project_similarity_endpoints(self):
        student_res = self.client.post("/api/auth/login", json={
            "email": "student@campusmind.edu",
            "password": "password123"
        })
        headers = {"Authorization": f"Bearer {student_res.json()['access_token']}"}

        # Analyze draft (without storing)
        payload = {
            "title": "Autonomous Drone Weed Identification",
            "abstract": "Applying deep convolutional neural networks to classify weed species in agricultural sugarcane fields.",
            "description": "Uses OpenCV image thresholding and MobileNetV2 architecture for real-time edge processing.",
            "technologies": ["Python", "OpenCV", "TensorFlow", "MobileNet"],
            "main_objectives": "Locate weed infestations with high spatial accuracy."
        }
        res = self.client.post("/api/projects/analyze", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("overall_similarity_score", data)
        self.assertIn("innovation_suggestions", data)

    def test_complaint_submission(self):
        student_res = self.client.post("/api/auth/login", json={
            "email": "student@campusmind.edu",
            "password": "password123"
        })
        headers = {"Authorization": f"Bearer {student_res.json()['access_token']}"}

        payload = {
            "title": "Campus Wi-Fi connectivity in cafeteria",
            "raw_text": "The internet connection keeps dropping in the main cafeteria during lunch hours. It is very slow and disconnects constantly."
        }
        res = self.client.post("/api/complaints", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        complaint = res.json()
        self.assertEqual(complaint["analysis"]["category"], "Internet and Wi-Fi")
        self.assertEqual(complaint["analysis"]["sentiment"], "Negative")

    def test_notice_qa(self):
        res = self.client.post("/api/notices/ask", json={
            "question": "What is the last date for examination registration form submission?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("answer", data)
        self.assertIn("15th April 2026", data["answer"])

    def test_research_search(self):
        res = self.client.post("/api/research/search", json={
            "query": "clinical transformer EHR modeling",
            "domain": "Healthcare"
        })
        self.assertEqual(res.status_code, 200)
        papers = res.json()
        self.assertGreater(len(papers), 0)
        self.assertEqual(papers[0]["domain"], "Healthcare")

if __name__ == "__main__":
    unittest.main()
