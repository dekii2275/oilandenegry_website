import os
from functools import lru_cache
from pymongo import MongoClient


@lru_cache
def get_mongo_client() -> MongoClient:
    url = os.getenv("MONGO_URL", "mongodb://mongo:27017")
    return MongoClient(url, serverSelectionTimeoutMS=5000)


def get_mongo_db():
    # Bạn có thể set MONGO_DB trong .env nếu muốn
    db_name = os.getenv("MONGO_DB", "zenergy")
    return get_mongo_client()[db_name]


def get_messages_collection():
    col = get_mongo_db()["messages"]
    try:
        col.create_index([("store_id", 1), ("customer_id", 1), ("created_at", 1)])
    except Exception:
        pass
    return col
