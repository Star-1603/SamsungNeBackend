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
