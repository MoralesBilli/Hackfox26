import json
import os
import firebase_admin 
from firebase_admin import credentials, db, firestore, auth
from config import FIREBASE_CREDENTIALS, FIREBASE_DB_URL
from datetime import datetime 
import uuid

# Cargar credenciales: puede ser una ruta de archivo local o una cadena JSON en la nube
if FIREBASE_CREDENTIALS.endswith('.json'):
    # Si la ruta no es absoluta, resolverla de manera absoluta respecto a la raíz del backend
    if not os.path.isabs(FIREBASE_CREDENTIALS):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cert_path = os.path.join(base_dir, FIREBASE_CREDENTIALS)
    else:
        cert_path = FIREBASE_CREDENTIALS

    if os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
    else:
        raise ValueError(f"No se encontró el archivo de credenciales de Firebase en la ruta: {cert_path}")
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

