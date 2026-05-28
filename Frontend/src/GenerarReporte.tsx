import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';

// 1. Interfaz exacta para el payload del backend
interface ReportPayload {
    Ubicacion: string;
    descripcion: string;
    imagen: string; // Se enviará como Base64
}

const ReportScreen = () => {
    // Estados para construir nuestro payload
    const [ubicacion, setUbicacion] = useState<string>('Obteniendo ubicación...');
    const [descripcion, setDescripcion] = useState<string>('');
    const [tipoBarrera, setTipoBarrera] = useState<string>('Sin rampa'); // Para los chips
    const [imagenBase64, setImagenBase64] = useState<string>('');

    // Estados de la UI
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Referencia para ocultar el input real de tipo "file"
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 2. Obtener geolocalización al cargar la pantalla
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUbicacion(`${position.coords.latitude}, ${position.coords.longitude}`);
                },
                (error) => {
                    console.warn("Error obteniendo ubicación:", error);
                    // Coordenadas de Tijuana por defecto si el usuario deniega el permiso
                    setUbicacion("32.5149, -117.0382");
                }
            );
        } else {
            setUbicacion("32.5149, -117.0382");
        }
    }, []);

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

    // 4. Manejador del envío al backend (PUT)
    const handleSubmit = async () => {
        setErrorMessage(null);

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
            Ubicacion: ubicacion,
            descripcion: descripcionFinal,
            imagen: imagenBase64
        };

        try {
            console.log("-----------------------------------------");
            console.log("🚀 Enviando reporte al endpoint /crear_reporte via PUT:");
            console.log({
                Ubicacion: payload.Ubicacion,
                descripcion: payload.descripcion,
                imagen: "data:image/... (Base64 truncado para la consola)"
            });
            console.log("-----------------------------------------");

            // Reemplaza "http://localhost:8000" por tu URL real
            const response = await fetch('http://localhost:8000/crear_reporte', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error al enviar el reporte');
            }

            alert("¡Reporte enviado con éxito! Gracias por tu aporte.");
            // Limpiar formulario tras éxito
            setImagenBase64('');
            setDescripcion('');

        } catch (error: any) {
            console.error('❌ Error:', error);
            setErrorMessage("Hubo un problema de conexión. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background antialiased flex flex-col h-screen overflow-hidden">

            {/* TopAppBar */}
            <header className="flex items-center px-4 h-14 w-full z-40 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container docked full-width top-0 flat no shadows flex-shrink-0">
                <button aria-label="Volver" className="flex items-center justify-center w-12 h-12 mr-2 hover:opacity-90 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile flex-grow text-on-primary font-app-title text-app-title">
                    Tijuana Sin Barreras
                </h1>
            </header>

            {/* Main Scrollable Content */}
            <main className="flex-grow overflow-y-auto pb-24 px-margin-mobile pt-6 flex flex-col gap-6">

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

                    {/* Input oculto para manejar archivos */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-[200px] border-2 border-dashed border-primary rounded-xl flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target-min relative overflow-hidden"
                    >
                        {imagenBase64 ? (
                            // Vista previa de la imagen si ya se seleccionó una
                            <img src={imagenBase64} alt="Vista previa" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[48px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                                <span className="font-label-md text-label-md text-primary">Toca para tomar foto</span>
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
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-margin-mobile px-margin-mobile">
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
                    <div className="rounded-xl overflow-hidden relative h-[120px] bg-surface-container border border-outline-variant">
                        {/* Imagen de mapa genérica simulada */}
                        <img alt="Mapa" className="w-full h-full object-cover" src="https://maps.googleapis.com/maps/api/staticmap?center=32.5149,-117.0382&zoom=15&size=600x300&maptype=roadmap&sensor=false" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-[32px] text-error drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                        </div>
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
            </main>

            {/* BottomNavBar */}
            <nav className="fixed bottom-0 w-full h-14 z-50 flex justify-around items-center px-margin-mobile bg-surface dark:bg-surface-container text-primary font-label-sm text-label-sm shadow-sm border-t border-outline-variant/20 flex-shrink-0">
                <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 transition-all duration-200 w-16 h-full touch-target-min" href="#">
                    <span className="material-symbols-outlined mb-1">home</span>
                    <span>Inicio</span>
                </a>
                <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 transition-all duration-200 w-16 h-full touch-target-min" href="#">
                    <span className="material-symbols-outlined mb-1">map</span>
                    <span>Mapa</span>
                </a>
                <a className="flex flex-col items-center justify-center text-primary font-bold hover:bg-surface-variant/20 transition-all duration-200 w-16 h-full touch-target-min bg-primary/10 rounded-lg" href="#">
                    <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    <span>Reportar</span>
                </a>
                <a className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 transition-all duration-200 w-16 h-full touch-target-min" href="#">
                    <span className="material-symbols-outlined mb-1">person</span>
                    <span>Perfil</span>
                </a>
            </nav>

        </div>
    );
};

export default ReportScreen;