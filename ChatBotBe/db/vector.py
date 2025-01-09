from pymilvus import connections

def connect_milvus(host="127.0.0.1", port="19530"):
    """ Connect to Milvus database """
    connections.connect(host=host, port=port)
    print("Connected to Milvus!")
