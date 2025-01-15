from langchain_huggingface import HuggingFaceEndpoint
from models.prompts import new_prompt
import language_tool_python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

# Initialize the LLM
KEY = "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"
repo_id = 'mistralai/Mistral-7B-Instruct-v0.3'
llm = HuggingFaceEndpoint(repo_id=repo_id, huggingfacehub_api_token=KEY, max_new_tokens=2000, temperature=0.9)

# Initialize grammar tool
grammar_tool = language_tool_python.LanguageTool('en-US')

def preprocess_query(user_query):
    """Correct grammar and clean the user's query."""
    corrected_query = grammar_tool.correct(user_query)
    return corrected_query.strip()

def analyze_dataset(user_query):
    interactive_prompt = new_prompt + f"\nuser quary have data from database which is vector serched it can be unrelated if user asks simple questions so in that case you can ignore that : {user_query}\nYour Response: "

    try:
        response = llm.invoke(interactive_prompt)
        return response
    except Exception as e:
        raise Exception(f"Error processing query: {str(e)}")
    
