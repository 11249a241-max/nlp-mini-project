from typing import Tuple, Dict

COMPLAINT_CATEGORY_RULES: Dict[str, Dict[str, list]] = {
    "Laboratories": {
        "subcategories": ["Hardware Failure", "Software Missing", "AC & Ventilation", "Lab Assistant Support", "Equipment Shortage"],
        "keywords": ["lab", "practical", "computer", "pc", "monitor", "compiler", "instrument", "oscilloscope", "workbench", "device", "setup"]
    },
    "Academics": {
        "subcategories": ["Syllabus Coverage", "Grading Discrepancy", "Exam Scheduling", "Course Material", "Practical Sessions"],
        "keywords": ["syllabus", "exam", "course", "curriculum", "lecture", "test", "credits", "programming concept", "grade", "marks", "attendance", "practical sessions", "academic"]
    },
    "Faculty": {
        "subcategories": ["Teaching Quality", "Availability", "Punctuality", "Doubt Clearing", "Communication"],
        "keywords": ["faculty", "professor", "teacher", "sir", "madam", "staff", "lecturer", "explaining", "speed", "guidance", "mentor"]
    },
    "Internet and Wi-Fi": {
        "subcategories": ["Campus Wi-Fi", "Hostel Wi-Fi", "Portal Access", "Speed & Bandwidth", "Firewall Restrictions"],
        "keywords": ["wifi", "wi-fi", "internet", "network", "bandwidth", "speed", "login portal", "router", "connection", "disconnect"]
    },
    "Infrastructure": {
        "subcategories": ["Classroom Facilities", "Restrooms", "Water Coolers", "Electricity / Power", "Elevators"],
        "keywords": ["bench", "fan", "light", "ac", "restroom", "toilet", "washroom", "drinking water", "cooler", "lift", "elevator", "building", "classroom"]
    },
    "Library": {
        "subcategories": ["Book Availability", "Digital Library", "Study Space", "Timings", "Librarian Assistance"],
        "keywords": ["library", "book", "journal", "reading hall", "borrow", "card", "fine", "quiet", "textbook"]
    },
    "Transportation": {
        "subcategories": ["Bus Timings", "Route Coverage", "Bus Condition", "Pass Issuance", "Driver Conduct"],
        "keywords": ["bus", "transport", "shuttle", "route", "driver", "punctual", "conveyance", "stop", "morning bus"]
    },
    "Hostel": {
        "subcategories": ["Mess Food", "Room Maintenance", "Hot Water", "Warden & Curfew", "Cleanliness"],
        "keywords": ["hostel", "mess", "food", "dinner", "lunch", "room", "warden", "curfew", "hot water", "laundry"]
    },
    "Administration": {
        "subcategories": ["Fee Payment", "Scholarships", "Certificate Issuance", "ID Cards", "Admission Office"],
        "keywords": ["admin", "office", "clerk", "fee", "receipt", "bonafide", "certificate", "id card", "counter", "scholarship", "refund"]
    }
}

DISCUSSION_CATEGORIES: Dict[str, list] = {
    "Artificial Intelligence": ["ai", "machine learning", "ml", "deep learning", "neural", "nlp", "computer vision", "transformer", "llm", "cnn", "classification"],
    "Programming": ["python", "java", "c++", "javascript", "code", "function", "array", "algorithm", "syntax", "oop", "recursion", "pointer"],
    "Database Management": ["sql", "database", "query", "mysql", "postgresql", "mongodb", "normalization", "nosql", "table", "foreign key", "acid"],
    "Mathematics": ["matrix", "calculus", "probability", "linear algebra", "statistics", "discrete", "eigenvalue", "graph theory"],
    "Computer Networks": ["tcp", "ip", "udp", "osi", "router", "switch", "protocol", "lan", "dns", "http", "packet"],
    "Operating Systems": ["os", "process", "thread", "deadlock", "linux", "kernel", "scheduling", "semaphore", "virtual memory", "paging"]
}

def classify_complaint(text: str) -> Tuple[str, str]:
    """
    Classifies a student's complaint into primary category and subcategory
    using NLP keyword scoring.
    """
    if not text:
        return "Academics", "General"
        
    lower_text = text.lower()
    best_category = "Academics"
    best_score = 0
    best_subcat = "General"
    
    for category, meta in COMPLAINT_CATEGORY_RULES.items():
        score = sum(1 for kw in meta["keywords"] if kw in lower_text)
        if score > best_score:
            best_score = score
            best_category = category
            
    # Determine subcategory
    subcats = COMPLAINT_CATEGORY_RULES.get(best_category, {}).get("subcategories", ["General"])
    # Match most relevant subcategory or pick first
    best_subcat = subcats[0]
    for sub in subcats:
        words = sub.lower().split()
        if any(w in lower_text for w in words):
            best_subcat = sub
            break
            
    return best_category, best_subcat

def classify_discussion(title: str, content: str) -> str:
    """Classifies an academic discussion question into its most appropriate domain."""
    combined = (title + " " + content).lower()
    best_cat = "General Academics"
    max_matches = 0
    
    for cat, kws in DISCUSSION_CATEGORIES.items():
        matches = sum(1 for kw in kws if kw in combined)
        if matches > max_matches:
            max_matches = matches
            best_cat = cat
            
    return best_cat
