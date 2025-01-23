import json
from flask import Blueprint, jsonify, request
from langchain_community.document_loaders import JSONLoader
from services.LLM.mistral import analyze_dataset, preprocess_query
from services.rag.embeding import generate_embeddings
from db.vector import connect_milvus
from models.schemas.embedingSchema import create_milvus_collection
from db.client import get_milvus_client
from models.schemas.embedingSchema import insert_data
from services.searching.similaritySerching import similarity_search
import os

main = Blueprint('main', __name__)

connect_milvus(host="127.0.0.1", port="19530")
collection_name = "log_search_collection2"
dim = 384
collection = create_milvus_collection(collection_name, dim)

@main.route('/')
def home():
    try:
        return "<p>hi</p>", 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/analyze', methods=['POST'])
def analyze():
    user_query = request.json.get('query')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400
    
    processed_query = preprocess_query(user_query)
    print(f"Preprocessed Query: {processed_query}")

    try:
        data = similarity_search(query_text=processed_query)
        str = f"users Quary: {user_query}, data of Network Elements from db: {data}"
        response = analyze_dataset(str)

        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)

    try:
        # Load JSON data
        loader = JSONLoader(
            file_path=file_path,
            jq_schema='.[] | {instruction: .instruction, input: .input, output: .output}',
            text_content=False
        )
        data = loader.load()

        print(f"First document: {data[0]}")

        documents = [doc.page_content for doc in data]
        print("Number of documents:", len(documents))

        if documents:
            embeddings = generate_embeddings(documents, max_threads=8, chunk_size=200)
            print("Embeddings shape:", embeddings.shape)

            if len(embeddings) > 0 and len(embeddings[0]) != 384:
                raise ValueError("Embedding dimensions do not match the defined schema (384).")

            client = get_milvus_client() 
        else:
            print("No documents found for embedding generation.")

        for doc, embedding in zip(data, embeddings):
            page_content = json.loads(doc.page_content)
            metadata = {
                "instruction": page_content.get("instruction"),
                "input": page_content.get("input"),
                "output": page_content.get("output")
            }
            insert_data(embedding, metadata)

        client.flush(collection_name="log_search_collection2")

        return jsonify({"response": "Embeddings uploaded successfully", "file_path": file_path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500