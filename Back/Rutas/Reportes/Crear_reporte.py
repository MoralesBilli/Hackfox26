from flask import Blueprint,jsonify,request,g
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
from Servicios.firebase import firestore_db, auth
import base64
import uuid
from Servicios.storage import subir_foto
from Funciones.token_requerido import token_requerido

Crear_reporte_bp= Blueprint('crear_reporte',__name__)

@Crear_reporte_bp.route('/creacion_reporte',methods=['PUT'])
@token_requerido
def crear_reporte():
    try:
        data = request.get_json(silent=True) or {}
        fecha = datetime.now()
        ubicacion = data.get('ubicacion')
        descripcion = data.get('descripcion')
        imagen = request.files["imagen"]
        uid = g.uid

        if not imagen:
            return jsonify({
                'error': 'No se envio una imagen'
            }), 400

        # Convertir imagen a base64
        imagen_bytes = imagen.read()

        imagen_b64 = base64.b64encode(imagen_bytes).decode('utf-8')

       
        url_imagen = subir_foto(imagen_b64)
        
        id_reporte = str(uuid.uuid4())
        reporte_ref = firestore_db.collection('reportes').document(id_reporte)


       
        reporte_data = {
            'uid': uid,
            'fecha': fecha.strftime("%Y-%m-%d"),
            'hora': fecha.strftime("%H:%M:%S"),
            'ubicacion': ubicacion,
            'descripcion':descripcion,
            'url_imagen': url_imagen,
            'uid':uid
        }
        reporte_ref.set(reporte_data)

       
        return jsonify({'mensaje':'Reporte creado con exito'}),200
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500
    


@Crear_reporte_bp.route('/',methods=['GET'])
def inicio():
    try:
       
        return "Hola mundo"
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500