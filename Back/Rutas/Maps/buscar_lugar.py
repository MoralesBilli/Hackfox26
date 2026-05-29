from flask import Flask, request, jsonify, Blueprint
import requests


buscar_lugar_bp=Blueprint('buscar_lugar',__name__)

@buscar_lugar_bp.route('/buscar', methods=['GET'])  # Cambiado a GET y ruta /buscar
def buscar():
    query = request.args.get('q')

    if not query:
        return jsonify([])

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": query,
        "format": "json",
        "limit": 5
    }

    headers = {
        "User-Agent": "TijuanaSinBarreras"
    }

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10  # Añadir timeout
        )
        
        response.raise_for_status()  # Lanzar error si la respuesta no es 200
        
        data = response.json()

        resultados = []

        for item in data:
            resultados.append({
                "name": item["display_name"],
                "lat": float(item["lat"]),
                "lon": float(item["lon"])
            })

        return jsonify(resultados)
    
    except requests.exceptions.RequestException as e:
        print(f"Error en la búsqueda: {e}")
        return jsonify({"error": "Error al buscar el lugar"}), 500