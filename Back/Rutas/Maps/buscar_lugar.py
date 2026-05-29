from flask import Flask, request, jsonify, Blueprint
import requests


buscar_lugar_bp=Blueprint('buscar_lugar',__name__)

@buscar_lugar_bp.route('/buscar', methods=['GET'])  # Cambiado a GET y ruta /buscar
def buscar():
    query = request.args.get('q')

    if not query:
        return jsonify([])

    url = "https://nominatim.openstreetmap.org/search"

    # Bounding box para Tijuana: Oeste, Norte, Este, Sur
    viewbox = "-117.27,32.55,-116.70,32.34"

    # Asegurar la búsqueda local en Tijuana si no fue especificada por el usuario
    if "tijuana" not in query.lower() and "tj" not in query.lower():
        full_query = f"{query}, Tijuana"
    else:
        full_query = query

    params = {
        "q": full_query,
        "format": "json",
        "limit": 5,
        "viewbox": viewbox,
        "bounded": 1
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