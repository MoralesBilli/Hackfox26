const HomeScreen = ({ onNavigate }: any) => {
    return (
        <div className="bg-surface text-on-surface flex flex-col min-h-screen">

            {/* TopAppBar */}
            <header className="flex items-center justify-between px-margin-mobile h-14 w-full z-40 bg-primary text-on-primary docked full-width top-0 sticky shadow-sm">
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile truncate">
                    Hola, Eduardo
                </h1>
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md shrink-0">
                    EV
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow px-margin-mobile pt-6 pb-32 flex flex-col gap-6 max-w-[1024px] mx-auto w-full">

                {/* Search Bar */}
                <div className="relative w-full h-[52px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex items-center px-4 gap-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant">search</span>
                    <input
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-on-surface-variant h-full outline-none"
                        placeholder="¿A dónde quieres ir?"
                        type="text"
                    />
                    <button
                        aria-label="Búsqueda por voz"
                        className="min-w-[48px] h-[48px] flex items-center justify-center -mr-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">mic</span>
                    </button>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        className="bg-primary text-on-primary rounded-xl p-4 flex flex-col gap-3 items-start justify-center shadow-sm hover:opacity-90 transition-opacity min-h-[100px]"
                        onClick={() => onNavigate('map')}
                    >
                        <div className="w-10 h-10 rounded-full bg-on-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                        </div>
                        <span className="font-label-md">Ver mapa</span>
                    </button>

                    <button
                        className="bg-[#D85A30] text-white rounded-xl p-4 flex flex-col gap-3 items-start justify-center shadow-sm hover:opacity-90 transition-opacity min-h-[100px]"
                        onClick={() => onNavigate('report')}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        </div>
                        <span className="font-label-md">Reportar barrera</span>
                    </button>
                </div>

                {/* Recent Barriers List */}
                <section className="flex flex-col gap-4 mt-2">
                    <h2 className="font-label-md text-lg text-on-surface">Barreras recientes cerca de ti</h2>

                    <div className="flex flex-col gap-3">
                        {/* Item 1 */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-start gap-4 min-h-[52px]">
                            <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 mt-1">
                                <span className="material-symbols-outlined text-[18px]">accessible</span>
                            </div>
                            <div className="flex flex-col flex-grow">
                                <h3 className="font-label-md text-on-surface">Rampa Obstruida</h3>
                                <p className="font-body-md text-sm text-on-surface-variant">Av. Revolución 1234, Zona Centro</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant font-label-sm">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">directions_walk</span> 150m
                                    </span>
                                    <span>•</span>
                                    <span>Hace 10 min</span>
                                </div>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-start gap-4 min-h-[52px]">
                            <div className="w-8 h-8 rounded-full bg-[#f57c00] text-white flex items-center justify-center shrink-0 mt-1">
                                <span className="material-symbols-outlined text-[18px]">construction</span>
                            </div>
                            <div className="flex flex-col flex-grow">
                                <h3 className="font-label-md text-on-surface">Banqueta Rota</h3>
                                <p className="font-body-md text-sm text-on-surface-variant">Calle 4ta, Esquina Constitución</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant font-label-sm">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">directions_walk</span> 300m
                                    </span>
                                    <span>•</span>
                                    <span>Hace 1 hora</span>
                                </div>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-start gap-4 min-h-[52px]">
                            <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed flex items-center justify-center shrink-0 mt-1">
                                <span className="material-symbols-outlined text-[18px]">car_crash</span>
                            </div>
                            <div className="flex flex-col flex-grow">
                                <h3 className="font-label-md text-on-surface">Auto en banqueta</h3>
                                <p className="font-body-md text-sm text-on-surface-variant">Blvd. Agua Caliente, frente a plaza</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant font-label-sm">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">directions_walk</span> 450m
                                    </span>
                                    <span>•</span>
                                    <span>Hace 3 horas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => onNavigate('map')} className="text-primary font-label-md flex items-center gap-1 w-fit mt-2 hover:opacity-80 transition-opacity min-h-[48px] px-2 -ml-2">
                        Ver todas en el mapa <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </section>
            </main>

            {/* Floating Accessibility Button (FAB) */}
            <button
                onClick={() => onNavigate('accessibility')}
                aria-label="Accesibilidad"
                className="fixed bottom-[144px] right-4 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)] z-40 hover:scale-105 transition-transform group flex-row px-4 gap-2 w-auto min-w-[140px] h-[56px]"
            >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                <span className="font-label-md font-bold">Accesibilidad</span>
            </button>

            {/* BottomNavBar */}
            <nav className="fixed bottom-0 w-full h-14 z-50 flex justify-around items-center px-margin-mobile bg-surface shadow-[0_-1px_3px_rgba(0,0,0,0.05)] border-t border-surface-variant/30 md:hidden">
                {/* Active Tab */}
                <a
                    className="flex flex-col items-center justify-center text-primary font-bold min-w-[48px] min-h-[48px] hover:bg-surface-variant/20 transition-all duration-200 rounded-lg p-1"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
                >
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                    <span className="font-label-sm mt-1">Inicio</span>
                </a>

                {/* Inactive Tabs */}
                <a
                    className="flex flex-col items-center justify-center text-on-surface-variant min-w-[48px] min-h-[48px] hover:bg-surface-variant/20 transition-all rounded-lg p-1"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('map'); }}
                >
                    <span className="material-symbols-outlined text-[24px]">map</span>
                    <span className="font-label-sm mt-1">Mapa</span>
                </a>

                <a
                    className="flex flex-col items-center justify-center text-on-surface-variant min-w-[48px] min-h-[48px] hover:bg-surface-variant/20 transition-all rounded-lg p-1"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('report'); }}
                >
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                    <span className="font-label-sm mt-1">Reportar</span>
                </a>

                <a
                    className="flex flex-col items-center justify-center text-on-surface-variant min-w-[48px] min-h-[48px] hover:bg-surface-variant/20 transition-all rounded-lg p-1"
                    href="#"
                    onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                >
                    <span className="material-symbols-outlined text-[24px]">person</span>
                    <span className="font-label-sm mt-1">Perfil</span>
                </a>
            </nav>

        </div>
    );
};

export default HomeScreen;