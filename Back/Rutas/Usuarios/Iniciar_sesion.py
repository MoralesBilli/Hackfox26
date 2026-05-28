from flask import Blueprint, jsonify, request
from Servicios.firebase import firestore_db, auth
from firebase_admin import exceptions
from datetime import datetime

Iniciar_sesion_bp = Blueprint('iniciar_sesion', __name__)

@Iniciar_sesion_bp.route('/iniciar_sesion', methods=['POST'])
def iniciar_sesion():
    try:
        # Obtener datos de la petición
        data = request.get_json(silent=True) or {}
        correo = data.get('correo') or request.form.get('correo')
        contrasena = data.get('contrasena') or request.form.get('contrasena')

        # Validaciones de campos obligatorios
        missing_fields = []
        if not correo:
            missing_fields.append('correo')
        if not contrasena:
            missing_fields.append('contrasena')

        if missing_fields:
            return jsonify({
                'error': 'Faltan campos obligatorios para iniciar sesión.',
                'campos_faltantes': missing_fields
            }), 400

        # Importar la API Key desde config
        from config import FIREBASE_WEB_API_KEY
        if not FIREBASE_WEB_API_KEY:
            return jsonify({
                'error': 'Falta configurar FIREBASE_WEB_API_KEY en las variables de entorno (.env).',
                'solucion': 'Obtén la Web API Key de la consola de Firebase (Configuración del proyecto > General > Clave de API web) y añádela a tu archivo .env como FIREBASE_WEB_API_KEY=tu_clave.'
            }), 500

        # Limpiar espacios
        correo = correo.strip().lower()

        # Hacer petición a la API REST de Firebase Auth para verificar credenciales
        import requests
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        payload = {
            "email": correo,
            "password": contrasena,
            "returnSecureToken": True
        }
        
        response = requests.post(url, json=payload)
        res_data = response.json()

        if response.status_code != 200:
            error_message = res_data.get('error', {}).get('message', 'INVALID_CREDENTIALS')
            if error_message in ['EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_LOGIN_CREDENTIALS']:
                return jsonify({'error': 'El correo o la contraseña son incorrectos.'}), 400
            elif error_message == 'USER_DISABLED':
                return jsonify({'error': 'Esta cuenta de usuario ha sido deshabilitada.'}), 400
            return jsonify({'error': 'Error de autenticación.', 'detalle': error_message}), 400

        uid = res_data.get('localId')
        id_token = res_data.get('idToken')
        refresh_token = res_data.get('refreshToken')

        # Buscar perfil de usuario en Firestore
        user_ref = firestore_db.collection('usuarios').document(uid)
        user_doc = user_ref.get()

        user_info = {}
        if user_doc.exists:
            user_info = user_doc.to_dict()
        else:
            user_info = {
                'uid': uid,
                'correo': correo,
                'mensaje': 'Perfil no encontrado en Firestore'
            }

        return jsonify({
            'mensaje': 'Inicio de sesión exitoso.',
            'token': id_token,
            'refreshToken': refresh_token,
            'usuario': user_info
        }), 200

    except Exception as e:
        return jsonify({'error': 'Error interno al procesar el inicio de sesión.', 'detalle': str(e)}), 500