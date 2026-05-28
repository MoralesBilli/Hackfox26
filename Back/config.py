import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

API_GEMINI = os.getenv('API_GEMINI')
FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS')
FIREBASE_DB_URL = os.getenv('FIREBASE_DB_URL')
FIREBASE_WEB_API_KEY = os.getenv('FIREBASE_WEB_API_KEY')

class configuracion:
    API_GEMINI = API_GEMINI
    FIREBASE_CREDENTIALS = FIREBASE_CREDENTIALS
    FIREBASE_DB_URL = FIREBASE_DB_URL
    FIREBASE_WEB_API_KEY = FIREBASE_WEB_API_KEY