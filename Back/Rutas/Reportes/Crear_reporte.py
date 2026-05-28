from flask import Blueprint, jsonify, request, g
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
from Servicios.firebase import firestore_db, auth
import base64
import uuid
import json
import requests
from Servicios.storage import subir_foto
from Funciones.token_requerido import token_requerido
from google import genai
from google.genai import types
from config import API_GEMINI

Crear_reporte_bp = Blueprint('crear_reporte', __name__)

genai_client = genai.Client(api_key=API_GEMINI)

@Crear_reporte_bp.route('/creacion_reporte', methods=['PUT', 'POST'])
@token_requerido
def crear_reporte():
    try:
        data = request.get_json(silent=True) or {}
        fecha = datetime.now()
        
        # Extraer latitud y longitud soportando variaciones
        latitud = data.get('latitud') or data.get('lat')
        longitud = data.get('longitud') or data.get('long') or data.get('lng') or data.get('lon')
        descripcion = data.get('descripcion')
        imagen_input = data.get('imagen') or data.get('imagen_b64') or data.get('foto')
        uid = g.uid

        if not imagen_input:
            return jsonify({'error': 'No se envió ninguna imagen (URL o base64)'}), 400

        if not latitud or not longitud:
            return jsonify({'error': 'Faltan las coordenadas de ubicación (latitud y longitud)'}), 400

        image_bytes = None
        url_imagen = None

        # Verificar si es una URL o base64
        if isinstance(imagen_input, str) and (imagen_input.startswith('http://') or imagen_input.startswith('https://')):
            # Si es una URL, guardamos el string directamente para pruebas rápidas (sin descargar ni procesar por IA)
            url_imagen = imagen_input
            categoria = "Prueba (URL directa)"
            descripcion_ia = "Análisis omitido para pruebas rápidas con URL directa."
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
            prompt = (
                "Analiza esta imagen e indica si representa un obstáculo físico, barrera, daño a la infraestructura "
                "o problema de accesibilidad urbana que afecte la movilidad peatonal o de personas con discapacidad motriz "
                "(por ejemplo: banquetas destruidas, falta de rampas, baches, postes obstruyendo, basura acumulada, "
                "autos obstruyendo banquetas, rampas bloqueadas, escaleras sin rampa). "
                "Responde estrictamente en formato JSON con la siguiente estructura: "
                "{\n"
                "  \"es_valido\": true/false,\n"
                "  \"categoria\": \"nombre_categoria_del_obstaculo\",\n"
                "  \"descripcion_ia\": \"explicación breve de lo que se observa\"\n"
                "}"
            )

            try:
                response = genai_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type='image/jpeg'
                        ),
                        prompt
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                analisis = json.loads(response.text)
            except Exception as e:
                return jsonify({
                    'error': 'Error al procesar la respuesta de la inteligencia artificial.',
                    'detalle': str(e)
                }), 500

            es_valido = analisis.get('es_valido', False)
            categoria = analisis.get('categoria', 'Desconocido')
            descripcion_ia = analisis.get('descripcion_ia', '')

            if not es_valido:
                return jsonify({
                    'error': 'Reporte inválido.',
                    'motivo': 'La imagen no fue identificada como un obstáculo de movilidad urbana o infraestructura dañada.',
                    'detalle_ia': descripcion_ia
                }), 400

            # 2. Subir a Cloudinary
            try:
                url_imagen = subir_foto(imagen_b64_clean)
            except Exception as e:
                return jsonify({
                    'error': 'Error al subir la imagen a Cloudinary.',
                    'detalle': str(e)
                }), 500
        
        # 3. Guardar el reporte en Firestore
        id_reporte = str(uuid.uuid4())
        reporte_ref = firestore_db.collection('reportes').document(id_reporte)

        reporte_data = {
            'id_reporte': id_reporte,
            'uid': uid,
            'fecha': fecha.strftime("%Y-%m-%d"),
            'hora': fecha.strftime("%H:%M:%S"),
            'latitud': float(latitud),
            'longitud': float(longitud),
            'descripcion_usuario': descripcion,
            'url_imagen': url_imagen,
            'categoria': categoria,
            'descripcion_ia': descripcion_ia,
            'estado': 'pendiente'
        }
        reporte_ref.set(reporte_data)

        return jsonify({
            'mensaje': 'Reporte creado con éxito y validado por IA.',
            'reporte': {
                'id_reporte': id_reporte,
                'categoria': categoria,
                'descripcion_ia': descripcion_ia,
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