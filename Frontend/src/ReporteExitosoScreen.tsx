const SuccessScreen = ({ onNavigate, params }: any) => {
    const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAp-4YX_MXsqh2yZmwsXpuJeLEC9opdL_E9_a4P-_bjpV-W8df8F0u5QjI5YCaCBsXNqKSXVgyS6fgihyEAf0lEwXui_wPEUGckC7NhhOE_JYpvRo6JRMAqCTf_U_fBvpQIucN9JZC2pWspKYw4HC6eEIswDneM7SADb8P-PSWpbgFzLAl47a5sJujkgoZECebCXc8w4uGVPPZIbXrqwftfEfMqlp8rbjw26grM0iAMTF2tXApCIn2cFvlySGLuw-OM8eemjUgI_vY";
    const imageUrl = params?.reporte?.url_imagen || defaultImage;
    const subcategoria = params?.reporte?.subcategoria || params?.reporte?.categoria || 'Obstáculo';
    const descripcion = params?.descripcionUsuario || params?.reporte?.descripcion_ia || 'Obstáculo en la vía pública';
    
    // Formatear coordenadas
    const lat = params?.reporte?.latitud ? params.reporte.latitud.toFixed(4) : null;
    const lng = params?.reporte?.longitud ? params.reporte.longitud.toFixed(4) : null;
    const ubicacionTexto = lat && lng ? `Tijuana (Lat: ${lat}, Long: ${lng})` : 'Ubicación registrada • Tijuana';

    return (
        <div className="bg-background min-h-screen text-on-background selection:bg-primary/20 flex flex-col font-body-md relative antialiased">

            {/* Animación de entrada inyectada directamente */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* TopAppBar - Mismo color guinda de las otras vistas */}
            <header className="bg-primary text-on-primary border-b border-primary/20 docked full-width top-0 sticky z-50 shadow-md">
                <div className="flex justify-between items-center px-margin-mobile md:px-0 max-w-[920px] mx-auto w-full h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                            <img alt="Logo App" className="w-full h-full object-cover" src="https://res.cloudinary.com/dakdmsfij/image/upload/v1780066088/logo_r8u3dl.png" />
                        </div>
                        <h1 
                            className="font-app-title text-app-title text-on-primary cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onNavigate && onNavigate('home')}
                        >
                            Tijuana Sin Barreras
                        </h1>
                    </div>

                    {/* Navegación Desktop (Oculta en móviles) */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        <button 
                            onClick={() => onNavigate && onNavigate('home')}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all text-xs font-bold cursor-pointer text-on-primary"
                        >
                            <span className="material-symbols-outlined text-[18px]">home</span>
                            Inicio
                        </button>
                        <button 
                            onClick={() => onNavigate && onNavigate('map')}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all text-xs font-bold cursor-pointer text-on-primary"
                        >
                            <span className="material-symbols-outlined text-[18px]">explore</span>
                            Mapa
                        </button>
                        <button 
                            onClick={() => onNavigate && onNavigate('report')}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all text-xs font-bold cursor-pointer text-on-primary"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Reportar
                        </button>
                        <button 
                            onClick={() => onNavigate && onNavigate('profile')}
                            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all text-xs font-bold cursor-pointer text-on-primary"
                        >
                            <span className="material-symbols-outlined text-[18px]">person</span>
                            Mi Perfil
                        </button>
                    </nav>

                    <button 
                        onClick={() => onNavigate && onNavigate('profile')}
                        className="text-on-primary hover:bg-white/10 active:scale-95 transition-all duration-150 focus:outline-none w-10 h-10 flex items-center justify-center rounded-full cursor-pointer"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

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
                        Gemini analizó tu foto: {subcategoria}
                    </p>

                    {/* Tarjeta de Resumen del Reporte */}
                    <div className="bg-surface border border-outline-variant rounded-xl p-4 w-full flex items-center gap-4 mb-10 text-left shadow-sm">
                        <div
                            className="w-16 h-16 rounded-lg bg-surface-variant bg-cover bg-center shrink-0 border border-outline-variant/30"
                            style={{ backgroundImage: `url('${imageUrl}')` }}
                        ></div>

                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <span className="font-label-md text-label-md text-on-surface mb-0.5 truncate">
                                {subcategoria}
                            </span>
                            <span className="font-body-md text-body-md text-on-surface-variant text-[14px] leading-tight mb-0.5 truncate">
                                {descripcion}
                            </span>
                            <span className="font-body-md text-body-md text-on-surface-variant/75 text-[12px] leading-tight mb-1.5 truncate">
                                {ubicacionTexto}
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
                            onClick={() => onNavigate('map')}
                        >
                            Ver en el mapa
                        </button>
                        <button
                            className="w-full h-[52px] rounded-xl bg-primary text-on-primary font-label-md text-label-md flex justify-center items-center hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={() => onNavigate('home')}
                        >
                            Ir al inicio
                        </button>
                    </div>

                </div>
            </main>

            {/* Botón Flotante de Accesibilidad */}
            <button
                onClick={() => onNavigate('accessibility')}
                aria-label="Accesibilidad"
                className="fixed bottom-[144px] left-6 md:left-auto md:right-8 md:bottom-8 w-[56px] h-[56px] bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0px_4px_12px_rgba(0,0,0,0.15)] z-50 hover:bg-primary-container transition-transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
            >
                <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    accessible
                </span>
                <span className="absolute left-full ml-4 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Accesibilidad
                </span>
            </button>

            {/* BottomNavBar (Escondida en desktop) */}
            <nav className="bg-surface/85 backdrop-blur-md border-t border-outline-variant/30 shadow-lg fixed bottom-0 left-0 right-0 w-full flex justify-around items-center px-4 py-2 pb-[env(safe-area-inset-bottom)] z-50 md:hidden animate-[fadeIn_0.3s_ease-out]">
                <button 
                    onClick={() => onNavigate && onNavigate('home')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                >
                    <span className="material-symbols-outlined">home</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('map')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                >
                    <span className="material-symbols-outlined">explore</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('report')}
                    className="flex items-center justify-center text-primary font-bold w-12 h-12 bg-surface-variant/30 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('profile')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                >
                    <span className="material-symbols-outlined">person</span>
                </button>
            </nav>
        </div>
    );
};

export default SuccessScreen;