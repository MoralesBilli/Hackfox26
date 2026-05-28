from flask import Blueprint, jsonify, request
from Servicios.firebase import firestore_db, auth
from firebase_admin import exceptions
from datetime import datetime

Usuarios_bp = Blueprint('usuarios', __name__)

@Usuarios_bp.route('/creacion_usuario', methods=['POST', 'PUT'])
def crear_usuario():
    try:
        # Obtener datos de la petición (JSON o Formulario)
        data = request.get_json(silent=True) or {}
        
        # Soportar nombres de campos en español e inglés, singular y plural
        nombre = data.get('nombres') or data.get('nombre') or request.form.get('nombres') or request.form.get('nombre')
        apellido = data.get('apellidos') or data.get('apellido') or request.form.get('apellidos') or request.form.get('apellido')
        correo = data.get('correo') or data.get('email') or request.form.get('correo') or request.form.get('email')
        contrasena = data.get('contrasena') or data.get('password') or request.form.get('contrasena') or request.form.get('password')

        # Validaciones de campos obligatorios
        missing_fields = []
        if not nombre:
            missing_fields.append('nombre/nombres')
        if not apellido:
            missing_fields.append('apellido/apellidos')
        if not correo:
            missing_fields.append('correo/email')
        if not contrasena:
            missing_fields.append('contrasena/password')

        if missing_fields:
            return jsonify({
                'error': 'Faltan campos obligatorios para la creación del usuario.',
                'campos_faltantes': missing_fields
            }), 400

        # Limpiar espacios
        nombre = nombre.strip()
        apellido = apellido.strip()
        correo = correo.strip().lower()

        # 1. Crear el usuario en Firebase Authentication
        user_record = auth.create_user(
            email=correo,
            password=contrasena,
            display_name=f"{nombre} {apellido}"
        )
        uid = user_record.uid

        # 2. Guardar los datos en la colección "usuarios" en Firestore
        user_ref = firestore_db.collection('usuarios').document(uid)
        user_data = {
            'uid': uid,
            'nombres': nombre,
            'apellidos': apellido,
            'correo': correo,
            'fecha_creacion': datetime.utcnow().isoformat() + 'Z'
        }
        user_ref.set(user_data)

        return jsonify({
            'mensaje': 'Usuario creado exitosamente.',
            'usuario': {
                'uid': uid,
                'nombres': nombre,
                'apellidos': apellido,
                'correo': correo
            }
        }), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({'error': f'El correo electrónico {correo} ya se encuentra registrado.'}), 400
    except ValueError as e:
        return jsonify({'error': 'Los datos proporcionados no son válidos.', 'detalle': str(e)}), 400
    except exceptions.FirebaseError as e:
        detalle = str(e)
        if "CONFIGURATION_NOT_FOUND" in detalle:
            return jsonify({
                'error': 'El proveedor de autenticación por Correo/Contraseña no está habilitado en tu consola de Firebase.',
                'solucion': 'Por favor, ve a la consola de Firebase (https://console.firebase.google.com) -> Authentication -> Sign-in method y habilita el proveedor de "Correo electrónico y contraseña" (Email/Password).',
                'detalle': detalle
            }), 400
        return jsonify({'error': 'Error en la comunicación con Firebase.', 'detalle': detalle}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno al procesar la creación de usuario.', 'detalle': str(e)}), 500