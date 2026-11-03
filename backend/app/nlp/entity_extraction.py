import re
from typing import Dict, Any, List

# Date matching patterns: e.g. 15th March 2026, 2026-03-15, 15/03/2026, March 15, 2026
DATE_REGEX = re.compile(
    r"\b(?:\d{1,2}(?:st|nd|rd|th)?[\s/-](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s/-]\d{2,4}"
    r"|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}"
    r"|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
    r"|\d{4}-\d{2}-\d{2})\b",
    re.IGNORECASE
)

DEADLINE_KEYWORDS = ["deadline", "last date", "due date", "submission date", "latest by", "on or before", "closes on", "registrations close"]
DEPARTMENTS = [
    "Computer Science and Engineering", "Information Technology", "Electronics and Communication",
    "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering",
    "Artificial Intelligence and Data Science", "Biotechnology", "Management Studies"
]

def extract_dates_and_deadlines(text: str) -> List[Dict[str, str]]:
    """Extracts explicit dates and associates them with deadline or event contexts."""
    if not text:
        return []
        
    lines = text.split("\n")
    found_deadlines = []
    
    for line in lines:
        dates_in_line = DATE_REGEX.findall(line)
        if dates_in_line:
            is_deadline = any(dk in line.lower() for dk in DEADLINE_KEYWORDS)
            for d in dates_in_line:
                label = "Important Deadline" if is_deadline else "Referenced Date"
                # Extract surrounding context snippet
                context = line.strip()
                if len(context) > 120:
                    context = context[:117] + "..."
                found_deadlines.append({
                    "date": d,
                    "type": label,
                    "context": context
                })
                
    # Remove duplicate date entries
    unique_deadlines = []
    seen = set()
    for item in found_deadlines:
        key = (item["date"].lower(), item["type"])
        if key not in seen:
            seen.add(key)
            unique_deadlines.append(item)
            
    return unique_deadlines

def extract_notice_entities(text: str) -> Dict[str, Any]:
    """
    Extracts structured entities: Departments, Deadlines, Fees, Circular Numbers, and Regulation IDs.
    """
    if not text:
        return {"departments": [], "deadlines": [], "fees": [], "regulations": [], "circular_refs": []}
        
    lower_text = text.lower()
    
    # 1. Departments mentioned
    matched_depts = [d for d in DEPARTMENTS if d.lower() in lower_text or any(part.lower() in lower_text for part in d.split() if len(part) > 4)]
    
    # 2. Deadlines
    deadlines = extract_dates_and_deadlines(text)
    
    # 3. Fees and monetary figures (e.g. Rs. 500, ₹1200, $50)
    fee_matches = re.findall(r"(?:Rs\.?|INR|₹|\$)\s*\d+(?:,\d{3})*(?:\.\d{2})?", text, re.IGNORECASE)
    
    # 4. Circular and Regulation codes (e.g. CIR/2026/04, REG-R20, REF: CSE/EXAM/2026/01)
    circular_refs = re.findall(r"\b(?:CIR|REF|REG|NO|NOT|CIRCULAR)[\s:/-]+[A-Z0-9/-]{3,20}\b", text, re.IGNORECASE)
    
    return {
        "departments": list(dict.fromkeys(matched_depts)),
        "deadlines": deadlines,
        "fees": list(dict.fromkeys(fee_matches)),
        "circular_refs": list(dict.fromkeys(circular_refs))
    }
