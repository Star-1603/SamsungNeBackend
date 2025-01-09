from pymilvus import FieldSchema, CollectionSchema, DataType, Collection

def create_milvus_collection(collection_name="log_search_collection", dim=384):
    """ Creates or loads the Milvus collection and schema """
    # Define the schema for the Milvus collection
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),  # Primary ID
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),  # Vector field
    ]
    schema = CollectionSchema(fields, description="Collection for storing log embeddings")

    # Create or load the collection
    if collection_name not in Collection.list_collections():
        collection = Collection(name=collection_name, schema=schema)
        print(f"Created collection: {collection_name}")
    else:
        collection = Collection(name=collection_name)
        print(f"Collection {collection_name} already exists.")

    return collection
