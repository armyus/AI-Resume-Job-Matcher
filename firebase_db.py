import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from pathlib import Path

ROOT = Path(__file__).resolve().parent
KEY_PATH = ROOT / "serviceAccountKey.json"

if not KEY_PATH.exists():
    raise FileNotFoundError(f"serviceAccountKey.json was not found at {KEY_PATH}")

# Initialize Firebase app
cred = credentials.Certificate(str(KEY_PATH))
firebase_admin.initialize_app(cred, {
    'storageBucket': 'rmi-ai-recruiter.appspot.com'  # Your Firebase project bucket
})

# Get Firestore Database client
db = firestore.client()

print(">>> Firebase successfully connected to Firestore!")