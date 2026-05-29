from flask import Blueprint, jsonify, request, g
import firebase_admin
from firebase_admin import credentials, firestore, storage, db
from datetime import datetime
from Servicios.firebase import firestore_db, auth
import base64
import uuid
import json
import requests
from Servicios.storage import subir_foto
from Funciones.token_requerido import token_requerido
from Servicios.gemini_service import analizar_reporte

Crear_reporte_bp = Blueprint('crear_reporte', __name__)

@Crear_reporte_bp.route('/creacion_reporte', methods=['PUT', 'POST'])
@token_requerido
def crear_reporte():
    try:
        data = request.get_json(silent=True) or {}
        fecha = datetime.now()
        
        # Extraer latitud y longitud soportando variaciones
        latitud = data.get('latitud') or data.get('lat')
        longitud = data.get('longitud') or data.get('long') or data.get('lng') or data.get('lon')
        descripcion_usuario = data.get('descripcion_usuario') or data.get('descripcion')
        imagen_input = data.get('imagen') or data.get('imagen_b64') or data.get('foto')
        uid = g.uid

        # Imprimir logs de datos recibidos en el servidor
        print("-----------------------------------------")
        print("📥 [BACKEND] Datos recibidos para creación de reporte:")
        print("Latitud:", latitud)
        print("Longitud:", longitud)
        print("Descripción usuario:", descripcion_usuario)
        print("UID del usuario logueado:", uid)
        if isinstance(imagen_input, str):
            print("Imagen (longitud):", len(imagen_input))
            print("Imagen (comienzo):", imagen_input[:100] + "...")
        else:
            print("Imagen (tipo):", type(imagen_input))
        print("-----------------------------------------")

        if not imagen_input:
            return jsonify({'error': 'No se envió ninguna imagen (URL o base64)'}), 400

        if not latitud or not longitud:
            return jsonify({'error': 'Faltan las coordenadas de ubicación (latitud y longitud)'}), 400

        image_bytes = None
        url_imagen = None
        clasificacion = {}

        # Verificar si es una URL o base64
        if isinstance(imagen_input, str) and (imagen_input.startswith('http://') or imagen_input.startswith('https://')):
            url_imagen = imagen_input
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                img_response = requests.get(imagen_input, headers=headers)
                if img_response.status_code == 200:
                    image_bytes = img_response.content
                else:
                    return jsonify({'error': f'No se pudo descargar la imagen desde la URL proporcionada (Status: {img_response.status_code})'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al intentar descargar la imagen', 'detalle': str(e)}), 400

            # 1. Consultar a Gemini para analizar y clasificar la imagen
            try:
                clasificacion = analizar_reporte(image_bytes)
            except Exception as e:
                return jsonify({
                    'error': 'Error al procesar la respuesta de la inteligencia artificial.',
                    'detalle': str(e)
                }), 500

            es_valido = clasificacion.get('es_valido', False)
            if not es_valido:
                return jsonify({
                    'error': 'Reporte inválido.',
                    'motivo': 'La imagen no fue identificada como un obstáculo de movilidad urbana o infraestructura dañada.',
                    'detalle_ia': clasificacion.get('descripcion', '')
                }), 400
        else:
            # Es base64: procesar flujo completo de Gemini + Cloudinary
            if "," in imagen_input:
                imagen_b64_clean = imagen_input.split(",")[1]
            else:
                imagen_b64_clean = imagen_input

            try:
                image_bytes = base64.b64decode(imagen_b64_clean)
            except Exception as e:
                return jsonify({'error': 'El formato base64 de la imagen no es válido', 'detalle': str(e)}), 400

            # 1. Consultar a Gemini para analizar y clasificar la imagen
            try:
                clasificacion = analizar_reporte(image_bytes)
            except Exception as e:
                return jsonify({
                    'error': 'Error al procesar la respuesta de la inteligencia artificial.',
                    'detalle': str(e)
                }), 500

            es_valido = clasificacion.get('es_valido', False)
            if not es_valido:
                return jsonify({
                    'error': 'Reporte inválido.',
                    'motivo': 'La imagen no fue identificada como un obstáculo de movilidad urbana o infraestructura dañada.',
                    'detalle_ia': clasificacion.get('descripcion', '')
                }), 400

            # 2. Subir a Cloudinary
            try:
                url_imagen = subir_foto(imagen_b64_clean)
            except Exception as e:
                return jsonify({
                    'error': 'Error al subir la imagen a Cloudinary.',
                    'detalle': str(e)
                }), 500
        
        # Mapeo de categorías a los identificadores que espera la lógica del backend (ej: Fabrica_reportes.py)
        categoria_ia = clasificacion.get('categoria', 'Desconocido').strip()
        subcategoria_ia = clasificacion.get('subcategoria', 'Desconocido').strip()
        
        category_mapping = {
            "accidente vial": "accidente_vial",
            "problema en tránsito peatonal": "Problema_peatonal",
            "problema en transito peatonal": "Problema_peatonal",
            "infraestructura dañada": "infraestructura_dañada",
            "infraestructura danada": "infraestructura_dañada",
            "emergencia o riesgo público": "emergencia_riesgo",
            "emergencia o riesgo publico": "emergencia_riesgo",
            "riesgo para personas con discapacidad": "peligro_discapacidad"
        }
        tipo_db = category_mapping.get(categoria_ia.lower(), 'otro')

        # 3. Guardar el reporte en Firestore
        id_reporte = str(uuid.uuid4())
        
        firestore_db.collection('reportes').document(id_reporte).set({
            'id_reporte': id_reporte,
            'uid': uid,
            'latitud': float(latitud),
            'longitud': float(longitud),
            'categoria': categoria_ia,
            'subcategoria': subcategoria_ia,
            'tipo': tipo_db,
            'severidad': clasificacion.get('severidad', 'media'),
            'descripcion_ia': clasificacion.get('descripcion', ''),
            'descripcion_usuario': descripcion_usuario,
            'url_imagen': url_imagen,
            'estado': 'pendiente',
            'timestamp': datetime.now()
        })

        # 4. Guardar los datos mínimos en Realtime Database
        db.reference(f'/reportes/{id_reporte}').set({
            'latitud': float(latitud),
            'longitud': float(longitud),
            'categoria': categoria_ia,
            'subcategoria': subcategoria_ia,
            'tipo': tipo_db,
            'severidad': clasificacion.get('severidad', 'media')
        })

        return jsonify({
            'mensaje': 'Reporte creado con éxito y validado por IA.',
            'reporte': {
                'id_reporte': id_reporte,
                'categoria': categoria_ia,
                'subcategoria': subcategoria_ia,
                'tipo': tipo_db,
                'severidad': clasificacion.get('severidad', 'media'),
                'descripcion_ia': clasificacion.get('descripcion', ''),
                'url_imagen': url_imagen,
                'latitud': float(latitud),
                'longitud': float(longitud)
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Error al crear el reporte.', 'detalle': str(e)}), 500

@Crear_reporte_bp.route('/', methods=['GET'])
def inicio():
    try:
        return "Hola mundo"
    except Exception as e:
        return jsonify({'error': 'Error al crear el reporte'}), 500