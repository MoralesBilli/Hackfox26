import json
import os
import firebase_admin 
from firebase_admin import credentials, db, firestore, auth
from config import FIREBASE_CREDENTIALS, FIREBASE_DB_URL
from datetime import datetime 
import uuid

# ─────────────────────────────────────────────────────────────────────────────
# Inicialización de Firebase Admin SDK
#
# FIREBASE_CREDENTIALS puede ser:
#   1. Nombre/ruta de un archivo .json  → se usa localmente si el archivo existe
#   2. Contenido JSON completo como string → se usa en la nube (Render, etc.)
# ─────────────────────────────────────────────────────────────────────────────

if not FIREBASE_CREDENTIALS:
    raise ValueError(
        "La variable de entorno FIREBASE_CREDENTIALS no está definida. "
        "En local: apúntala al archivo credenciales_firebase.json. "
        "En producción: pega el contenido JSON completo del archivo de credenciales."
    )

def _cargar_desde_json_string(valor):
    """Intenta parsear un string como JSON de credenciales Firebase."""
    try:
        cred_dict = json.loads(valor)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"FIREBASE_CREDENTIALS no es una ruta de archivo .json válida ni un JSON bien formado. "
            f"Detalle: {e}"
        )
    if isinstance(cred_dict, dict) and 'private_key' in cred_dict:
        # Normalizar saltos de línea en la clave PEM (problema común en variables de entorno)
        cred_dict['private_key'] = cred_dict['private_key'].replace('\\n', '\n')
    return credentials.Certificate(cred_dict)


cred = None

if FIREBASE_CREDENTIALS.strip().endswith('.json'):
    # Resolver ruta absoluta relativa al directorio raíz del backend
    if not os.path.isabs(FIREBASE_CREDENTIALS):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cert_path = os.path.join(base_dir, FIREBASE_CREDENTIALS.strip())
    else:
        cert_path = FIREBASE_CREDENTIALS.strip()

    if os.path.exists(cert_path):
        # Caso 1: archivo local existe → usarlo directamente
        cred = credentials.Certificate(cert_path)
    else:
        # Caso 2: el valor termina en .json pero el archivo no existe en este entorno
        # Intentar tratarlo como JSON serializado (configuración en la nube)
        print(
            f"[Firebase] Advertencia: el archivo '{cert_path}' no fue encontrado. "
            "Intentando parsear FIREBASE_CREDENTIALS como JSON serializado..."
        )
        cred = _cargar_desde_json_string(FIREBASE_CREDENTIALS)
else:
    # Caso 3: el valor no termina en .json → es JSON serializado directamente
    cred = _cargar_desde_json_string(FIREBASE_CREDENTIALS)

firebase_admin.initialize_app(cred, {
    'databaseURL': FIREBASE_DB_URL
})

firestore_db = firestore.client()
