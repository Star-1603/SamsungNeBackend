from flask import Blueprint, jsonify, request
from services.cli import analyze_dataset

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return "Welcome to the Flask Backend!"

@main.route('/analyze', methods=['POST'])
def analyze():
    user_query = request.json.get('query')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    # Use LLM to generate a response
    try:
        response = analyze_dataset(user_query)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500