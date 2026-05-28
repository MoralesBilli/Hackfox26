from functools import wraps
from flask import request, jsonify, g
from Servicios.firebase import auth

def token_requerido(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({
                'error': 'Token requerido'
            }), 401

        try:
            token = auth_header.split(" ")[1]

            decoded_token = auth.verify_id_token(token)

            # Guardar uid globalmente
            g.uid = decoded_token['uid']

        except Exception as e:
            return jsonify({
                'error': 'Token inválido',
                'detalle': str(e)
            }), 401

        return f(*args, **kwargs)

    return decorated