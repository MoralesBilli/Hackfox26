from flask import Blueprint, jsonify, request


Usuarios_bp = Blueprint('usuarios',__name__)

@Usuarios_bp.route('/creacion_usuario', methods=['PUT'])

def crear_usuario():
    try:
        nombre = request.form.get('nombre')
        
    except Exception as e:
        return jsonify({'error':'Error al crear usuarios'}),500