from flask import Flask, request, jsonify, Blueprint
import requests


buscar_lugar_bp=Blueprint('buscar_lugar',__name__)

@buscar_lugar_bp.route('/buscar_lugar',methods=['PUT'])

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

    response = requests.get(
        url,
        params=params,
        headers=headers
    )

    data = response.json()

    resultados = []

    for item in data:

        resultados.append({
            "name": item["display_name"],
            "lat": float(item["lat"]),
            "lon": float(item["lon"])
        })

    return jsonify(resultados)

