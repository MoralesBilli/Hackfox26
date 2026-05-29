from flask import Blueprint, request, jsonify
from Servicios.gemini_service import responder_chat

Asistente_bp = Blueprint('Asistente_bp', __name__)

@Asistente_bp.route('/asistente_chat', methods=['POST'])
def asistente_chat():
    try:
        data = request.get_json(silent=True) or {}
        mensaje = data.get('mensaje')
        historial = data.get('historial', [])
        
        if not mensaje:
            return jsonify({"error": "El mensaje es requerido"}), 400
            
        resultado = responder_chat(mensaje, historial)
        
        if "error" in resultado:
            return jsonify(resultado), 500
            
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"error": f"Error interno en el chat: {str(e)}"}), 500
