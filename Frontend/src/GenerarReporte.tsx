import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useLanguage } from './LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Interfaz exacta para el payload del backend
interface ReportPayload {
    latitud: number;
    longitud: number;
    descripcion: string;
    imagen: string; // Se enviará como Base64
}

const ReportScreen = ({ onNavigate }: any) => {
    const { language, toggleLanguage, t } = useLanguage();
    // Estados para construir nuestro payload
    const [ubicacion, setUbicacion] = useState<string>('Obteniendo ubicación...');
    const [latitude, setLatitude] = useState<number>(32.5149);
    const [longitude, setLongitude] = useState<number>(-117.0382);
    const [descripcion, setDescripcion] = useState<string>('');
    const [tipoBarrera, setTipoBarrera] = useState<string>('Sin rampa'); // Para los chips
    const [imagenBase64, setImagenBase64] = useState<string>('');
    const [isObtainingLocation, setIsObtainingLocation] = useState<boolean>(true);

    // Estados de la UI
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSourceSelector, setShowSourceSelector] = useState<boolean>(false);

    // Estados y referencias para la cámara WebRTC
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);

    // Referencia para ocultar el selector de galería
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Referencias para Leaflet Map
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    // Verificar si el usuario está autenticado al acceder a esta vista
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión para reportar una barrera.');
            onNavigate('login');
        }
    }, [onNavigate]);

    // Detener la cámara si el componente se desmonta
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // El stream se asigna directamente mediante un callback ref en el elemento video
    // para evitar desfases de renderizado asíncrono en React.

    const handleStartCamera = async (deviceIdOrMode: string | 'user' | 'environment' = 'environment') => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("La cámara no está disponible en este navegador o requiere conexión segura (HTTPS/localhost). Abriendo selector de archivos...");
            galleryInputRef.current?.click();
            return;
        }

        // Si ya hay un stream activo, detenerlo primero antes de cambiar
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        const isExplicitDeviceId = deviceIdOrMode !== 'user' && deviceIdOrMode !== 'environment';

        try {
            // Usar restricción de ID explícito o modo ideal para evitar OverconstrainedError en laptops
            const videoConstraints: MediaTrackConstraints = isExplicitDeviceId
                ? { deviceId: { exact: deviceIdOrMode as string } }
                : { facingMode: { ideal: deviceIdOrMode as 'user' | 'environment' } };

            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints
            });

            setCameraStream(stream);
            setIsCameraActive(true);

            // Una vez que obtuvimos permisos, enumeramos todas las cámaras disponibles
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableCameras(videoDevices);

            if (isExplicitDeviceId) {
                setSelectedCameraId(deviceIdOrMode as string);
            } else {
                // Algoritmo de filtrado inteligente: Buscar la cámara web integrada
                const integrated = videoDevices.find(d => {
                    const label = d.label.toLowerCase();
                    return (
                        (label.includes('integrated') || 
                         label.includes('built-in') || 
                         label.includes('webcam') || 
                         label.includes('facetime') || 
                         label.includes('interna') || 
                         label.includes('front') ||
                         label.includes('cámara del sistema') ||
                         label.includes('cámara de la laptop') ||
                         label.includes('cámara frontal')) &&
                        !label.includes('virtual') &&
                        !label.includes('continuity') &&
                        !label.includes('droidcam') &&
                        !label.includes('epoccam') &&
                        !label.includes('teléfono') &&
                        !label.includes('phone')
                    );
                });

                if (integrated) {
                    setSelectedCameraId(integrated.deviceId);
                    
                    // Si la cámara integrada no es la que se abrió por defecto, reiniciar el stream específicamente con esa
                    const activeTrack = stream.getVideoTracks()[0];
                    const activeSettings = activeTrack ? activeTrack.getSettings() : null;
                    if (activeSettings && activeSettings.deviceId !== integrated.deviceId) {
                        stream.getTracks().forEach(track => track.stop());
                        const newStream = await navigator.mediaDevices.getUserMedia({
                            video: { deviceId: { exact: integrated.deviceId } }
                        });
                        setCameraStream(newStream);
                    }
                } else if (videoDevices.length > 0) {
                    setSelectedCameraId(videoDevices[0].deviceId);
                }
                
                setFacingMode(deviceIdOrMode as 'user' | 'environment');
            }
        } catch (err) {
            console.warn(`No se pudo iniciar la cámara en modo ${deviceIdOrMode}, intentando cualquier cámara...`, err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
                setCameraStream(stream);
                setIsCameraActive(true);
            } catch (finalErr) {
                console.error("Error definitivo al iniciar la cámara:", finalErr);
                alert("No se pudo iniciar la cámara (asegúrate de otorgar permisos). Se abrirá la galería del dispositivo.");
                galleryInputRef.current?.click();
            }
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg');
                setImagenBase64(base64);
                setErrorMessage(null);
            }
            stopCamera();
        }
    };

    // 2. Obtener geolocalización al cargar la pantalla
    useEffect(() => {
        if ("geolocation" in navigator) {
            setIsObtainingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    setUbicacion(`${position.coords.latitude}, ${position.coords.longitude}`);
                    setIsObtainingLocation(false);
                },
                (error) => {
                    console.warn("Error obteniendo ubicación:", error);
                    // Coordenadas de Tijuana por defecto si el usuario deniega el permiso
                    setLatitude(32.5149);
                    setLongitude(-117.0382);
                    setUbicacion("32.5149, -117.0382");
                    setIsObtainingLocation(false);
                }
            );
        } else {
            setUbicacion("32.5149, -117.0382");
            setIsObtainingLocation(false);
        }
    }, []);

    // 2.1. Inicializar y actualizar mapa de Leaflet
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Crear icono personalizado usando el Material Icon de Google con efecto de onda
        const customIcon = L.divIcon({
            html: `<div style="position: relative; width: 0; height: 0;">
                     <!-- Onda de pulso expansivo (animación ping) -->
                     <div class="absolute rounded-full bg-error/30 animate-ping" style="width: 40px; height: 40px; margin-left: -20px; margin-top: -20px; opacity: 0.8; z-index: 1;"></div>
                     <!-- Núcleo central del marcador -->
                     <div class="absolute rounded-full bg-error border-2 border-white" style="width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; z-index: 2; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                     <!-- Pin de localización con desplazamiento para apuntar al centro de la onda -->
                     <div class="absolute" style="margin-left: -16px; margin-top: -32px; z-index: 3;">
                       <span class="material-symbols-outlined text-[32px] text-error drop-shadow-md" style="font-variation-settings: 'FILL' 1;">location_on</span>
                     </div>
                   </div>`,
            className: 'custom-leaflet-pin',
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([latitude, longitude], 16);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(mapRef.current);

            // Agregar el marcador nativo
            markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapRef.current);
        } else {
            mapRef.current.setView([latitude, longitude], 16);
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            }
        }

        // Suscribirse a redimensionamiento para forzar centrado y ajuste de tamaño
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
                mapRef.current.setView([latitude, longitude]);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [latitude, longitude]);

    // 3. Manejador para convertir la imagen seleccionada a Base64
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Esto guarda la imagen como un string largo (data:image/jpeg;base64,...)
                setImagenBase64(reader.result as string);
                setErrorMessage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    // 4. Manejador del envío al backend (POST)
    const handleSubmit = async () => {
        setErrorMessage(null);

        // Obtener el token (hardcodeado temporalmente para pruebas)
        const token = localStorage.getItem('token') || "eyJhbGciOiJSUzI1NiIsImtpZCI6ImM5YTBjMWRlYWEyN2JjNjMyNTUzYmM4MWEyMmQ4NzY1MWM3MTMyY2IiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSnVhbiBQZXJleiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9oYWNrZm94MjYtZDdlOGMiLCJhdWQiOiJoYWNrZm94MjYtZDdlOGMiLCJhdXRoX3RpbWUiOjE3ODAwMTA3NzQsInVzZXJfaWQiOiJYTVFndlRndFlhV3NkaGpLREdseDVKU0tvRGMyIiwic3ViIjoiWE1RZ3ZUZ3RZYVdzZGhqS0RHbHg1SlNLb0RjMiIsImlhdCI6MTc4MDAxMDc3NCwiZXhwIjoxNzgwMDE0Mzc0LCJlbWFpbCI6Imp1YW4ucGVyZXpAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsianVhbi5wZXJlekBleGFtcGxlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.eGc94Oc3CRdSLJ8WURF8tPRKS8iIX7mIZRl1QCXhSxseX1ncLWLMuqt6TgCVx5ix3rhayT18gRPYpLg94ZVrBLUYQSru0QG1Cs4-LwzUyJFHvMlhnyQdthQO9o60cMJFS2y40Xp0QHeO8L5Wk_vWtZ9zdEKsnvxvTspSnDckLwUW3hdGS5pMFtYoaGj2Vmo-8Ri8aJdyN_BksdOzy5IylKvctM51sEkUlU-aRQ6c_xSAZrujcWB4HyP7lBcFBmoWaBogaEX6J2N7xx-xop61rIY5SjLoeA9RUPzaPYYBwVvoJ5c5W7ld-tZZJk9lWuGE7_7x4COf1rr4rhWnb5_giw";

        // Validaciones
        if (!imagenBase64) {
            setErrorMessage("Por favor, toma o selecciona una foto de la barrera.");
            return;
        }
        if (!descripcion.trim() && !tipoBarrera) {
            setErrorMessage("Por favor, añade una descripción o selecciona un tipo de barrera.");
            return;
        }

        setIsLoading(true);

        // Unimos el "tipo" seleccionado con el texto que escribió el usuario
        const descripcionFinal = `${tipoBarrera} - ${descripcion}`.trim();

        const payload: ReportPayload = {
            latitud: latitude,
            longitud: longitude,
            descripcion: descripcionFinal,
            imagen: imagenBase64
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

        try {
            console.log("-----------------------------------------");
            console.log(`🚀 [FRONTEND] Enviando reporte al backend (${apiUrl}/creacion_reporte):`);
            console.log("Latitud (latitud):", payload.latitud);
            console.log("Longitud (longitud):", payload.longitud);
            console.log("Descripción (descripcion):", payload.descripcion);
            console.log("Imagen (imagen - base64):", payload.imagen.substring(0, 100) + "...");
            console.log("-----------------------------------------");

            const response = await fetch(`${apiUrl}/creacion_reporte`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log("📥 [FRONTEND] Respuesta del servidor:", data);

            if (!response.ok) {
                const errorText = data.detalle ? `${data.error} (Detalle: ${data.detalle})` : (data.error || 'Error al enviar el reporte');
                throw new Error(errorText);
            }

            // Limpiar formulario tras éxito
            setImagenBase64('');
            setDescripcion('');
            onNavigate('success-report', {
                reporte: data.reporte,
                descripcionUsuario: descripcionFinal
            });

        } catch (error: any) {
            console.error('❌ Error:', error);
            setErrorMessage(error.message || "Hubo un problema de conexión. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen">

            {/* TopAppBar */}
            <header className="bg-primary text-on-primary border-b border-primary/20 docked full-width top-0 sticky z-50 shadow-md">
                <div className="flex justify-between items-center px-margin-mobile md:px-0 max-w-[1200px] mx-auto w-full h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                            <img alt="Logo App" className="w-full h-full object-cover" src="https://res.cloudinary.com/dakdmsfij/image/upload/v1780066088/logo_r8u3dl.png" />
                        </div>
                        <h1 
                            className="font-app-title text-app-title text-on-primary cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onNavigate && onNavigate('home')}
                        >
                            {t('app_title')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                        >
                            <span className="material-symbols-outlined text-[16px] text-white">language</span>
                            <span>{language === 'es' ? 'EN' : 'ES'}</span>
                        </button>
                        <button 
                            onClick={() => onNavigate && onNavigate('profile')}
                            className="text-on-primary hover:bg-white/10 active:scale-95 transition-all duration-150 focus:outline-none w-10 h-10 flex items-center justify-center rounded-full cursor-pointer"
                            title={t('feed_notifications')}
                        >
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <main className="max-w-[1200px] mx-auto w-full pb-32">
                <div className="flex flex-col gap-6 pt-6 px-margin-mobile md:px-0">

                {/* Header Section */}
                <div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Reportar barrera</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Ayuda a mejorar la accesibilidad de nuestra ciudad reportando obstáculos.</p>
                </div>

                {/* Mostrar mensaje de error si falta la imagen */}
                {errorMessage && (
                    <div className="p-3 bg-error-container text-on-error-container rounded-lg font-body-md text-sm border border-error/20">
                        {errorMessage}
                    </div>
                )}

                {/* Foto Section */}
                <section className="flex flex-col gap-2">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">Foto de la barrera <span className="text-error">*</span></h3>

                    {/* Input oculto para galería */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={galleryInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => setShowSourceSelector(true)}
                        className="w-full max-w-2xl mx-auto h-[300px] border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target-min relative overflow-hidden"
                    >
                        {imagenBase64 ? (
                            // Vista previa de la imagen si ya se seleccionó una
                            <img src={imagenBase64} alt="Vista previa" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[48px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                                <span className="font-label-md text-label-md text-primary">Toca para subir foto o tomar foto</span>
                            </>
                        )}
                    </button>

                    <p className="font-body-md text-body-md text-[#C8960C] italic flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        Gemini analizará la foto automáticamente
                    </p>
                </section>

                {/* Tipo de barrera Section */}
                <section className="flex flex-col gap-2">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">Tipo de barrera</h3>
                    <div className="flex flex-wrap gap-2 pb-2">
                        {['Banqueta rota', 'Sin rampa', 'Obstáculo', 'Vehículo estacionado'].map((tipo) => (
                            <button
                                key={tipo}
                                type="button"
                                onClick={() => setTipoBarrera(tipo)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md flex items-center justify-center h-[32px] min-w-[48px] touch-target-min transition-colors ${tipoBarrera === tipo
                                    ? 'bg-primary text-on-primary shadow-sm'
                                    : 'bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-variant'
                                    }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Ubicación Section */}
                <section className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-label-md text-label-md text-on-surface font-bold">Ubicación</h3>
                        <button className="font-label-md text-label-md text-primary font-bold hover:underline touch-target-min px-2 py-1">Cambiar</button>
                    </div>
                    <div className="rounded-xl overflow-hidden relative h-[200px] bg-surface-container border border-outline-variant">
                        {/* Contenedor del mapa Leaflet */}
                        <div ref={mapContainerRef} className="w-full h-full z-0" />
                        
                        {/* Indicador de Carga de Ubicación */}
                        {isObtainingLocation && (
                            <div className="absolute inset-0 bg-surface-container/95 z-[2000] flex flex-col items-center justify-center gap-3 transition-opacity duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                                    progress_activity
                                </span>
                                <span className="font-label-md text-label-md text-on-surface-variant font-medium animate-pulse">
                                    Obteniendo ubicación precisa...
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px]">my_location</span>
                        {ubicacion === 'Obteniendo ubicación...' ? ubicacion : `Coordenadas: ${ubicacion}`}
                    </p>
                </section>

                {/* Descripción Section */}
                <section className="flex flex-col gap-2">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">Descripción (Opcional)</h3>
                    <textarea
                        className="w-full min-h-[100px] bg-surface rounded-xl border border-outline p-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-y touch-target-min outline-none"
                        placeholder="Añade más detalles sobre la barrera..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    ></textarea>
                </section>

                {/* Submit Button */}
                <div className="mt-4 pb-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full h-[52px] bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all shadow-sm touch-target-min disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">send</span>
                                Enviar reporte
                            </>
                        )}
                    </button>
                </div>
            </div></main>

            {/* BottomNavBar */}
            <nav className="bg-surface/85 backdrop-blur-md border-t border-outline-variant/30 shadow-lg fixed bottom-0 left-0 right-0 w-full flex justify-around items-center px-4 py-2 pb-[env(safe-area-inset-bottom)] z-50">
                <button
                    onClick={() => onNavigate && onNavigate('home')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">home</span>
                </button>
                <button
                    onClick={() => onNavigate && onNavigate('map')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">explore</span>
                </button>
                <button
                    onClick={() => onNavigate && onNavigate('report')}
                    className="flex items-center justify-center text-primary font-bold w-12 h-12 bg-surface-variant/30 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </button>
                <button
                    onClick={() => onNavigate && onNavigate('profile')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">person</span>
                </button>
            </nav>

            {/* Modal / Bottom Sheet para seleccionar origen de foto */}
            {showSourceSelector && (
                <div 
                    className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center transition-opacity duration-300 animate-fade-in"
                    onClick={() => setShowSourceSelector(false)}
                >
                    <div 
                        className="bg-surface dark:bg-surface-container w-full max-w-md rounded-t-3xl p-6 pb-8 flex flex-col gap-4 animate-slide-up shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag indicator bar for bottom sheet look */}
                        <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-2" />

                        <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center mb-2">
                            Seleccionar origen de foto
                        </h3>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSourceSelector(false);
                                    handleStartCamera();
                                }}
                                className="flex items-center gap-4 w-full p-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] transition-all text-left border border-outline-variant/20 focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[28px] text-primary p-2 bg-primary/10 rounded-full">
                                    photo_camera
                                </span>
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface">Tomar foto</p>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">Usar la cámara de tu celular</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowSourceSelector(false);
                                    galleryInputRef.current?.click();
                                }}
                                className="flex items-center gap-4 w-full p-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] transition-all text-left border border-outline-variant/20 focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[28px] text-secondary p-2 bg-secondary/10 rounded-full">
                                    image
                                </span>
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface">Subir de la galería</p>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">Elegir un archivo o foto existente</p>
                                </div>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSourceSelector(false)}
                            className="mt-2 w-full py-3 bg-surface-container-lowest text-outline rounded-xl font-label-md text-label-md font-bold text-center border border-outline hover:bg-surface-container transition-colors focus:outline-none"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Visor de Cámara en vivo (WebRTC) */}
            {isCameraActive && (
                <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col justify-between items-center p-6 animate-fade-in">
                    {/* Header */}
                    <div className="w-full flex flex-col gap-3 mt-4 max-w-md">
                        <div className="flex justify-between items-center text-white w-full">
                            <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-white">Tomar foto</h4>
                            <button 
                                type="button"
                                onClick={stopCamera}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined text-white">close</span>
                            </button>
                        </div>

                        {/* Selector de cámara si hay más de una */}
                        {availableCameras.length > 1 && (
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/20">
                                <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                                <select
                                    value={selectedCameraId}
                                    onChange={(e) => {
                                        const newId = e.target.value;
                                        setSelectedCameraId(newId);
                                        handleStartCamera(newId);
                                    }}
                                    className="bg-transparent text-white font-body-md text-sm outline-none flex-grow cursor-pointer"
                                >
                                    {availableCameras.map(camera => (
                                        <option 
                                            key={camera.deviceId} 
                                            value={camera.deviceId}
                                            className="bg-neutral-900 text-white"
                                        >
                                            {camera.label || `Cámara ${camera.deviceId.substring(0, 5)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Visor de Video */}
                    <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-auto flex items-center justify-center">
                        <video 
                            ref={(el) => {
                                if (el) {
                                    videoRef.current = el;
                                    if (cameraStream && el.srcObject !== cameraStream) {
                                        el.srcObject = cameraStream;
                                        el.play().catch(err => {
                                            console.warn("Autoplay de video bloqueado o falló:", err);
                                        });
                                    }
                                }
                            }}
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Controles del obturador y alternancia */}
                    <div className="w-full flex justify-between items-center mb-8 max-w-md px-8">
                        {/* Espaciador para centrar obturador */}
                        <div className="w-12 h-12" />

                        {/* Shutter Button */}
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-90 transition-transform focus:outline-none"
                            aria-label="Capturar foto"
                        >
                            <div className="w-14 h-14 bg-white rounded-full" />
                        </button>

                        {/* Switch Camera Button */}
                        <button
                            type="button"
                            onClick={() => {
                                const nextMode = facingMode === 'user' ? 'environment' : 'user';
                                handleStartCamera(nextMode);
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all focus:outline-none"
                            title="Cambiar cámara"
                        >
                            <span className="material-symbols-outlined text-white text-[24px]">flip_camera_ios</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Animaciones personalizadas inline para el modal */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>

        </div>
    );
};

export default ReportScreen;