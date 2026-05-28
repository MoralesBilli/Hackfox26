from flask import Blueprint,jsonify,request
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime

Crear_reporte_bp= Blueprint('crear_reporte',__name__)

@Crear_reporte_bp.route('/creacion_reporte',methods=['GET'])
def crear_reporte():
    try:
        data = request.get_json(silent=True) or {}
        fecha = data.get('fecha')
        ubicacion = data.get('ubicacion')
        descripcion = data.get('descripcion')
        imagen = request.files["imagen"]
        usuario = data.get('uid')


       
        return jsonify({'mensaje':'Reporte creado con exito'}),200
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500
    


@Crear_reporte_bp.route('/',methods=['GET'])
def inicio():
    try:
       
        return "Hola mundo"
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500