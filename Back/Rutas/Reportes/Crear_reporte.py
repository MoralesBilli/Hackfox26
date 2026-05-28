from flask import Blueprint,jsonify


Crear_reporte_bp= Blueprint('crear_reporte',__name__)

@Crear_reporte_bp.route('/creacion_reporte',methods=['GET'])
def crear_reporte():
    try:
        suma = 4
        return jsonify(suma)
    
    except Exception as e:
        return jsonify({'error':'Error al crear el reporte'}),500
