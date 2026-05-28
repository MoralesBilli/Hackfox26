from flask import Blueprint,jsonify,request
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
from Servicios.firebase import firestore_db

Crear_reporte_bp= Blueprint('crear_reporte',__name__)

@Crear_reporte_bp.route('/creacion_reporte',methods=['GET'])
def crear_reporte():
    try:
        data = request.get_json(silent=True) or {}
        fecha = datetime.now()
        ubicacion = data.get('ubicacion')
        descripcion = data.get('descripcion')
        imagen = request.files["imagen"]
        uid = data.get('uid')

        user_ref = firestore_db.collection('reportes').document(uid)
        url_imagen = "https:"
        user_data = {
            'uid': uid,
            'fecha': fecha,
            'ubicacion': ubicacion,
            'descripcion':descripcion,
            'url_imagen': url_imagen
        }
        user_ref.set(user_data)

       
        return jsonify({'mensaje':'Reporte creado con exito'}),200
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500
    


@Crear_reporte_bp.route('/',methods=['GET'])
def inicio():
    try:
       
        return "Hola mundo"
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500