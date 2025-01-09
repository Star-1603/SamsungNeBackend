from langchain_huggingface import HuggingFaceEndpoint
from models.prompts import new_prompt, base_prompt
import json

# Initialize the LLM
KEY = 
repo_id = 'mistralai/Mistral-7B-Instruct-v0.3'
llm = HuggingFaceEndpoint(repo_id=repo_id, huggingfacehub_api_token=KEY, max_new_tokens=2000, temperature=0.9)

def initialise_with_dataser():
    try:
        response0 = llm.invoke(base_prompt)
        return response0
    except Exception as e:
        raise Exception(f"Error processing query: {str(e)}")

def analyze_dataset(user_query):
    interactive_prompt = new_prompt + f"\nUser Query: {user_query}\nYour Response:"

    try:
        response = llm.invoke(interactive_prompt)
        return response
    except Exception as e:
        raise Exception(f"Error processing query: {str(e)}")