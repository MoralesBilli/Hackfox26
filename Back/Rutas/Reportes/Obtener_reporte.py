from flask import Blueprint, request, jsonify
from Servicios.firebase import firestore_db, auth
from Modelos.Reporte import Reporte
from Funciones.Fabrica_reportes import FactoryTarjetas

Obtener_reporte_bp = Blueprint('obtener_reporte', __name__)

def obtener_reportes():

    docs = firestore_db.collection('reportes').stream()

    reportes = []

    for doc in docs:

        data = doc.to_dict()

        reporte = Reporte(
            id_reporte=doc.id,
            descripcion_usuario=data.get('descripcion_usuario'),
            estado=data.get('estado'),
            timestamp=data.get('timestamp'),
            latitud=data.get('latitud'),
            longitud=data.get('longitud'),
            tipo=data.get('tipo'),
            severidad=data.get('severidad'),
            url_imagen=data.get('url_imagen'),
            categoria=data.get('categoria', 'Desconocido'),
            subcategoria=data.get('subcategoria', 'Desconocido')
        )

        reportes.append(reporte)

    return reportes


@Obtener_reporte_bp.route('/obtener_reportes',methods=['GET'])
def reportes():
    try:
        reportes = obtener_reportes()
        tarjetas = []

        for reporte in reportes:
            factory = FactoryTarjetas.crear_tarjeta(reporte)

            tarjeta = factory.crear_tarjeta()

            tarjetas.append(tarjeta)

        return jsonify(tarjetas), 200
    except Exception as e:
        return jsonify({'Error':f'Error al obtener los reportes {str(e)}'}), 500