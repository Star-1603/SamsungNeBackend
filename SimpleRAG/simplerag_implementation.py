# -*- coding: utf-8 -*-
"""SimpleRAG_Implementation.py"""

# Install required packages (run these commands in your terminal or environment)
# pip install langchain langchain_core langchain_community langserve sentence_transformers chromadb
# pip install langchain-huggingface bitsandbytes huggingface_hub faiss-gpu jq pandas

from langchain_huggingface import HuggingFaceEndpoint
import os
import json
import jq
from langchain_community.document_loaders import JSONLoader
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pandas as pd

# Set Hugging Face API token
key = os.getenv("HUGGINGFACEHUB_API_TOKEN")
if not key:
    raise ValueError("Please set the HUGGINGFACEHUB_API_TOKEN environment variable.")

os.environ["HUGGINGFACEHUB_API_TOKEN"] = key

# Initialize Hugging Face LLM
repo_id = 'mistralai/Mistral-7B-Instruct-v0.3'
llm = HuggingFaceEndpoint(repo_id=repo_id, huggingfacehub_api_token=key, max_new_tokens=1200, temperature=0.9)

# Load JSON data
with open('fine_tune_data_original.json', 'r') as f:
    data = json.load(f)

# Load JSON data using JSONLoader
loader = JSONLoader(
    file_path='fine_tune_data_original.json',
    jq_schema='.[] | {instruction: .instruction, input: .input, output: .output}',  # Combine content
    text_content=False
)
data = loader.load()

st_model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode documents
documents = [doc.page_content for doc in data]
embeddings = st_model.encode(documents)

# Initialize FAISS index
dimension = len(embeddings[0])
index = faiss.IndexFlatL2(dimension)
embedding_array = np.array(embeddings).astype('float32')
index.add(embedding_array)

# Define dynamic search function
def dynamic_search(query_text, top_k=3, metric="L2"):
    query_embedding = st_model.encode([query_text])[0].astype('float32')
    if metric == "cosine":
        faiss.normalize_L2(embedding_array)
        faiss.normalize_L2(np.array([query_embedding]))

    distances, indices = index.search(np.array([query_embedding]), top_k)

    results = [
        {"document": documents[idx], "distance": distances[0][i]}
        for i, idx in enumerate(indices[0])
    ]
    return results

# Example search query
parameter = list(("NULL", "WARN", "INFO"))
x = int(input("Select what to return: 1. WARN, 2. INFO\n"))
query = f"""Find logs with {parameter[x]} levels"""

top_k_results = int(input("How many results do you want?\n"))
distance_metric = "cosine"
search_results = dynamic_search(query, top_k=top_k_results, metric=distance_metric)

print("Query Results:")
for result in search_results:
    print(f"- Document: {result['document']} (Distance: {result['distance']:.2f})")

# Load Hadoop log data
file_path = 'Hadoop_2k.log_structured.csv'
log_data = pd.read_csv(file_path)

# Display the first few rows
print(log_data.head())

# Create search text column
log_data['search_text'] = log_data.apply(
    lambda row: f"Timestamp: {row['Date']} | Log Level: {row['Level']} | Message: {row['Content']}", axis=1
)

print(log_data[['search_text']].head())

# Encode Hadoop log data
documentshadoop = log_data['search_text'].tolist()
embeddings = st_model.encode(documentshadoop)

# Example search query for Hadoop logs