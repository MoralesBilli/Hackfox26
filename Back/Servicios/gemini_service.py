import json
from google import genai
from google.genai import types
from config import API_GEMINI

# Inicializar cliente de Gemini
genai_client = genai.Client(api_key=API_GEMINI)

def analizar_reporte(image_bytes):
    """
    Analiza una imagen en bytes con Gemini 2.5 Flash para determinar si
    representa un problema de accesibilidad urbana o daño de infraestructura.
    Retorna un diccionario con la clasificación de la IA.
    """
    prompt = (
        "Analiza esta imagen e indica si representa un obstáculo físico, barrera, daño a la infraestructura "
        "o problema de accesibilidad urbana que afecte la movilidad peatonal o de personas con discapacidad motriz "
        "(por ejemplo: banquetas destruidas, falta de rampas, baches, postes obstruyendo, basura acumulada, "
        "autos obstruyendo banquetas, rampas bloqueadas, escaleras sin rampa). "
        "Responde estrictamente en formato JSON con la siguiente estructura: "
        "{\n"
        "  \"es_valido\": true/false,\n"
        "  \"tipo\": \"nombre_categoria_del_obstaculo\",\n"
        "  \"severidad\": \"alta/media/baja\",\n"
        "  \"descripcion\": \"explicación breve de lo que se observa\"\n"
        "}"
    )

    response = genai_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg'
            ),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    # Parsear y retornar JSON
    return json.loads(response.text)
