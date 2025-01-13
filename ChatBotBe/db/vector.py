from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection
from pymilvus.exceptions import MilvusException

# Function to connect to Milvus
def connect_milvus(host="127.0.0.1", port="19530"):
    """ Connect to Milvus database """
    try:
        connections.connect("Samsung", host=host, port=port)
        print("Connected to Milvus!")
    except MilvusException as e:
        print(f"Error connecting to Milvus: {e}")
        return None
    return connections