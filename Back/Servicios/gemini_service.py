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
        "Analiza esta imagen y clasifícala estrictamente dentro de la siguiente estructura jerárquica de reporte urbano. "
        "Si la imagen no corresponde a ninguna de estas categorías/subcategorías, establece 'es_valido' como false.\n\n"
        "Estructura de clasificación:\n"
        "1. Accidente vial\n"
        "   - Choques\n"
        "   - Volcaduras\n"
        "   - Atropellamientos\n"
        "2. Problema en tránsito peatonal\n"
        "   - Banquetas bloqueadas\n"
        "   - Cruces peligrosos\n"
        "   - Semáforos peatonales dañados\n"
        "3. Infraestructura dañada\n"
        "   - Baches\n"
        "   - Alumbrado público sin funcionar\n"
        "   - Señalamientos caídos\n"
        "4. Emergencia o riesgo público\n"
        "   - Incendios\n"
        "   - Fugas de gas\n"
        "   - Cableado expuesto\n"
        "5. Riesgo para personas con discapacidad\n"
        "   - Rampas bloqueadas\n"
        "   - Banquetas inaccesibles\n"
        "   - Obstáculos para silla de ruedas\n"
        "   - Falta de rampas\n"
        "   - Vehículos sobre banquetas\n"
        "   - Puestos bloqueando paso peatonal\n"
        "   - Escombros o basura\n"
        "   - Banquetas rotas\n"
        "   - Zonas mal iluminadas\n"
        "   - Escaleras peligrosas\n\n"
        "Responde estrictamente en formato JSON con la siguiente estructura de llaves:\n"
        "{\n"
        "  \"es_valido\": true/false,\n"
        "  \"categoria\": \"nombre de la categoria principal (ej: Riesgo para personas con discapacidad)\",\n"
        "  \"subcategoria\": \"nombre de la subcategoria exacta de la lista (ej: Rampas bloqueadas)\",\n"
        "  \"severidad\": \"alta/media/baja\",\n"
        "  \"descripcion\": \"explicación breve de lo observado\"\n"
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
