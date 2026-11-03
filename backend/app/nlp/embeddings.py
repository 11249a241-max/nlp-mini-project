import numpy as np
from typing import List

_model = None

def get_sentence_transformer():
    """Load the model from cache, downloading it when it is not cached."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Using standard, lightweight 384-dim all-MiniLM-L6-v2 from local cache
            try:
                _model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            except Exception:
                _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"Warning: SentenceTransformer loading failed: {e}. Falling back to TF-IDF pseudo-embeddings.")
            _model = False
    return _model

def compute_embedding(text: str) -> List[float]:
    """Computes a normalized embedding vector for a single string."""
    model = get_sentence_transformer()
    if model:
        emb = model.encode(text, normalize_embeddings=True)
        return emb.tolist()
    else:
        # Fallback hash-based normalized vector for offline/test environments
        np.random.seed(abs(hash(text)) % (2**32))
        vec = np.random.randn(384).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

def compute_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Computes normalized embeddings for a list of strings."""
    if not texts:
        return []
    model = get_sentence_transformer()
    if model:
        embs = model.encode(texts, normalize_embeddings=True)
        return [e.tolist() for e in embs]
    else:
        return [compute_embedding(t) for t in texts]
