import React, { useState, useEffect } from 'react';
import { useAccessibility } from './AccesibilidadContext';
import type { ColorBlindMode } from './AccesibilidadContext';

const AccessibilityPanelScreen = ({ onNavigate }: { onNavigate?: (screen: string) => void }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const { settings, updateSetting } = useAccessibility();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) closePanel();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const closePanel = () => {
        setIsOpen(false);
        if (onNavigate) onNavigate('feed');
    };

    return (
        <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen relative">

            {/* Mantuvimos solo los estilos locales que necesita este panel (inputs y scroll) */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #bec9c1; border-radius: 10px; }
                
                input[type=range]::-webkit-slider-thumb {
                    appearance: none; width: 24px; height: 24px; background: #004e34;
                    border-radius: 50%; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 2px solid white;
                }
                input[type=range] { height: 24px; }
                input[type=range]:disabled::-webkit-slider-thumb { background: #6f7a72; cursor: not-allowed; }
            `}</style>

            {/* Background App Mock */}
            <div aria-hidden="true" className="p-4 opacity-50 pointer-events-none">
                <header className="h-14 bg-primary rounded-xl mb-6 flex items-center px-4">
                    <span className="material-symbols-outlined text-on-primary mr-4">menu</span>
                    <span className="font-app-title text-app-title text-on-primary">Tijuana Sin Barreras</span>
                </header>
                <div className="h-64 bg-surface-container rounded-xl mb-6 border border-outline-variant/30 flex items-center justify-center overflow-hidden relative">
                    <span className="material-symbols-outlined text-outline text-4xl">map</span>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
                        <div className="w-6 h-6 rounded-full bg-green-500"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                        <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm" role="presentation">
                    <div aria-labelledby="modal-title" aria-modal="true" className="bg-surface w-full max-w-[340px] rounded-xl p-6 shadow-2xl border border-outline-variant/20 flex flex-col max-h-[90vh]" role="dialog">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface focus:outline-none" id="modal-title" tabIndex={-1}>
                                Accesibilidad
                            </h2>
                            <button aria-label="Cerrar panel" className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 rounded-full" onClick={closePanel}>
                                <span aria-hidden="true" className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Controles de accesibilidad */}
                        <div className="overflow-y-auto flex-grow space-y-6 pb-2 pr-2 custom-scrollbar">

                            {/* Tamaño de texto */}
                            <section>
                                <div className="flex items-center gap-2 mb-2">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">format_size</span>
                                    <h3 className="font-label-md text-label-md text-on-surface" id="text-size-label">Tamaño de texto</h3>
                                </div>
                                <div className="flex items-center gap-4 h-12">
                                    <span aria-hidden="true" className="font-label-sm text-label-sm text-on-surface-variant">A</span>
                                    <input
                                        aria-labelledby="text-size-label"
                                        className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                                        max="5" min="1" type="range"
                                        value={settings.textSize}
                                        onChange={(e) => updateSetting('textSize', Number(e.target.value))}
                                    />
                                    <span aria-hidden="true" className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant">A</span>
                                </div>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* Fuente para Dislexia */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[48px] group">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined">spellcheck</span>
                                        <div className="flex flex-col">
                                            <span className="font-body-md text-body-md">Fuente para dislexia</span>
                                            <span className="text-[10px] text-on-surface-variant">Mejora la legibilidad</span>
                                        </div>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            aria-label="Activar fuente para dislexia" role="switch" type="checkbox" className="sr-only peer"
                                            checked={settings.dyslexiaFont}
                                            onChange={(e) => updateSetting('dyslexiaFont', e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
                                    </div>
                                </label>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* Filtros de Daltonismo */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">palette</span>
                                    <h3 className="font-label-md text-label-md text-on-surface">Ajuste de color (Daltonismo)</h3>
                                </div>
                                <select
                                    aria-label="Seleccionar filtro de color para daltonismo"
                                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface p-3 rounded-xl appearance-none outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                                    value={settings.colorBlindMode}
                                    onChange={(e) => updateSetting('colorBlindMode', e.target.value as ColorBlindMode)}
                                >
                                    <option value="none">Por defecto (Sin filtro)</option>
                                    <option value="protanopia">Protanopía (Rojo - Verde)</option>
                                    <option value="deuteranopia">Deuteranopía (Verde - Rojo)</option>
                                    <option value="tritanopia">Tritanopía (Azul - Amarillo)</option>
                                    <option value="achromatopsia">Acromatopsia (Escala de grises)</option>
                                </select>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* Alto Contraste */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[48px] group">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined">contrast</span>
                                        <span className="font-body-md text-body-md">Alto contraste</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            aria-label="Activar alto contraste" role="switch" type="checkbox" className="sr-only peer"
                                            checked={settings.highContrast}
                                            onChange={(e) => updateSetting('highContrast', e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
                                    </div>
                                </label>
                            </section>

                            <hr className="border-outline-variant/30" />

                            {/* Lector de Pantalla */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[48px] group">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined">record_voice_over</span>
                                        <span className="font-body-md text-body-md">Asistente de voz</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            aria-label="Activar asistente de voz" role="switch" type="checkbox" className="sr-only peer"
                                            checked={settings.screenReader}
                                            onChange={(e) => updateSetting('screenReader', e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
                                    </div>
                                </label>
                            </section>
                        </div>

                        {/* Botón Listo */}
                        <div className="mt-6 pt-4 shrink-0 border-t border-outline-variant/20">
                            <button
                                className="w-full h-[52px] bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                                onClick={closePanel}
                            >
                                <span aria-hidden="true" className="material-symbols-outlined">check</span>
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón flotante para abrir */}
            {!isOpen && (
                <button
                    aria-label="Abrir panel de accesibilidad"
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
                    onClick={() => setIsOpen(true)}
                >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                </button>
            )}
        </div>
    );
};

export default AccessibilityPanelScreen;