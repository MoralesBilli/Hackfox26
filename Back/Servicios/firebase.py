import firebase_admin 
from firebase_admin import credentials, db, firestore
from config import FIREBASE_CREDENTIALS, FIREBASE_DB_URL
from datetime import datetime 
import uuid

cred = credentials.Certificate(FIREBASE_CREDENTIALS)
firebase_admin.initialize_app(cred, {
    'databaseURL': FIREBASE_DB_URL
})

firestore_db = firestore.client()

