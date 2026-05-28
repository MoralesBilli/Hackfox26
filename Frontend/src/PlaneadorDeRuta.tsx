import React, { useState } from 'react';

// Interfaz para las preferencias del usuario
interface RoutePreferences {
    evitarEscalones: boolean;
    banquetasBuenEstado: boolean;
    transporteAccesible: boolean;
}

const RoutePlannerScreen = () => {
    // Estados para los campos de texto
    const [origen, setOrigen] = useState<string>('Mi ubicación actual');
    const [destino, setDestino] = useState<string>('');

    // Estado para las preferencias (con los valores por defecto que tenías en tu diseño)
    const [preferencias, setPreferencias] = useState<RoutePreferences>({
        evitarEscalones: true,
        banquetasBuenEstado: true,
        transporteAccesible: false,
    });

    // Manejador para cambiar los toggles (interruptores)
    const handleToggle = (key: keyof RoutePreferences) => {
        setPreferencias((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Manejador para autocompletar destino con destinos frecuentes
    const handleDestinoFrecuente = (lugar: string) => {
        setDestino(lugar);
    };

    // Enviar los datos para calcular la ruta
    const handleCalcularRuta = () => {
        if (!destino.trim()) {
            alert('Por favor, ingresa un destino.');
            return;
        }

        console.log('-----------------------------------------');
        console.log('🚀 Calculando ruta con los siguientes parámetros:');
        console.log({
            origen,
            destino,
            preferencias
        });
        console.log('-----------------------------------------');
        alert('Calculando ruta... Revisa la consola.');
    };

    return (
        <div className="bg-surface text-on-surface pb-[72px] min-h-screen font-body-md antialiased">

            {/* TopAppBar */}
            <header className="bg-primary flex items-center px-4 h-14 w-full z-40 fixed top-0 left-0 right-0 shadow-sm">
                <button
                    aria-label="Volver"
                    className="w-12 h-12 flex items-center justify-center text-on-primary hover:opacity-90 active:scale-95 transition-transform"
                    onClick={() => console.log('Volver a la pantalla anterior')}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary ml-2 truncate">
                    Planear ruta
                </h1>
            </header>

            <main className="mt-14 px-margin-mobile md:px-margin-desktop py-6 max-w-4xl mx-auto space-y-6">

                {/* Route Inputs */}
                <section className="space-y-4">
                    <div className="relative pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[52px] flex items-center shadow-sm">
                        <span
                            className="material-symbols-outlined text-primary absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            my_location
                        </span>
                        <div className="flex-1">
                            <label className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider block mb-0.5">
                                Origen
                            </label>
                            <input
                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface outline-none"
                                placeholder="Ingresar origen"
                                type="text"
                                value={origen}
                                onChange={(e) => setOrigen(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors min-h-[52px] flex items-center shadow-sm">
                        <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
                            search
                        </span>
                        <div className="flex-1">
                            <label className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider block mb-0.5">
                                Destino
                            </label>
                            <input
                                autoFocus
                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md text-on-surface outline-none"
                                placeholder="Buscar destino"
                                type="text"
                                value={destino}
                                onChange={(e) => setDestino(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Route Preferences */}
                <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-4 shadow-sm">
                    <h2 className="font-label-md text-label-md text-on-surface mb-2">Preferencias de ruta</h2>

                    {/* Opción 1: Evitar escalones */}
                    <div className="flex items-center justify-between py-2 border-b border-surface-variant">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant">stairs</span>
                            <span className="font-body-md text-body-md text-on-surface">Evitar escalones</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px] justify-end">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferencias.evitarEscalones}
                                onChange={() => handleToggle('evitarEscalones')}
                            />
                            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Opción 2: Solo banquetas en buen estado */}
                    <div className="flex items-center justify-between py-2 border-b border-surface-variant">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant">accessible_forward</span>
                            <span className="font-body-md text-body-md text-on-surface">Solo banquetas en buen estado</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px] justify-end">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferencias.banquetasBuenEstado}
                                onChange={() => handleToggle('banquetasBuenEstado')}
                            />
                            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Opción 3: Transporte accesible */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant">directions_bus</span>
                            <span className="font-body-md text-body-md text-on-surface">Transporte accesible</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer min-h-[48px] min-w-[48px] justify-end">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferencias.transporteAccesible}
                                onChange={() => handleToggle('transporteAccesible')}
                            />
                            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </section>

                {/* Action Button */}
                <button
                    className="w-full h-[52px] bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                    onClick={handleCalcularRuta}
                >
                    <span className="material-symbols-outlined">route</span>
                    Calcular ruta accesible
                </button>

                {/* Frequent Destinations */}
                <section className="mt-8">
                    <h2 className="font-label-md text-label-md text-on-surface mb-3">Destinos frecuentes</h2>
                    <div className="flex flex-wrap gap-2">
                        {['IMSS Zona Rio', 'DIF Tijuana', 'Centro de Salud'].map((lugar) => (
                            <button
                                key={lugar}
                                type="button"
                                className="h-8 px-4 bg-surface-container-high text-on-surface rounded-full font-label-sm text-label-sm border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-1 min-h-[48px] md:min-h-[32px]"
                                onClick={() => handleDestinoFrecuente(lugar)}
                            >
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {lugar}
                            </button>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default RoutePlannerScreen;