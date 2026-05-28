import React, { useState } from 'react';

const ActiveNavigationScreen = () => {
    // Estado para controlar si la asistencia por voz está activa o no
    const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

    // Funciones simuladas para los botones
    const handleEndNavigation = () => {
        console.log("Terminar navegación y regresar al mapa principal");
        alert("Saliendo de la navegación...");
    };

    const handleReportBarrier = () => {
        console.log("Abrir modal o pantalla para reportar barrera rápida");
    };

    const handleRecalculate = () => {
        console.log("Recalculando ruta...");
    };

    return (
        <div className="bg-background text-on-background h-screen w-full flex flex-col overflow-hidden relative font-body-md">

            {/* Estilos inyectados para el mapa base y los elementos de ruta */}
            <style>{`
        .map-bg {
          background-color: #e5e3df;
          /* Placeholder de mapa */
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfMuqdAyw5H59PcDT2D17ZrncjLFbiC7idDOOEGV2b3Pf_1K4KYw0NJmsdHNbEWNkKaQQjQYXSl43JUOshLdDSfaczSNRGFzEp5KnT733SThfn25xrNEoI72K2FNPIxcD2tOk_dZ7KrNnD-FZgz_m4jXnGo7V6evt0Z2S2B-0pNN9Xfzteg1HsaCX8w_AEyON-1IaelfMkKPIyQxjQxrzgZ0PON_gbANVkl8sxa3s1YHdwfgAYCoJd9PWzvVeUwi_YDFzoiD0vN68');
          background-size: cover;
          background-position: center;
        }
        .route-line {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 120px;
          background-color: #006847; /* Primary Container */
          transform-origin: bottom center;
          transform: translate(-50%, -100%) rotate(15deg);
          z-index: 10;
        }
        .user-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          background-color: #3959b0; /* Secondary */
          border: 3px solid #fff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 4px rgba(57, 89, 176, 0.2);
          z-index: 11;
        }
      `}</style>

            {/* Top Navigation Overlay */}
            <div className="absolute top-0 left-0 w-full z-40 bg-surface shadow-sm">
                <div className="flex items-center px-4 h-14 w-full justify-between">
                    <button
                        aria-label="Cerrar navegación"
                        className="flex items-center justify-center w-[48px] h-[48px] text-on-surface hover:opacity-90 active:scale-95 transition-transform"
                        onClick={handleEndNavigation}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                    </button>

                    <div className="flex flex-col items-center flex-1">
                        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center">
                            Hacia IMSS Zona Rio
                        </h1>
                    </div>

                    <div className="flex items-center justify-center w-[48px] h-[48px]">
                        <span className="font-label-md text-label-md text-primary font-bold">18 min</span>
                    </div>
                </div>
            </div>

            {/* Map Area (Fills remaining space behind overlays) */}
            <div className="flex-1 w-full relative map-bg z-0 h-[530px] md:h-full">
                {/* Elementos de Navegación */}
                <div className="route-line"></div>
                <div className="user-dot"></div>

                {/* Voice Activation Pill */}
                <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 z-20">
                    <button
                        className={`px-4 py-2 rounded-full flex items-center shadow-md gap-2 transition-colors focus:outline-none ${voiceEnabled ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
                            }`}
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                    >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {voiceEnabled ? 'volume_up' : 'volume_off'}
                        </span>
                        <span className="font-label-sm text-label-sm">
                            {voiceEnabled ? 'Voz activada' : 'Voz desactivada'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Panel */}
            <div className="absolute bottom-0 left-0 w-full bg-surface z-30 rounded-t-[24px] shadow-[0px_-4px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant flex flex-col pt-6 px-margin-mobile pb-6 min-h-[353px] md:min-h-0 md:h-auto md:max-w-[400px] md:bottom-margin-mobile md:left-margin-desktop md:rounded-[24px]">

                {/* Current Instruction Card */}
                <div className="bg-primary text-on-primary rounded-xl p-4 flex items-center gap-4 shadow-sm w-full min-h-[52px]">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        straight
                    </span>
                    <div className="flex flex-col">
                        <span className="font-body-md text-body-md font-bold text-[18px] leading-[24px]">
                            Continúa recto por Blvd. Agua Caliente
                        </span>
                        <span className="font-label-md text-label-md opacity-90 text-[14px]">en 200 m</span>
                    </div>
                </div>

                {/* Next Instruction Context */}
                <div className="mt-4 mb-6 px-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        turn_right
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">Luego gira a la derecha</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-auto">
                    {/* Alert/Report Button */}
                    <button
                        className="w-full min-h-[52px] rounded-lg border-2 border-[#D85A30] text-[#D85A30] font-label-md text-label-md flex items-center justify-center gap-2 bg-surface hover:bg-[#D85A30]/10 active:scale-[0.98] transition-all focus:outline-none"
                        onClick={handleReportBarrier}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        Reportar barrera aquí
                    </button>

                    {/* Recalculate Button */}
                    <button
                        className="w-full min-h-[52px] rounded-lg border border-primary text-primary font-label-md text-label-md flex items-center justify-center gap-2 bg-surface hover:bg-primary/10 active:scale-[0.98] transition-all focus:outline-none"
                        onClick={handleRecalculate}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                        Recalcular ruta
                    </button>
                </div>
            </div>

            {/* Accessibility FAB (Smaller contextual) */}
            <div className="absolute right-margin-mobile bottom-[397px] md:bottom-[400px] z-30">
                <button
                    aria-label="Accesibilidad"
                    className="w-[44px] h-[44px] bg-primary text-on-primary rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform focus:outline-none"
                >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        accessible
                    </span>
                </button>
            </div>

        </div>
    );
};

export default ActiveNavigationScreen;