from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection
from pymilvus.exceptions import MilvusException
from models.client import get_milvus_client

client = get_milvus_client()

def list_milvus_collections():
    """ List all collections in Milvus """
    try:
        collections = client.list_collections()
        print("Collections:", collections)
        return collections
    except MilvusException as e:
        print(f"Error listing collections: {e}")
        return []

def create_milvus_collection(collection_name="log_search_collection", dim=384):
    # Check if collection exists
    existing_collections = list_milvus_collections()

    if collection_name in existing_collections:
        print(f"Collection {collection_name} already exists.")
        return collection_name
    else:
        # Define schema for the collection
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim)
        ]
        schema = CollectionSchema(fields, description="Description of your collection")

        # Create the collection
        client.create_collection(collection_name=collection_name, schema=schema)
        print(f"Created collection: {collection_name}")
        return collection_name


