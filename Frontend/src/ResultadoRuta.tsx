import React from 'react';

const RouteResultScreen = () => {

    // Función para manejar el inicio de la navegación
    const handleStartNavigation = () => {
        console.log("Iniciando navegación guiada...");
        alert("¡Navegación iniciada! Redirigiendo a la pantalla de navegación activa.");
        // Aquí usarías tu enrutador para ir a /navegacion-activa
    };

    const handleBack = () => {
        console.log("Regresando a la pantalla de planeación de ruta...");
    };

    return (
        <div className="bg-surface h-screen w-full overflow-hidden text-on-surface font-body-md flex flex-col md:hidden relative">

            {/* Top App Bar */}
            <header
                className="flex items-center px-4 h-14 w-full z-40 bg-primary docked full-width top-0 text-on-primary absolute"
                style={{ boxShadow: 'none' }}
            >
                <button
                    aria-label="Volver"
                    className="flex items-center justify-center w-12 h-12 hover:opacity-90 active:scale-95 transition-transform"
                    onClick={handleBack}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                        arrow_back
                    </span>
                </button>
                <h1 className="font-app-title text-app-title ml-2">Tijuana Sin Barreras</h1>
            </header>

            {/* Map Canvas (Top 55%) */}
            <div
                className="absolute top-0 left-0 w-full h-[55%] z-0 bg-surface-container-low"
                style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwEqXQq6jLQvmAdafAMDYtumakZ0Rj_y1YnMMbZSCd7jVuagrjTp0W7npysV3F7rxzm-9MVMzcsFkB7OKyj6lccqKv9c_wRW1i3BOvL6aSuPxltaTh-ZIaSGwI4ae6DTKSOI1LsVmpqpbAq2yIZRZqGS3OAloHiXJKLvHhE2VirQorxb0f8sxyDKPf4rzHbjASF1LABZ2XaCysu8k8V9y4KQ8T74fGjM6R9fB0ooDJ_bfpcNdJJU7-Xt-CCpFR7GWrFvt7RI_lmy8')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Mock Map Elements Overlay */}
                <div className="relative w-full h-full">

                    {/* Start Pin */}
                    <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-full text-primary drop-shadow-md">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            location_on
                        </span>
                    </div>

                    {/* End Pin */}
                    <div className="absolute top-3/4 left-2/3 transform -translate-x-1/2 -translate-y-full text-secondary drop-shadow-md">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            flag
                        </span>
                    </div>

                    {/* Barrier X - 1 */}
                    <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-error bg-white rounded-full flex items-center justify-center w-6 h-6 shadow-sm border border-error">
                        <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </div>

                    {/* Barrier X - 2 */}
                    <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-error bg-white rounded-full flex items-center justify-center w-6 h-6 shadow-sm border border-error">
                        <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </div>

                    {/* Fake Route Line (SVG visual hack for mockup) */}
                    {/* Nota: En React, atributos como preserveaspectratio o stroke-linecap deben escribirse en camelCase */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                    >
                        <path
                            className="drop-shadow-md"
                            d="M 25 25 Q 40 40 33 60 T 66 75"
                            fill="none"
                            stroke="#004e34"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        ></path>
                    </svg>
                </div>

                {/* FAB: Accesibilidad */}
                <button
                    aria-label="Accesibilidad"
                    className="absolute bottom-6 right-4 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-primary-container transition-colors z-20 group focus:outline-none"
                >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        accessible
                    </span>
                    {/* Tooltip/Label extension on hover/focus */}
                    <span className="absolute right-16 bg-inverse-surface text-inverse-on-surface px-3 py-1 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
                        Accesibilidad
                    </span>
                </button>
            </div>

            {/* Bottom Sheet (Bottom 45% + overlap) */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-surface rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30 flex flex-col pt-2 transition-transform duration-300 transform translate-y-0">

                {/* Drag Handle Indicator */}
                <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-4"></div>

                {/* Sheet Header */}
                <div className="px-margin-mobile flex justify-between items-start mb-6">
                    <div>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                            Ruta accesible encontrada
                        </h2>
                        <div className="mt-1 inline-flex items-center gap-1 bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                            </span>
                            <span className="font-label-sm text-label-sm">Accesible</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="px-margin-mobile flex gap-2 mb-6">
                    <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-outline mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>
                            route
                        </span>
                        <span className="font-label-md text-label-md text-on-surface">2.4 km</span>
                    </div>
                    <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-outline mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>
                            schedule
                        </span>
                        <span className="font-label-md text-label-md text-on-surface">18 min</span>
                    </div>
                    <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-error mb-1" style={{ fontVariationSettings: "'FILL' 0" }}>
                            block
                        </span>
                        <span className="font-label-md text-label-md text-on-surface text-center leading-tight">
                            2 barreras evitadas
                        </span>
                    </div>
                </div>

                {/* Scrollable Steps List */}
                <div className="flex-1 overflow-y-auto px-margin-mobile pb-24">
                    <ul className="space-y-4">

                        {/* Step 1 */}
                        <li className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">1</div>
                                <div className="w-0.5 h-6 bg-surface-variant mt-2"></div>
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="font-body-md text-body-md text-on-surface">
                                    Avanza por Calle 2da (Rampa disponible en esquina).
                                </p>
                                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 block">400 m</span>
                            </div>
                        </li>

                        {/* Step 2 */}
                        <li className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">2</div>
                                <div className="w-0.5 h-6 bg-surface-variant mt-2"></div>
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="font-body-md text-body-md text-on-surface">
                                    Gira a la derecha en Av. Revolución (Banqueta en buen estado).
                                </p>
                                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 block">1.5 km</span>
                            </div>
                        </li>

                        {/* Step 3 */}
                        <li className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">3</div>
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="font-body-md text-body-md text-on-surface">
                                    Desvío ligero por rampa peatonal para evitar bache reportado.
                                </p>
                                <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 block">500 m</span>
                            </div>
                        </li>

                    </ul>
                </div>

                {/* Sticky Bottom Action Button */}
                <div className="absolute bottom-0 left-0 w-full bg-surface p-margin-mobile border-t border-surface-variant">
                    <button
                        className="w-full h-[52px] bg-primary text-on-primary rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm focus:outline-none"
                        onClick={handleStartNavigation}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            navigation
                        </span>
                        Iniciar navegación
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RouteResultScreen;