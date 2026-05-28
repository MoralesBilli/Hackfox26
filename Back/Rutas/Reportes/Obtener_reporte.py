from flask import Blueprint, request, jsonify
from Servicios.firebase import firestore_db, auth
from Modelos.Reporte import Reporte
from Funciones.Fabrica_reportes import FactoryTarjetas

Obtener_reporte_bp = Blueprint('obtener_reporte', __name__)


def obtener_reportes():
    try:
        docs = firestore_db.collection('reportes').stream()
        reportes = []

        for doc in docs:

            data = doc.to_dict()

            reporte = Reporte(
                id=doc.id,
                descripcion=data.get('descripcion'),
                imagen=data.get('url_imagen'),
                fecha=data.get('fecha'),
                ubicacion=data.get('ubicacion'),
                estado=data.get('estado', 'normal')
            )

            reportes.append(reporte)

        return reportes
    except  Exception as e:
        return jsonify({'Error':f'Error obteneindo los reportes {str(e)}'})


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