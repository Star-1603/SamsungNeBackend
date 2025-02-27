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
    st_model = SentenceTransformer(model_name)

    def encode_chunk(chunk):
        """Encodes a chunk of texts."""
        return st_model.encode(chunk)

    chunks = [texts[i:i + chunk_size] for i in range(0, len(texts), chunk_size)]

    all_embeddings = []
    with ThreadPoolExecutor(max_threads) as executor:
        futures = [executor.submit(encode_chunk, chunk) for chunk in chunks]
        for future in futures:
            all_embeddings.append(future.result())

    embeddings = np.vstack(all_embeddings)

    return embeddings
