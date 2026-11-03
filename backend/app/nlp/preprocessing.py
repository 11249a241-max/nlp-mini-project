import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer

# Ensure resources are downloaded
try:
    _stopwords = set(stopwords.words("english"))
except Exception:
    _stopwords = {"the", "a", "an", "is", "in", "it", "of", "and", "or", "for", "on", "to", "with", "at", "by", "from"}

try:
    _lemmatizer = WordNetLemmatizer()
except Exception:
    _lemmatizer = None

def clean_text(text: str) -> str:
    """Removes URLs, special characters, and extra whitespaces."""
    if not text:
        return ""
    text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def tokenize_sentences(text: str) -> list[str]:
    """Splits text into sentences."""
    cleaned = clean_text(text)
    if not cleaned:
        return []
    try:
        return sent_tokenize(cleaned)
    except Exception:
        return [s.strip() for s in re.split(r"[.!?]+", cleaned) if s.strip()]

def preprocess_text(text: str, remove_stop: bool = True, lemmatize: bool = True) -> str:
    """
    Standard NLP preprocessing pipeline:
    lowercasing, punctuation stripping, tokenization, stopword removal, lemmatization.
    """
    if not text:
        return ""
    text = clean_text(text).lower()
    # Strip punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))
    
    try:
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()

    result = []
    for token in tokens:
        if remove_stop and token in _stopwords:
            continue
        if len(token) <= 1:
            continue
        if lemmatize and _lemmatizer:
            try:
                token = _lemmatizer.lemmatize(token)
            except Exception:
                pass
        result.append(token)
        
    return " ".join(result)

def extract_keywords(text: str, top_n: int = 8) -> list[str]:
    """Extracts prominent keywords based on term frequency and length."""
    tokens = preprocess_text(text).split()
    if not tokens:
        return []
    freq = {}
    for t in tokens:
        if len(t) > 3:
            freq[t] = freq.get(t, 0) + 1
    sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [k for k, _ in sorted_keywords[:top_n]]
