import React from 'react';

const SuccessScreen = () => {
    return (
        <div className="bg-background min-h-screen text-on-background selection:bg-primary/20 flex flex-col font-body-md relative antialiased">

            {/* Animación de entrada inyectada directamente */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile w-full max-w-[1024px] mx-auto py-12">
                <div className="flex flex-col items-center justify-center text-center max-w-sm w-full animate-[fadeIn_0.5s_ease-out]">

                    {/* Icono de Éxito */}
                    <span
                        className="material-symbols-outlined text-[80px] text-primary mb-6"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        check_circle
                    </span>

                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile mb-2 text-on-background">
                        ¡Reporte enviado!
                    </h1>

                    {/* Chip de Análisis de Gemini */}
                    <p className="font-body-md text-body-md text-tertiary-fixed-dim font-medium mb-10 flex items-center gap-2 justify-center bg-tertiary/5 px-4 py-1.5 rounded-full">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        Gemini analizó tu foto: Banqueta rota
                    </p>

                    {/* Tarjeta de Resumen del Reporte */}
                    <div className="bg-surface border border-outline-variant rounded-xl p-4 w-full flex items-center gap-4 mb-10 text-left shadow-sm">
                        {/* NOTA: En un futuro, cambiarás este backgroundImage por la URL real 
              de la imagen que el usuario acaba de tomar en la pantalla anterior.
            */}
                        <div
                            className="w-16 h-16 rounded-lg bg-surface-variant bg-cover bg-center shrink-0 border border-outline-variant/30"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAp-4YX_MXsqh2yZmwsXpuJeLEC9opdL_E9_a4P-_bjpV-W8df8F0u5QjI5YCaCBsXNqKSXVgyS6fgihyEAf0lEwXui_wPEUGckC7NhhOE_JYpvRo6JRMAqCTf_U_fBvpQIucN9JZC2pWspKYw4HC6eEIswDneM7SADb8P-PSWpbgFzLAl47a5sJujkgoZECebCXc8w4uGVPPZIbXrqwftfEfMqlp8rbjw26grM0iAMTF2tXApCIn2cFvlySGLuw-OM8eemjUgI_vY')" }}
                        ></div>

                        <div className="flex flex-col justify-center">
                            <span className="font-label-md text-label-md text-on-surface mb-0.5">
                                Banqueta rota
                            </span>
                            <span className="font-body-md text-body-md text-on-surface-variant text-[14px] leading-tight mb-1">
                                Av. Revolución 1234, Zona Centro
                            </span>
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                Hace unos segundos
                            </span>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="w-full flex flex-col gap-4 mt-auto">
                        <button
                            className="w-full h-[52px] rounded-xl border-2 border-primary text-primary font-label-md text-label-md flex justify-center items-center hover:bg-primary/5 active:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={() => console.log("Navegando al mapa...")}
                        >
                            Ver en el mapa
                        </button>
                        <button
                            className="w-full h-[52px] rounded-xl bg-primary text-on-primary font-label-md text-label-md flex justify-center items-center hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={() => console.log("Navegando al Home...")}
                        >
                            Ir al inicio
                        </button>
                    </div>

                </div>
            </main>

            {/* Botón Flotante de Accesibilidad */}
            <button
                aria-label="Accesibilidad"
                className="fixed bottom-6 right-6 w-[56px] h-[56px] bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0px_4px_12px_rgba(0,0,0,0.15)] z-50 hover:bg-primary-container transition-transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    accessible
                </span>
                <span className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Accesibilidad
                </span>
            </button>

        </div>
    );
};

export default SuccessScreen;