const OnboardingScreen = ({ onNavigate }: any) => {
    return (
        <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary">

            {/* Main Content Canvas */}
            <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop w-full max-w-4xl mx-auto z-10">

                {/* Logo Header Section */}
                <header className="flex flex-col items-center text-center w-full">
                    {/* Custom Location Pin Logo */}
                    <div className="relative w-24 h-24 flex items-center justify-center mb-6 drop-shadow-md">
                        <span
                            className="material-symbols-outlined text-[96px] text-primary-container absolute"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            location_on
                        </span>
                        <span
                            className="material-symbols-outlined text-[40px] text-on-primary relative -top-3"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            accessible
                        </span>
                    </div>
                    <h1 className="font-app-title text-app-title text-secondary tracking-tight">
                        Tijuana Sin Barreras
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                        Movilidad digna para todos
                    </p>
                </header>

                {/* Action Buttons Section */}
                <section className="w-full max-w-sm mt-12 flex flex-col gap-4">
                    <button
                        className="w-full h-[52px] bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center transition-all hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 active:scale-[0.98]"
                        onClick={() => onNavigate('login')}
                    >
                        Iniciar sesión
                    </button>

                    <button
                        className="w-full h-[52px] bg-transparent border-2 border-primary text-primary rounded-xl font-label-md text-label-md flex items-center justify-center transition-all hover:bg-primary/5 focus:ring-4 focus:ring-primary/20 active:scale-[0.98]"
                        onClick={() => onNavigate('registro')}
                    >
                        Registrarse
                    </button>
                </section>

                {/* Secondary Action */}
                <div className="mt-8">
                    <a
                        className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:underline rounded-sm px-2 py-1"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate('home');
                        }}
                    >
                        Explorar sin cuenta
                        <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'wght' 600" }}
                        >
                            arrow_forward
                        </span>
                    </a>
                </div>
            </main>

            {/* Floating Accessibility Button */}
            <button
                onClick={() => onNavigate('accessibility')}
                aria-label="Opciones de Accesibilidad"
                className="fixed bottom-margin-mobile right-margin-mobile md:bottom-margin-desktop md:right-margin-desktop h-[56px] px-6 bg-primary text-on-primary rounded-full flex items-center gap-2 shadow-[0px_4px_12px_rgba(0,0,0,0.15)] z-50 transition-transform hover:scale-105 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-primary/30 group"
            >
                <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    accessible
                </span>
                <span className="font-label-md text-label-md font-bold whitespace-nowrap">
                    Accesibilidad
                </span>
            </button>

        </div>
    );
};

export default OnboardingScreen;