import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Initialize Firebase
if os.getenv("FIREBASE_SERVICE_ACCOUNT"):
    # Production: Firebase credentials from environment variable
    firebase_config = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    cred = credentials.Certificate(firebase_config)
else:
    # Local development: Firebase credentials from local JSON file
    KEY_PATH = ROOT / "serviceAccountKey.json"

    if not KEY_PATH.exists():
        raise FileNotFoundError(
            f"serviceAccountKey.json was not found at {KEY_PATH}"
        )

    cred = credentials.Certificate(str(KEY_PATH))

firebase_admin.initialize_app(cred, {
    "storageBucket": "rmi-ai-recruiter.appspot.com"
})

# Get Firestore Database client
db = firestore.client()

print(">>> Firebase successfully connected to Firestore!")