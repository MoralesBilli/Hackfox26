import json
import base64
import requests
from config import API_GEMINI

def analizar_reporte(image_bytes):
    """
    Analiza una imagen en bytes con Gemini 2.5 Flash mediante API REST directa
    para determinar si representa un problema de accesibilidad urbana o daño de infraestructura.
    Retorna un diccionario con la clasificación de la IA.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_GEMINI}"
    
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

    # Codificar imagen a Base64 para el payload inlineData
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')

    print("--------------------------------------------------")
    print("[GEMINI SERVICE] Iniciando llamada a Gemini REST API...")
    print(f"MimeType de imagen: image/jpeg")
    print(f"Tamaño de imagen Base64: {len(image_b64)} caracteres")
    print("--------------------------------------------------")

    # Estructura del cuerpo de la petición REST multimodal
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_b64
                        }
                    },
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
    except Exception as e:
        print(f"[GEMINI SERVICE] [ERROR] Error al realizar la petición HTTP: {str(e)}")
        raise e

    print(f"[GEMINI SERVICE] Status code devuelto: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"[GEMINI SERVICE] Respuesta JSON cruda de la API: {json.dumps(data, indent=2)}")
        try:
            texto_respuesta = data['candidates'][0]['content']['parts'][0]['text']
            print(f"[GEMINI SERVICE] Texto extraido: {texto_respuesta}")
            return json.loads(texto_respuesta)
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print(f"[GEMINI SERVICE] [ERROR] Fallo al parsear respuesta o JSON invalido: {str(e)}")
            raise ValueError(f"Error al procesar el formato de respuesta de Gemini: {str(e)}")
    else:
        print(f"[GEMINI SERVICE] [ERROR] Error devuelto por API: {response.status_code} - {response.text}")
        raise ValueError(f"Error {response.status_code} de la API de Gemini: {response.text}")
