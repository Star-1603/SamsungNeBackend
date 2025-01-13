import faiss
import numpy as np
from services.rag.embeding import generate_embeddings

def dynamic_search(query_text, top_k=3, metric="L2"):
    query_embedding = generate_embeddings(query_text)
    if metric == "cosine":
        faiss.normalize_L2(embedding_array)
        faiss.normalize_L2(np.array([query_embedding]))

    distances, indices = index.search(np.array([query_embedding]), top_k)

    results = [
        {"document": documents[idx], "distance": distances[0][i]}
        for i, idx in enumerate(indices[0])
    ]
    return results