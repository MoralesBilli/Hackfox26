import React, { useState } from 'react';

const AccessibilityPanelScreen = ({ onNavigate }: any) => {
    // 1. Estados para controlar el panel y las preferencias
    const [isOpen, setIsOpen] = useState<boolean>(true); // Controla si el modal está abierto
    const [textSize, setTextSize] = useState<number>(3);
    const [highContrast, setHighContrast] = useState<boolean>(false);
    const [screenReader, setScreenReader] = useState<boolean>(false);
    const [voiceSpeed, setVoiceSpeed] = useState<number>(1);

    // Mapa de tamaños de texto para la vista previa
    const sizeMap: Record<number, string> = {
        1: '12px',
        2: '14px',
        3: '16px', // default body-md
        4: '18px',
        5: '20px'
    };

    // 2. Manejadores de eventos
    const handleSave = () => {
        console.log("💾 Guardando preferencias:", {
            textSize,
            highContrast,
            screenReader,
            voiceSpeed: screenReader ? voiceSpeed : null // Solo guardamos la velocidad si el lector está activo
        });
        alert("Preferencias de accesibilidad guardadas.");
        setIsOpen(false);
        onNavigate();
    };

    return (
        <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen relative">

            {/* 3. Estilos personalizados para el scrollbar y los sliders inyectados en React */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #bec9c1;
            border-radius: 10px;
        }
        
        input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: #004e34;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            border: 2px solid white;
        }
        input[type=range]:disabled::-webkit-slider-thumb {
            background: #6f7a72;
            cursor: not-allowed;
        }
      `}</style>

            {/* Mock Background App Content (Simulando la app de fondo) */}
            <div aria-hidden="true" className="p-4 opacity-50 pointer-events-none">
                <header className="h-14 bg-primary rounded-xl mb-6 flex items-center px-4">
                    <span className="material-symbols-outlined text-on-primary mr-4">menu</span>
                    <span className="font-app-title text-app-title text-on-primary">Tijuana Sin Barreras</span>
                </header>
                <div className="h-64 bg-surface-container rounded-xl mb-6 border border-outline-variant/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-4xl">map</span>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-surface-container-low rounded-xl"></div>
                    <div className="h-20 bg-surface-container-low rounded-xl"></div>
                </div>
            </div>

            {/* 4. Modal Overlay (Renderizado condicional) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
                    id="accessibility-modal"
                >
                    {/* Modal Card */}
                    <div
                        aria-labelledby="modal-title"
                        aria-modal="true"
                        className="bg-surface w-full max-w-[320px] rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col max-h-[90vh]"
                        role="dialog"
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface" id="modal-title">
                                Opciones de accesibilidad
                            </h2>
                            <button
                                aria-label="Cerrar panel de accesibilidad"
                                className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 rounded-full transition-colors -mr-2 focus:outline-none"
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onNavigate();
                                }}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="overflow-y-auto flex-grow space-y-6 pb-2 pr-1 custom-scrollbar">

                            {/* Text Size Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-2">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">format_size</span>
                                    <h3 className="font-label-md text-label-md text-on-surface">Tamaño de texto</h3>
                                </div>

                                <div className="flex items-center gap-4 h-12">
                                    <span aria-hidden="true" className="font-label-sm text-label-sm text-on-surface-variant">A</span>
                                    <input
                                        aria-label="Ajustar tamaño de texto"
                                        className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                                        max="5"
                                        min="1"
                                        type="range"
                                        value={textSize}
                                        onChange={(e) => setTextSize(Number(e.target.value))}
                                    />
                                    <span aria-hidden="true" className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant">A</span>
                                </div>

                                <div className="mt-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-center">
                                    {/* El tamaño de esta fuente cambia en tiempo real */}
                                    <p
                                        className="text-on-surface transition-all duration-200"
                                        style={{ fontSize: sizeMap[textSize] }}
                                    >
                                        Texto de prueba
                                    </p>
                                </div>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* High Contrast Toggle */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[48px] group">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">contrast</span>
                                        <span className="font-body-md text-body-md text-on-surface">Alto contraste</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            aria-label="Activar alto contraste"
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={highContrast}
                                            onChange={(e) => setHighContrast(e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </label>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* Screen Reader Toggle */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[48px] group">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">record_voice_over</span>
                                        <span className="font-body-md text-body-md text-on-surface">Lector de pantalla</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            aria-label="Activar lector de pantalla"
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={screenReader}
                                            onChange={(e) => setScreenReader(e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </label>
                            </section>

                            {/* Voice Speed Slider (Controlado por el estado screenReader) */}
                            <section
                                className={`transition-opacity duration-300 ${!screenReader ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">speed</span>
                                    <h3 className="font-label-md text-label-md text-on-surface">Velocidad de voz</h3>
                                </div>
                                <div className="flex items-center gap-4 h-[48px]">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-sm">directions_walk</span>
                                    <input
                                        aria-label="Ajustar velocidad de voz"
                                        className={`w-full h-2 bg-surface-variant rounded-lg appearance-none accent-primary outline-none ${!screenReader ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={!screenReader}
                                        max="2"
                                        min="0.5"
                                        step="0.1"
                                        type="range"
                                        value={voiceSpeed}
                                        onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                                    />
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-xl">directions_run</span>
                                </div>
                            </section>

                        </div>

                        {/* Footer / Action */}
                        <div className="mt-6 pt-4 shrink-0 border-t border-outline-variant/20">
                            <button
                                className="w-full h-[52px] bg-primary text-on-primary font-label-md text-label-md font-bold rounded-xl hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none"
                                type="button"
                                onClick={handleSave}
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">save</span>
                                Guardar preferencias
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Botón temporal para reabrir el modal (solo para pruebas) */}
            {!isOpen && (
                <button
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                </button>
            )}

        </div>
    );
};

export default AccessibilityPanelScreen;