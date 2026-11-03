import faiss
import numpy as np
from typing import List, Dict, Any, Tuple

class FAISSIndexManager:
    """Manages an in-memory or persisted FAISS index for high-speed dense vector retrieval."""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        # Use IndexFlatIP for cosine similarity on normalized vectors
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata: List[Dict[str, Any]] = []
        
    def add_vectors(self, vectors: List[List[float]], metadata_list: List[Dict[str, Any]]):
        """Adds normalized vector embeddings and their corresponding metadata."""
        if not vectors:
            return
        arr = np.array(vectors, dtype=np.float32)
        # Ensure vectors are normalized for inner-product to equal cosine similarity
        faiss.normalize_L2(arr)
        self.index.add(arr)
        self.metadata.extend(metadata_list)
        
    def search(self, query_vector: List[float], top_k: int = 5, min_score: float = 0.25) -> List[Dict[str, Any]]:
        """Searches index and returns top matches above min_score."""
        if self.index.ntotal == 0:
            return []
            
        q_arr = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(q_arr)
        
        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(q_arr, k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(self.metadata) and score >= min_score:
                item = dict(self.metadata[idx])
                item["similarity_score"] = round(float(score), 4)
                results.append(item)
                
        return results

    def clear(self):
        self.index.reset()
        self.metadata.clear()
