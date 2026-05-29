import json
import os
import firebase_admin 
from firebase_admin import credentials, db, firestore, auth
from config import FIREBASE_CREDENTIALS, FIREBASE_DB_URL
from datetime import datetime 
import uuid

# Cargar credenciales: puede ser una ruta de archivo local o una cadena JSON en la nube
if FIREBASE_CREDENTIALS.endswith('.json') and os.path.exists(FIREBASE_CREDENTIALS):
    cred = credentials.Certificate(FIREBASE_CREDENTIALS)
else:
    try:
        cred_dict = json.loads(FIREBASE_CREDENTIALS)
        cred = credentials.Certificate(cred_dict)
    except Exception as e:
        raise ValueError(f"FIREBASE_CREDENTIALS no es una ruta de archivo .json válida ni una cadena JSON. Detalle: {e}")

firebase_admin.initialize_app(cred, {
    'databaseURL': FIREBASE_DB_URL
})

firestore_db = firestore.client()

