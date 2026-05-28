import React, { useState } from 'react';

const MapScreen = () => {
    // Estado para controlar el input de búsqueda del mapa
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="bg-background text-on-background font-body-md h-screen w-screen overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container">

            {/* Inyectamos los estilos CSS personalizados del mapa directamente en el componente.
        En un proyecto grande, podrías mover esto a tu archivo index.css
      */}
            <style>{`
        .map-bg {
          background-color: #e5e3df;
          background-image: 
            linear-gradient(45deg, #f0ede8 25%, transparent 25%, transparent 75%, #f0ede8 75%, #f0ede8),
            linear-gradient(45deg, #f0ede8 25%, transparent 25%, transparent 75%, #f0ede8 75%, #f0ede8);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
        .accessible-path {
          position: absolute;
          height: 6px;
          background-color: #004e34;
          border-radius: 3px;
          transform-origin: left center;
        }
      `}</style>

            {/* Top Navigation Container (Web - Hidden on Mobile) */}
            <header className="hidden md:flex items-center px-4 h-14 w-full z-40 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container fixed top-0 left-0 right-0 shadow-sm">
                <div className="flex items-center gap-4 w-full max-w-5xl mx-auto">
                    <span className="material-symbols-outlined hover:opacity-90 active:scale-95 transition-transform cursor-pointer touch-target-min flex items-center justify-center">
                        arrow_back
                    </span>
                    <h1 className="font-headline-lg text-headline-lg flex-1">Tijuana Sin Barreras</h1>
                    <nav className="flex items-center gap-6">
                        <a className="text-on-primary/70 hover:opacity-90 font-label-md text-label-md flex items-center gap-2" href="#" onClick={e => e.preventDefault()}>
                            <span className="material-symbols-outlined">home</span>Inicio
                        </a>
                        <a className="text-on-primary hover:opacity-90 font-label-md text-label-md flex items-center gap-2 border-b-2 border-on-primary pb-1" href="#" onClick={e => e.preventDefault()}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>Mapa
                        </a>
                        <a className="text-on-primary/70 hover:opacity-90 font-label-md text-label-md flex items-center gap-2" href="#" onClick={e => e.preventDefault()}>
                            <span className="material-symbols-outlined">add_circle</span>Reportar
                        </a>
                        <a className="text-on-primary/70 hover:opacity-90 font-label-md text-label-md flex items-center gap-2" href="#" onClick={e => e.preventDefault()}>
                            <span className="material-symbols-outlined">person</span>Perfil
                        </a>
                    </nav>
                </div>
            </header>

            {/* Map Canvas (Simulated) */}
            <main className="w-full h-full relative map-bg md:pt-14" data-location="Tijuana">

                {/* Accessible Paths (Simulated) */}
                <div className="accessible-path" style={{ top: '40%', left: '20%', width: '150px', transform: 'rotate(15deg)' }}></div>
                <div className="accessible-path" style={{ top: '45%', left: '33%', width: '200px', transform: 'rotate(-10deg)' }}></div>
                <div className="accessible-path" style={{ top: '38%', left: '50%', width: '120px', transform: 'rotate(45deg)' }}></div>

                {/* Pins */}
                {/* Barrier Pin 1 */}
                <div className="absolute w-8 h-8 -ml-4 -mt-8 flex items-center justify-center cursor-pointer z-10" style={{ top: '50%', left: '40%' }}>
                    <div className="bg-error text-on-error rounded-full w-8 h-8 flex items-center justify-center shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    </div>
                    <div className="absolute bottom-[-4px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-error"></div>
                </div>

                {/* Barrier Pin Cluster */}
                <div className="absolute w-10 h-10 -ml-5 -mt-10 flex items-center justify-center cursor-pointer z-10" style={{ top: '30%', left: '60%' }}>
                    <div className="bg-error text-on-error rounded-full w-10 h-10 flex items-center justify-center shadow-md relative z-10 border-2 border-surface">
                        <span className="font-label-md text-label-md">3</span>
                    </div>
                </div>

                {/* Service Pin (IMSS) */}
                <div className="absolute w-8 h-8 -ml-4 -mt-8 flex items-center justify-center cursor-pointer z-10" style={{ top: '25%', left: '30%' }}>
                    <div className="bg-secondary text-on-secondary rounded-full w-8 h-8 flex items-center justify-center shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                    </div>
                    <div className="absolute bottom-[-4px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-secondary"></div>
                </div>

                {/* User Location */}
                <div className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center cursor-pointer z-20" style={{ top: '55%', left: '50%' }}>
                    <div className="absolute w-full h-full bg-secondary-container/40 rounded-full animate-ping"></div>
                    <div className="bg-secondary border-2 border-surface text-on-secondary rounded-full w-4 h-4 shadow-sm z-10"></div>
                </div>

                {/* Search Overlay (Mobile & Desktop Overlay) */}
                <div className="absolute top-4 left-4 right-4 md:left-auto md:right-auto md:top-20 md:w-96 z-30 flex justify-center w-[calc(100%-32px)]">
                    <div className="bg-surface rounded-full shadow-sm flex items-center w-full max-w-md h-[52px] px-2 border border-surface-variant">
                        <button className="w-[48px] h-[48px] flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors md:hidden">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <input
                            className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md px-2 outline-none placeholder:text-on-surface-variant"
                            placeholder="Buscar destino o lugar"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="w-[48px] h-[48px] flex items-center justify-center text-on-surface hover:bg-surface-variant/20 rounded-full transition-colors">
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                    </div>
                </div>

                {/* FAB for Accessibility (Right aligned, above bottom sheet) */}
                <button aria-label="Accesibilidad" className="absolute right-4 bottom-[40%] md:bottom-24 w-[56px] h-[56px] bg-primary text-on-primary rounded-full shadow-sm flex items-center justify-center z-30 hover:scale-105 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                    <span className="sr-only">Accesibilidad</span>
                </button>

                {/* Text label for FAB on Desktop to comply with rules */}
                <div className="hidden md:flex absolute right-4 bottom-[calc(24px+56px+8px)] bg-surface text-on-surface font-label-sm text-label-sm px-2 py-1 rounded shadow-sm z-30">
                    Accesibilidad
                </div>

                {/* Bottom Sheet (Mobile) / Side Panel (Desktop) */}
                <div className="absolute bottom-14 md:bottom-0 left-0 right-0 md:left-4 md:right-auto md:top-20 md:w-96 md:h-[calc(100vh-80px-56px)] bg-surface rounded-t-[16px] md:rounded-[16px] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:shadow-sm z-30 flex flex-col max-h-[397px] md:max-h-none h-[35%] md:h-auto border border-surface-variant md:border-b-0 overflow-hidden">

                    {/* Drag Handle (Mobile only) */}
                    <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                        <div className="w-8 h-1 bg-outline-variant rounded-full"></div>
                    </div>

                    {/* Sheet Header */}
                    <div className="px-margin-mobile pt-2 pb-4 shrink-0">
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">Cerca de ti</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">3 barreras en 500m</p>
                    </div>

                    {/* Horizontal Scroll List */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden md:overflow-y-auto md:overflow-x-hidden flex md:flex-col gap-4 px-margin-mobile pb-4 snap-x">

                        {/* Barrier Card 1 */}
                        <div className="shrink-0 w-64 md:w-full bg-surface-container-low border border-surface-variant rounded-lg p-3 flex flex-col gap-2 snap-center h-full max-h-[120px] justify-between">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-label-md text-label-md text-on-surface truncate">Banqueta Rota</h3>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">A 150m</p>
                                </div>
                            </div>
                        </div>

                        {/* Barrier Card 2 */}
                        <div className="shrink-0 w-64 md:w-full bg-surface-container-low border border-surface-variant rounded-lg p-3 flex flex-col gap-2 snap-center h-full max-h-[120px] justify-between">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-label-md text-label-md text-on-surface truncate">Rampa Obstruida</h3>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">A 200m</p>
                                </div>
                            </div>
                        </div>

                        {/* Barrier Card 3 */}
                        <div className="shrink-0 w-64 md:w-full bg-surface-container-low border border-surface-variant rounded-lg p-3 flex flex-col gap-2 snap-center h-full max-h-[120px] justify-between">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-label-md text-label-md text-on-surface truncate">Obras en curso</h3>
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">A 450m</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-margin-mobile py-4 bg-surface border-t border-surface-variant flex gap-3 shrink-0">
                        <button className="flex-1 h-[52px] border-2 border-primary text-primary font-label-md text-label-md rounded-lg flex items-center justify-center px-4 hover:bg-primary/5 active:bg-primary/10 transition-colors touch-target-min">
                            Ver ruta accesible
                        </button>
                        <button className="flex-1 h-[52px] bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center px-4 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all touch-target-min">
                            Cómo llegar
                        </button>
                    </div>
                </div>
            </main>

            {/* BottomNavBar (Mobile) */}
            <nav className="fixed bottom-0 w-full h-14 z-50 flex justify-around items-center px-margin-mobile bg-surface dark:bg-surface-container shadow-sm md:hidden pb-[env(safe-area-inset-bottom)]">
                <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/20 h-full px-2 min-w-[64px] touch-target-min" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-label-sm text-label-sm mt-1">Inicio</span>
                </a>
                <a className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold hover:bg-surface-variant/20 h-full px-2 min-w-[64px] touch-target-min transition-all duration-200" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                    <span className="font-label-sm text-label-sm mt-1">Mapa</span>
                </a>
                <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/20 h-full px-2 min-w-[64px] touch-target-min" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">add_circle</span>
                    <span className="font-label-sm text-label-sm mt-1">Reportar</span>
                </a>
                <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/20 h-full px-2 min-w-[64px] touch-target-min" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">person</span>
                    <span className="font-label-sm text-label-sm mt-1">Perfil</span>
                </a>
            </nav>

        </div>
    );
};

export default MapScreen;