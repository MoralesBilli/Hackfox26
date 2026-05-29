# Tijuana Sin Barreras — Hackfox26

Plataforma ciudadana de accesibilidad urbana para la ciudad de Tijuana. Permite reportar, visualizar y navegar alrededor de obstáculos de movilidad en tiempo real mediante inteligencia artificial, mapas interactivos y seguimiento GPS.

---

## Índice

1. [Visión general](#visión-general)
2. [Arquitectura del sistema](#arquitectura-del-sistema)
3. [Backend](#backend)
   - [Estructura de carpetas](#estructura-de-carpetas-back)
   - [Punto de entrada](#punto-de-entrada)
   - [Configuración y variables de entorno](#configuración-y-variables-de-entorno)
   - [Rutas (Blueprints)](#rutas-blueprints)
   - [Servicios](#servicios)
   - [Modelos](#modelos)
   - [Funciones auxiliares](#funciones-auxiliares)
   - [Dependencias principales](#dependencias-principales-back)
4. [Frontend](#frontend)
   - [Estructura de carpetas](#estructura-de-carpetas-front)
   - [Punto de entrada y enrutamiento](#punto-de-entrada-y-enrutamiento)
   - [Pantallas](#pantallas)
   - [Contextos globales](#contextos-globales)
   - [Dependencias principales](#dependencias-principales-front)
5. [Flujos de datos](#flujos-de-datos)
6. [Integraciones externas](#integraciones-externas)
7. [Despliegue](#despliegue)

---

## Visión general

**Tijuana Sin Barreras** es una aplicación web progresiva (PWA-compatible) que conecta a ciudadanos con el estado en tiempo real de la infraestructura urbana de Tijuana. Los usuarios pueden:

- Visualizar incidentes reportados sobre un mapa interactivo (OpenStreetMap / Leaflet).
- Reportar nuevos obstáculos adjuntando una fotografía; la IA los clasifica automáticamente.
- Calcular rutas peatonales que eviten zonas con incidentes activos.
- Seguir su posición en tiempo real con GPS y orientación por brújula.
- Consultar un asistente virtual especializado en la aplicación (Gemini).
- Cambiar el idioma de la interfaz entre Español e Inglés.

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│  React 19 + TypeScript · Vite · Tailwind CSS · Leaflet / react-leaflet │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Flask 3)                           │
│  Python 3.14 · Gunicorn · flask-cors · PyJWT                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   Rutas     │  │  Servicios   │  │      Funciones        │  │
│  │ (Blueprints)│  │(firebase.py  │  │ (token_requerido.py   │  │
│  │             │  │ gemini_service│  │  Fabrica_reportes.py) │  │
│  │             │  │ storage.py)  │  │                       │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────────────────┘  │
└─────────┼────────────────┼────────────────────────────────────-─┘
          │                │
    ┌─────▼──────┐   ┌─────▼──────────────────────────┐
    │  Firebase  │   │       Servicios externos        │
    │ Auth       │   │ · Gemini REST API (Vision + Chat)│
    │ Firestore  │   │ · Cloudinary (imágenes)          │
    │ Realtime DB│   │ · Nominatim / OSM (geocoding)   │
    └────────────┘   └─────────────────────────────────┘
```

---

## Backend

### Estructura de carpetas (Back)

```
Back/
├── main.py                         # Punto de entrada Flask
├── config.py                       # Carga de variables de entorno
├── requirements.txt                # Dependencias Python
├── credenciales_firebase.json      # Credenciales Firebase (uso local)
├── .env                            # Variables de entorno (no versionado)
│
├── Rutas/                          # Blueprints Flask organizados por dominio
│   ├── Rutas.py                    # Registro central de todos los blueprints
│   ├── Reportes/
│   │   ├── Crear_reporte.py        # POST /creacion_reporte
│   │   └── Obtener_reporte.py      # GET  /obtener_reportes
│   ├── Usuarios/
│   │   ├── Creacion_usuarios.py    # POST /creacion_usuario
│   │   └── Iniciar_sesion.py       # POST /iniciar_sesion
│   ├── Maps/
│   │   └── buscar_lugar.py         # GET  /buscar
│   └── Chat/
│       └── Asistente.py            # POST /asistente_chat
│
├── Servicios/                      # Inicialización y clientes de servicios externos
│   ├── firebase.py                 # Inicialización firebase_admin (Firestore + Realtime DB + Auth)
│   ├── gemini_service.py           # Llamadas REST a Gemini 2.5 Flash
│   └── storage.py                  # Subida de imágenes a Cloudinary
│
├── Modelos/
│   └── Reporte.py                  # Clase de datos Reporte (DTO)
│
└── Funciones/
    ├── token_requerido.py          # Decorador de autenticación JWT (Firebase ID Token)
    └── Fabrica_reportes.py         # Patrón Factory para serialización de tarjetas
```

### Punto de entrada

**`main.py`** crea la aplicación Flask, habilita CORS para todos los orígenes, carga la configuración desde `config.py` y registra de forma dinámica todos los blueprints definidos en `Rutas/Rutas.py`. En producción se sirve con **Gunicorn**.

### Configuración y variables de entorno

**`config.py`** carga las siguientes variables desde `.env` mediante `python-dotenv`:

| Variable | Descripción |
|---|---|
| `FIREBASE_CREDENTIALS` | Ruta al archivo `.json` local **o** JSON completo serializado como string (nube) |
| `FIREBASE_DB_URL` | URL de Firebase Realtime Database |
| `FIREBASE_WEB_API_KEY` | Web API Key de Firebase (para autenticación REST) |
| `API_GEMINI` | Clave de la API de Google Gemini |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |

> **Nota de despliegue:** Cuando `FIREBASE_CREDENTIALS` contiene el JSON completo como string (entornos en la nube como Render), `Servicios/firebase.py` reemplaza automáticamente las secuencias `\\n` por `\n` en el campo `private_key` antes de inicializar el SDK, para garantizar que la clave PEM sea válida.

### Rutas (Blueprints)

Todos los blueprints se registran en `Rutas/Rutas.py` y se montan en la aplicación Flask sin prefijo de URL.

#### `POST /creacion_usuario`
Crea un usuario en **Firebase Authentication** y persiste su perfil (nombre, apellidos, correo, fecha de creación) en la colección `usuarios` de **Firestore**. Valida campos obligatorios y maneja errores como correo duplicado o proveedor no habilitado.

#### `POST /iniciar_sesion`
Autentica al usuario llamando a la **Firebase Auth REST API** (`identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`). Devuelve el `idToken`, `refreshToken` y el perfil completo desde Firestore.

#### `POST /creacion_reporte` *(requiere token)*
Endpoint protegido por el decorador `@token_requerido`. Flujo completo:
1. Valida coordenadas, descripción e imagen (base64 o URL).
2. Decodifica o descarga la imagen.
3. Llama a **Gemini Vision** (`analizar_reporte`) para clasificar la imagen en categoría, subcategoría, severidad y validez.
4. Rechaza reportes que no correspondan a obstáculos urbanos.
5. Sube la imagen a **Cloudinary** (si es base64).
6. Persiste el documento completo en **Firestore** (`/reportes/{uuid}`).
7. Persiste los datos mínimos de geolocalización en **Firebase Realtime Database** (`/reportes/{uuid}`).

Categorías reconocidas: `accidente_vial`, `Problema_peatonal`, `infraestructura_dañada`, `emergencia_riesgo`, `peligro_discapacidad`.

#### `GET /obtener_reportes`
Lee todos los documentos de la colección `reportes` en Firestore, los convierte a objetos `Reporte` y los serializa mediante el patrón **Factory** (`FactoryTarjetas`) enriqueciendo cada tarjeta con un campo `color` según el tipo de incidente.

#### `GET /buscar?q={query}`
Geocodificador local usando **Nominatim (OSM)**. El bounding box está restringido al área geográfica de Tijuana (`-117.27,32.55,-116.70,32.34`). Si el query no incluye "Tijuana" o "TJ", se añade automáticamente. Devuelve hasta 5 resultados con `name`, `lat`, `lon`.

#### `POST /asistente_chat`
Recibe un `mensaje` y un `historial` de conversación. Llama a **Gemini 2.5 Flash** con un system prompt que limita al asistente a responder exclusivamente sobre el funcionamiento de "Tijuana Sin Barreras". Devuelve `{ "respuesta": "..." }`.

### Servicios

#### `Servicios/firebase.py`
Inicialización única de `firebase_admin`. Detecta si `FIREBASE_CREDENTIALS` es un path de archivo `.json` (entorno local) o una cadena JSON serializada (entorno nube). Expone `firestore_db` (cliente Firestore) y `auth` (módulo de autenticación Firebase Admin). La instancia de Realtime DB se accede directamente vía `firebase_admin.db`.

#### `Servicios/gemini_service.py`
Contiene dos funciones:
- **`analizar_reporte(image_bytes)`**: Llamada multimodal a `gemini-2.5-flash`. Codifica la imagen en base64, la envía junto con un prompt de clasificación estructurada y parsea la respuesta JSON. Devuelve `{ es_valido, categoria, subcategoria, severidad, descripcion }`.
- **`responder_chat(mensaje, historial)`**: Llamada conversacional con `systemInstruction`. Mantiene el historial de turnos (`user` / `model`) y devuelve la respuesta en texto plano.

#### `Servicios/storage.py`
Wrapper de **Cloudinary SDK**. La función `subir_foto(foto_b64)` recibe una imagen en base64, la sube a la carpeta `tijuana_barreras` y devuelve la `secure_url` resultante.

### Modelos

#### `Modelos/Reporte.py`
Clase de datos (`DTO`) que representa un reporte con los campos: `id_reporte`, `descripcion_usuario`, `estado`, `timestamp`, `latitud`, `longitud`, `tipo`, `severidad`, `url_imagen`, `categoria`, `subcategoria`.

### Funciones auxiliares

#### `Funciones/token_requerido.py`
Decorador Flask que extrae el Bearer token del header `Authorization`, lo verifica con `firebase_admin.auth.verify_id_token()` y expone el `uid` del usuario en `flask.g.uid` para uso en la ruta protegida.

#### `Funciones/Fabrica_reportes.py`
Implementa el **patrón Factory** para la serialización de reportes:
- `TarjetaBase` (ABC): interfaz abstracta con el método `crear_tarjeta()`.
- `Tarjetas`: implementación concreta que asigna un `color` semántico según el `tipo` del reporte y formatea el timestamp a ISO 8601.
- `FactoryTarjetas`: fábrica estática que instancia `Tarjetas` a partir de un `Reporte`.

### Dependencias principales (Back)

| Librería | Versión | Propósito |
|---|---|---|
| Flask | 3.1.3 | Framework web |
| flask-cors | 5.0.0 | Control de CORS |
| gunicorn | 23.0.0 | Servidor WSGI producción |
| firebase-admin | 7.4.0 | SDK Firebase (Auth, Firestore, Realtime DB) |
| google-cloud-firestore | 2.27.0 | Cliente Firestore |
| google-genai | 2.7.0 | Cliente Gemini (referencia; también se usa REST directa) |
| cloudinary | 1.41.0 | Almacenamiento de imágenes |
| PyJWT | 2.13.0 | Manejo de JWT |
| osmnx | 2.1.0 | Análisis de redes viales (OpenStreetMap) |
| geopandas | 1.1.1 | Operaciones geoespaciales |
| requests | 2.34.2 | Llamadas HTTP externas |
| python-dotenv | 1.2.2 | Carga de variables de entorno |

---

## Frontend

### Estructura de carpetas (Front)

```
Frontend/
├── index.html                      # Plantilla HTML base
├── vite.config.ts                  # Configuración Vite
├── tailwind.config.js              # Configuración Tailwind CSS
├── tsconfig.app.json               # Configuración TypeScript app
├── package.json                    # Dependencias npm
│
└── src/
    ├── main.tsx                    # Punto de montaje React
    ├── App.tsx                     # Enrutador principal y layout raíz
    ├── index.css                   # Estilos globales base
    ├── App.css                     # Estilos adicionales
    │
    ├── LanguageContext.tsx         # Context API de internacionalización (ES/EN)
    ├── AccesibilidadContext.tsx    # Context API de accesibilidad visual
    │
    ├── HomeScreen.tsx              # Pantalla de inicio (alias feed)
    ├── FeedScreen.tsx              # Feed de reportes recientes y simbología
    ├── MapScreen.tsx               # Mapa interactivo principal
    ├── GenerarReporte.tsx          # Flujo de creación de reporte con imagen
    ├── ProfileScreen.tsx           # Perfil de usuario autenticado
    ├── LoginScreen.tsx             # Inicio de sesión
    ├── RegistroScreen.tsx          # Registro de nuevo usuario
    ├── Accesibilidad.tsx           # Panel de opciones de accesibilidad visual
    ├── PlaneadorDeRuta.tsx         # Configuración de ruta (origen, destino, opciones)
    ├── NavegacionActiva.tsx        # Vista de navegación paso a paso
    ├── ResultadoRuta.tsx           # Resultados de la ruta calculada
    ├── ReporteExitosoScreen.tsx    # Confirmación post-reporte
    └── ChatAsistente.tsx           # Chat flotante con Gemini (asistente virtual)
```

### Punto de entrada y enrutamiento

**`main.tsx`** monta el componente raíz `<App>` en el elemento `#root` del DOM.

**`App.tsx`** implementa un **enrutador client-side** basado en estado (`useState<Screen>`). No utiliza React Router; en su lugar define un `screenMap` que mapea cada identificador de pantalla a su componente correspondiente. La función `navigate(screen, params?)` centraliza toda la navegación e implementa redirección a `login` cuando se intenta acceder a rutas protegidas (`profile`, `report`) sin token en `localStorage`. La aplicación completa se envuelve en dos providers anidados:

```
<AccessibilityProvider>      ← Filtros visuales globales (contraste, texto grande, etc.)
  <LanguageProvider>         ← Diccionario ES/EN y función t()
    {pantalla activa}
    <ChatAsistente />        ← Siempre visible (flotante), independiente de la pantalla
  </LanguageProvider>
</AccessibilityProvider>
```

### Pantallas

#### `FeedScreen.tsx`
Pantalla de inicio. Muestra un carrusel de "historias" de reportes recientes y una lista de tarjetas de incidentes obtenidas de `GET /obtener_reportes`. Incluye un panel lateral de **simbología** con la leyenda de colores/categorías. Contiene el botón de toggle de idioma (ES/EN).

#### `MapScreen.tsx`
Pantalla central de la aplicación. Es el componente más extenso (~1700 líneas). Funcionalidades:
- **Mapa interactivo** con `react-leaflet` y tiles de OpenStreetMap.
- **Seguimiento GPS en tiempo real**: usa la API `navigator.geolocation.watchPosition` con marcador orientado por brújula (`deviceorientationabsolute`). El mapa se auto-centra en el usuario salvo que éste haya hecho scroll/zoom manual. El botón "Mi ubicación" reactiva el centrado automático.
- **Marcadores de incidentes**: íconos diferenciados por categoría, cargados desde `GET /obtener_reportes`.
- **Indicador de dirección de vista**: muestra al usuario hacia dónde está mirando en el mapa.
- **Buscador de lugares**: campo de texto que consulta `GET /buscar` y centra el mapa en el resultado.
- **Filtros**: radio de búsqueda (1–5 km) y tipo de incidente.
- **Cálculo de rutas**: integrado con OSMnx/backend o cálculo geoespacial en cliente. Opción "Evitar zonas con incidentes" para rutas alternativas.
- **Barra de navegación inferior**: accesos directos a Inicio, Mapa, Reportar, Perfil.

#### `GenerarReporte.tsx`
Flujo guiado de tres pasos para crear un reporte:
1. Captura o selección de imagen (base64).
2. Descripción textual del obstáculo.
3. Confirmación con coordenadas GPS automáticas.

Envía `PUT /creacion_reporte` con el token de autenticación en el header `Authorization: Bearer {token}`. Navega a `ReporteExitosoScreen` al completar con éxito.

#### `LoginScreen.tsx`
Formulario de inicio de sesión. Consume `POST /iniciar_sesion` y persiste el `token` e información de usuario en `localStorage`.

#### `RegistroScreen.tsx`
Formulario de registro de usuario nuevo. Consume `POST /creacion_usuario`.

#### `ProfileScreen.tsx`
Muestra el perfil del usuario autenticado. Lee los datos guardados en `localStorage`.

#### `Accesibilidad.tsx`
Panel de configuración de accesibilidad visual. Controla filtros CSS globales aplicados por `AccesibilidadContext` (alto contraste, escala de grises, tamaño de texto, etc.).

#### `PlaneadorDeRuta.tsx`
Formulario de configuración de ruta: origen, destino, modo de transporte y opción de evitar incidentes. Deriva el flujo a `NavegacionActiva` o `ResultadoRuta`.

#### `NavegacionActiva.tsx`
Vista de navegación turno a turno. Muestra instrucciones paso a paso y la distancia restante.

#### `ResultadoRuta.tsx`
Muestra el resumen de la ruta calculada: distancia total, tiempo estimado y lista de segmentos.

#### `ReporteExitosoScreen.tsx`
Pantalla de confirmación tras crear un reporte. Muestra la clasificación generada por IA (categoría, subcategoría, severidad) y un resumen del reporte enviado.

#### `ChatAsistente.tsx`
Componente flotante persistente. Visible en todas las pantallas superpuesto sobre el contenido. Características:
- Puede **ocultarse/mostrarse** mediante un botón toggle.
- Mantiene el historial de conversación en estado local.
- Envía mensajes a `POST /asistente_chat` con el historial acumulado.
- Botón de emergencia directo al **911**.
- El system prompt del backend limita las respuestas al contexto de la aplicación.
- Traducciones integradas con `LanguageContext`.

### Contextos globales

#### `LanguageContext.tsx`
Provee internacionalización (i18n) sin librería externa:
- Estado `language` (`'es'` | `'en'`) persistido en `localStorage`.
- Función `t(key)` que resuelve claves del diccionario según el idioma activo.
- Función `toggleLanguage()` para alternar entre idiomas.
- El diccionario cubre todas las cadenas de texto de la UI: navegación, categorías, simbología, formularios, mensajes de estado, etc.

#### `AccesibilidadContext.tsx`
Provee opciones de accesibilidad visual:
- Filtros CSS aplicados al elemento `<body>` o `<html>` (contraste, daltonismo, reducción de movimiento, tamaño de fuente).
- Estado persistido en `localStorage`.
- Consumido por `Accesibilidad.tsx` para los controles y por los componentes que adaptan su estilo.

### Dependencias principales (Front)

| Librería | Versión | Propósito |
|---|---|---|
| react | 19.2.6 | Framework UI |
| react-dom | 19.2.6 | Renderizado DOM |
| leaflet | 1.9.4 | Motor de mapas |
| react-leaflet | 5.0.0 | Integración Leaflet con React |
| tailwindcss | 4.3.0 | Utilidades CSS |
| vite | 8.0.12 | Bundler y servidor de desarrollo |
| typescript | 6.0.2 | Tipado estático |

---

## Flujos de datos

### Creación de un reporte

```
Usuario (browser)
    │
    ├─ Captura imagen → base64
    ├─ Obtiene coordenadas GPS (navigator.geolocation)
    │
    └─► PUT /creacion_reporte
            Header: Authorization: Bearer {Firebase ID Token}
            Body: { imagen, latitud, longitud, descripcion_usuario }
                │
                ├─► token_requerido (verifica JWT con Firebase Admin)
                │       g.uid = uid del usuario
                │
                ├─► Gemini Vision API
                │       → analizar_reporte(image_bytes)
                │       ← { es_valido, categoria, subcategoria, severidad, descripcion }
                │
                ├─► Cloudinary
                │       → subir_foto(imagen_b64)
                │       ← secure_url
                │
                ├─► Firestore  → /reportes/{uuid}  (documento completo)
                └─► Realtime DB → /reportes/{uuid}  (coordenadas + tipo)
                │
                ◄─ { mensaje, reporte: { id, categoria, subcategoria, severidad, url_imagen, lat, lon } }
```

### Autenticación

```
Usuario
    └─► POST /iniciar_sesion
            Body: { correo, contrasena }
                │
                └─► Firebase Auth REST API (identitytoolkit)
                        ← { idToken, refreshToken, localId }
                │
                ├─► Firestore → /usuarios/{uid}  (perfil)
                │
                ◄─ { token, refreshToken, usuario }
                │
    ← localStorage.setItem('token', idToken)
```

### Obtención de reportes para el mapa/feed

```
MapScreen / FeedScreen
    └─► GET /obtener_reportes
                │
                └─► Firestore.collection('reportes').stream()
                │
                └─► FactoryTarjetas.crear_tarjeta(reporte) × N
                │       → asigna color semántico por tipo
                │
                ◄─ [ { id, tipo, color, categoria, subcategoria, latitud, longitud, imagen, ... } ]
```

---

## Integraciones externas

| Servicio | Uso | Protocolo |
|---|---|---|
| **Firebase Authentication** | Registro, inicio de sesión, verificación de tokens JWT | REST API + Admin SDK |
| **Firestore** | Almacén principal de reportes y perfiles de usuario | gRPC / Admin SDK |
| **Firebase Realtime Database** | Datos mínimos de reportes para actualizaciones en tiempo real | Admin SDK |
| **Gemini 2.5 Flash** | Clasificación de imágenes (visión) y asistente de chat | REST (`generativelanguage.googleapis.com`) |
| **Cloudinary** | Almacenamiento y CDN de imágenes de reportes | SDK Python |
| **Nominatim (OSM)** | Geocodificación de direcciones en Tijuana | REST público |
| **OpenStreetMap** | Tiles del mapa interactivo | Tiles HTTP (Leaflet) |

---

## Despliegue

### Backend
- **Plataforma**: Render (Web Service)
- **Runtime**: Python 3.14
- **Servidor**: Gunicorn (`gunicorn main:app`)
- **Variables de entorno**: configuradas en el panel de Render; `FIREBASE_CREDENTIALS` contiene el JSON completo de la cuenta de servicio serializado como string de una sola línea.

### Frontend
- **Herramienta de build**: `npm run build` (Vite → `dist/`)
- **Variables de entorno**: definidas en `Frontend/.env`
- El build genera activos estáticos listos para servir en cualquier CDN o servicio de hosting estático.
