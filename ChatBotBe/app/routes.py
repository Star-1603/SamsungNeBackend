from flask import Blueprint, jsonify, request
from langchain_community.document_loaders import JSONLoader
from services.cli import analyze_dataset, initialise_with_dataser
from services.rag.embeding import generate_embeddings
from db.vector import connect_milvus
from models.schemas.embedingSchema import create_milvus_collection
import os

main = Blueprint('main', __name__)

# Connect to Milvus
connect_milvus(host="127.0.0.1", port="19530")

# Create or load the collection
collection_name = "log_search_collection"
dim = 384  # Update based on your embedding dimensions
collection = create_milvus_collection(collection_name, dim)

@main.route('/')
def home():
    try:
        response = initialise_with_dataser()
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/analyze', methods=['POST'])
def analyze():
    user_query = request.json.get('query')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    try:
        response = analyze_dataset(user_query)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/upload', methods=['POST'])
def analyze():
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

        # Extract text content for embedding
        documents = [doc.page_content for doc in data]

        # Generate embeddings
        embeddings = generate_embeddings(documents, max_threads=8, chunk_size=200)

        # Insert embeddings into Milvus collection
        ids = [i for i in range(len(embeddings))]
        collection.insert([ids, embeddings])  # Insert data into the collection
        collection.flush()  # Ensure data is committed to Milvus

        return jsonify({"response": "Embeddings uploaded successfully", "file_path": file_path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500