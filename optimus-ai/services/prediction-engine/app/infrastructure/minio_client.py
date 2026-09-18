import os
from minio import Minio
from minio.error import S3Error

MINIO_URL = os.getenv("MINIO_URL", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "optimus_admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "optimus_password")
BUCKET_NAME = "models"

# Instanciar cliente
client = Minio(
    MINIO_URL,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

def ensure_bucket_exists():
    try:
        if not client.bucket_exists(BUCKET_NAME):
            client.make_bucket(BUCKET_NAME)
    except S3Error as err:
        print(f"Error checking/creating bucket: {err}")

def upload_model(file_path: str, object_name: str):
    ensure_bucket_exists()
    try:
        client.fput_object(BUCKET_NAME, object_name, file_path)
        return True
    except S3Error as err:
        print(f"Error uploading model: {err}")
        return False

def download_model(object_name: str, file_path: str):
    try:
        client.fget_object(BUCKET_NAME, object_name, file_path)
        return True
    except S3Error as err:
        print(f"Error downloading model: {err}")
        return False
