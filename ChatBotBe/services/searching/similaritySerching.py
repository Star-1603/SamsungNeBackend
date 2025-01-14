from pymilvus import MilvusClient
import numpy as np
from services.rag.embeding import generate_embeddings
from db.client import get_milvus_client

client = get_milvus_client()

def similarity_search(collection_name="log_search_collection2", query_text="nothing", top_k=5):
    """
    Perform similarity search in Milvus for a given query text.

    Args:
        client (MilvusClient): The initialized Milvus client.
        collection_name (str): The name of the collection to search.
        query_text (str): The query text to encode and search.
        top_k (int): The number of nearest neighbors to retrieve.

    Returns:
        list: The search results.
    """
    # Generate embedding for the query text
    query_embedding = generate_embeddings([query_text])[0].astype('float32')

    # Search parameters for Milvus
    search_params = {
        "metric_type": "COSINE",  # Change to "COSINE" if using cosine similarity
        "params": {"ef": 64}  # `ef` is a hyperparameter for HNSW
    }

    # Perform Basic ANN search
    results = client.search(
        collection_name=collection_name,
        data=[query_embedding],  # Wrap query embedding in a list
        anns_field="embedding",  # The field name used for embeddings
        search_params=search_params,  # Correct parameter name
        limit=top_k,
        output_fields=["meatadata"]
    )

    metadata_results = []

    for i, hits in enumerate(results):
        for hit in hits:
            metadata = hit["entity"]
            metadata_json = metadata["meatadata"]
            metadata_results.append(metadata_json)

    # for debug
    # # Print the results
    # print(f"Top {top_k} results with metadata:")
    # for i, result in enumerate(metadata_results):
    #     print(f"Result {i + 1}: {result}")

    return metadata_results