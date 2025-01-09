from langchain_huggingface import HuggingFaceEndpoint
import os
import json
from langchain_community.document_loaders import JSONLoader
from embeding import generate_embeddings

# Set Hugging Face API token
key = 

# Initialize Hugging Face LLM
repo_id = 'mistralai/Mistral-7B-Instruct-v0.3'
llm = HuggingFaceEndpoint(repo_id=repo_id, huggingfacehub_api_token=key, max_new_tokens=1200, temperature=0.9)

# Load JSON data
# with open('fine_tune_data_original.json', 'r') as f:
#     raw_data = json.load(f)

# # Load JSON data using JSONLoader
# loader = JSONLoader(
#     file_path='fine_tune_data_original.json',
#     jq_schema='.[] | {instruction: .instruction, input: .input, output: .output}',  # Combine content
#     text_content=False
# )
# processed_data = loader.load()

# # Extract text content for embedding
# documents = [doc.page_content for doc in processed_data]

# # Generate embeddings for the documents
# document_embeddings = generate_embeddings(documents)

# Test with a sample input text
sample_text = ["This is a test sentence to generate embedding."]
sample_embedding = generate_embeddings(sample_text)

print("Sample Embedding for Test Sentence:", sample_embedding)
