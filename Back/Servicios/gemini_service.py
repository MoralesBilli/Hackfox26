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


def responder_chat(mensaje, historial=None):
    """
    Responde a preguntas del usuario sobre el funcionamiento de la app usando Gemini 2.5 Flash.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_GEMINI}"
    
    # Prompt de sistema/contexto de la app
    contexto = (
        "Eres un asistente virtual amable y experto para la aplicación 'Tijuana Sin Barreras', "
        "un mapa interactivo de accesibilidad urbana en Tijuana. Tu objetivo es guiar al usuario "
        "en el funcionamiento y características de la aplicación.\n\n"
        "Información clave de la aplicación:\n"
        "- Nombre: Tijuana Sin Barreras\n"
        "- Propósito: Reportar y visualizar obstáculos urbanos, barreras de accesibilidad y problemas de infraestructura "
        "en Tijuana para mejorar la movilidad peatonal, especialmente para personas con discapacidad.\n"
        "- Características principales:\n"
        "  1. Mapa Interactivo: Muestra incidentes reportados en tiempo real. Permite buscar direcciones (solo dentro de Tijuana) "
        "y calcular rutas seguras.\n"
        "  2. Cálculo de Rutas Inteligente: Al activar 'Evitar zonas con incidentes', la app calcula "
        "una ruta alternativa que rodee los obstáculos reportados. También puedes elegir rutas alternativas directamente desde el mapa "
        "o el panel de control. El algoritmo siempre prioriza la ruta más corta (menor recorrido) ante incidentes o en modo clásico.\n"
        "  3. Filtro por Radio y Tipo: Filtra los reportes de incidentes por distancia (1 a 5 km desde tu ubicación) y por categoría (Accidente vial 🚗, Problema peatonal 🚶, Infraestructura dañada 🚧, Emergencia/Riesgo ⚠️, Accesibilidad/Discapacidad ♿).\n"
        "  4. Reportar Incidentes: Haz clic en el botón '+' en la barra inferior. Sube una foto del obstáculo e introduce una descripción. "
        "Nuestra Inteligencia Artificial (Gemini) analizará la imagen para clasificar automáticamente la categoría, subcategoría y severidad. "
        "El reporte se publicará en tiempo real en el mapa.\n"
        "  5. Feed de Reportes: En el Inicio/Home, puedes ver una lista de historias y reportes recientes hechos por otros ciudadanos.\n"
        "  6. Seguimiento en Tiempo Real: En la pantalla del mapa, tu marcador se mueve y orienta en tiempo real con el GPS y la brújula de tu dispositivo. "
        "El mapa se auto-centra para mantenerte en pantalla, pero si arrastras o haces zoom manualmente, el centrado se desactiva. Haz clic en 'Mi ubicación' para volver a bloquear el centrado.\n"
        "- Teléfono de Emergencias: En la cabecera del chat asistente hay un botón para llamar al 911 en caso de riesgo inminente.\n\n"
        "Instrucciones de respuesta:\n"
        "- Sé claro, servicial, conciso y responde siempre en español.\n"
        "- Si el usuario te pregunta por temas no relacionados con la app o de ayuda general sobre Tijuana, "
        "recuérdale amablemente que eres un asistente específico para la aplicación 'Tijuana Sin Barreras' "
        "e intenta reorientar la conversación.\n"
        "- Mantén las respuestas amigables y formateadas con viñetas cuando sea apropiado para facilitar la lectura."
    )

    contents = []
    
    # Agregar historial si existe
    if historial:
        for msg in historial:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
            
    # Agregar el mensaje actual del usuario
    contents.append({
        "role": "user",
        "parts": [{"text": mensaje}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": contexto}]
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            try:
                texto_respuesta = data['candidates'][0]['content']['parts'][0]['text']
                return {"respuesta": texto_respuesta}
            except (KeyError, IndexError):
                return {"error": "Fallo al procesar la respuesta de la IA"}
        else:
            return {"error": f"Error {response.status_code} de la API de Gemini: {response.text}"}
    except Exception as e:
        return {"error": str(e)}
