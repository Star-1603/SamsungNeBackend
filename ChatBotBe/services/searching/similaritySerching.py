from pymilvus import MilvusClient
from concurrent.futures import ThreadPoolExecutor
from sentence_transformers import SentenceTransformer
import numpy as np

def generate_embeddings(texts, model_name='all-MiniLM-L6-v2', max_threads=4, chunk_size=100):
    """
    Generates embeddings for the provided texts using a SentenceTransformer model with multithreading.

    Args:
        texts (list of str): A list of input texts to encode.
        model_name (str): The name of the SentenceTransformer model to use. Defaults to 'all-MiniLM-L6-v2'.
        max_threads (int): Maximum number of threads to use. Defaults to 4.
        chunk_size (int): The size of each chunk to process in a thread. Defaults to 100.

    Returns:
        np.ndarray: An array of embeddings corresponding to the input texts.
    """
    # Initialize the Sentence Transformer model
    st_model = SentenceTransformer(model_name)

    def encode_chunk(chunk):
        """Encodes a chunk of texts."""
        return st_model.encode(chunk)

    # Divide the texts into chunks
    chunks = [texts[i:i + chunk_size] for i in range(0, len(texts), chunk_size)]

    # Use ThreadPoolExecutor for multithreading
    all_embeddings = []
    with ThreadPoolExecutor(max_threads) as executor:
        futures = [executor.submit(encode_chunk, chunk) for chunk in chunks]
        for future in futures:
            # Append each chunk of embeddings (as a NumPy array)
            all_embeddings.append(future.result())

    # Concatenate all embeddings into a single NumPy array
    embeddings = np.vstack(all_embeddings)

    # Debugging information
    print("Embeddings Shape:", embeddings.shape)
    print("Embeddings Type:", type(embeddings))
    print("Embeddings Data Type:", embeddings.dtype)

    return embeddings

# Initialize Milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

def similarity_search(client, collection_name, query_text, top_k=3):
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
        limit=top_k
    )

    # Print the results
    print(f"Top {top_k} results:")
    for i, hits in enumerate(results):
        for hit in hits:
            print(f"Result {i + 1}: ID = {hit['id']}, Distance = {hit['distance']}")
    return results

# Example query
query_text = "Timestamp: 2015-07-29 17:41:41,719\nLog Level: INFO\nMessage: New election. My id =  1, proposed zxid=0x0, Configuration update: New election. My id =  1, proposed zxid=0x0."
test = similarity_search(client, "log_search_collection", query_text)
