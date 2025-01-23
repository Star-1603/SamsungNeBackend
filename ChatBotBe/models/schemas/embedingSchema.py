from pymilvus import FieldSchema, CollectionSchema, DataType
from pymilvus.exceptions import MilvusException
import json
from db.client import get_milvus_client

client = get_milvus_client()

def list_milvus_collections():
    """List all collections in Milvus."""
    try:
        collections = client.list_collections()
        print("Collections:", collections)
        return collections
    except MilvusException as e:
        print(f"Error listing collections: {e}")
        return []

def create_milvus_collection(collection_name="log_search_collection2", dim=384):
    """Create a new collection in Milvus with metadata support."""
    try:
        existing_collections = list_milvus_collections()
        if collection_name in existing_collections:
            print(f"Collection '{collection_name}' already exists.")
            return collection_name
        
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
            FieldSchema(name="meatadata", dtype=DataType.JSON), 
        ]
        
        schema = CollectionSchema(fields, description="Collection with embeddings and metadata")

        client.create_collection(collection_name=collection_name, schema=schema)
        print(f"Created collection: {collection_name}")
        return collection_name

    except MilvusException as e:
        print(f"Error creating collection: {e}")
        return None

def insert_data(embeddings, metadata_list):
    """Insert data into Milvus collection with embeddings and metadata."""
    try:

        data = {
            "embedding": embeddings,
            "meatadata": metadata_list
        }
        collection_name = "log_search_collection2"  

        client.insert(collection_name=collection_name, data=[data])

    except MilvusException as e:
        print(f"Error inserting data: {e}")
        return None
    except ValueError as ve:
        print(f"Error: {ve}")
        return None
    except Exception as ex:
        print(f"Unexpected error: {ex}")
        return None
