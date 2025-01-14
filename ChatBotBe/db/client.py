# milvus_client.py
from pymilvus import MilvusClient

# Create and initialize the Milvus client
def get_milvus_client():
    client = MilvusClient(
        uri="http://localhost:19530",
        token="root:Milvus"
    )
    return client
