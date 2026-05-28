import React from 'react';

const ProfileScreen = () => {
    // Función simulada para cerrar sesión
    const handleLogout = () => {
        const confirmar = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
        if (confirmar) {
            console.log('Cerrando sesión...');
            alert('Sesión cerrada exitosamente');
            // Aquí iría la lógica para borrar tokens y redirigir a LoginScreen
        }
    };

    return (
        <div className="bg-surface text-on-surface font-body-md text-body-md antialiased md:max-w-[1024px] md:mx-auto relative min-h-screen pb-20">

            {/* TopAppBar */}
            <header className="flex items-center px-4 h-14 w-full z-40 sticky top-0 bg-primary text-on-primary">
                <button
                    aria-label="Volver"
                    className="w-12 h-12 flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform -ml-2 mr-2"
                    onClick={() => console.log('Volver a la pantalla anterior')}
                >
                    <span className="material-symbols-outlined text-on-primary">arrow_back</span>
                </button>
                <h1 className="font-app-title text-app-title text-on-primary flex-1 truncate">
                    Tijuana Sin Barreras
                </h1>
            </header>

            {/* Main Content Canvas */}
            <main className="flex flex-col gap-6 pt-4">

                {/* Profile Header Area */}
                <section className="px-margin-mobile flex flex-col items-center pt-4 pb-2">
                    <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-4 shadow-sm border-2 border-surface-container-lowest">
                        <span className="font-app-title text-app-title text-on-primary-container">EV</span>
                    </div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Eduardo Vázquez</h2>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">Tijuana, BC</p>
                </section>

                {/* Metric Row */}
                <section className="px-margin-mobile grid grid-cols-3 gap-4">
                    <div className="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/30 text-center shadow-sm">
                        <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">12</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">reportes</span>
                    </div>
                    <div className="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/30 text-center shadow-sm">
                        <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">8</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">rutas</span>
                    </div>
                    <div className="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/30 text-center shadow-sm">
                        <span className="material-symbols-outlined text-primary mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                            Nivel<br />Ciudadano
                        </span>
                    </div>
                </section>

                {/* Mis reportes recientes */}
                <section className="px-margin-mobile mt-2">
                    <h3 className="font-label-md text-label-md text-on-surface mb-4">Mis reportes recientes</h3>
                    <div className="flex flex-col gap-3">

                        {/* Report Card 1 */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex gap-4 items-center shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                            <div
                                className="w-16 h-16 rounded-lg bg-surface-variant flex-shrink-0 bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNihKGzZa5dmOpVaH-qdcmPm8Jd2C7hS9yKXwsBPlrQQfd9OTn-CqjfN7WxTKc-JXoPn3vJuDgEGpLbvzgfzzEChWleEP-y2xkHa0nfMHqSnnuHvqWCJRIXztBsr02wUUF-aLZ3sYmXCfXD5OeLNGwmmF49NMYsGW5LXGkf2QZlBONQtbvxZd8yFlphzfW3gr88ZMzU4QgEU_c4ldwirFb-TyWwiNhNXrDT2S7kBVr82QTZ5GFBZzcF2eUAgPbueSVOc5kEgI49ZE')" }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-body-md text-body-md text-on-surface truncate">Banqueta Rota</h4>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">12 Oct 2023</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                                    Verificado
                                </span>
                            </div>
                        </div>

                        {/* Report Card 2 */}
                        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex gap-4 items-center shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
                            <div
                                className="w-16 h-16 rounded-lg bg-surface-variant flex-shrink-0 bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXVGgmCNZuQJmLFHAreMziNDotQK3HLvSZHSDn-49OLlN364WGSf8JkouOmYDK8nAGmP1IlJzY54-z5oqSbIWQHySSi2qT-tw43Tgt-2KFTS5vDiivAXTB56hupt7nEfaTzYZ8tpxI-OV8rDq5EKNFvoNxtsP1SbMmDgm4wpCAo3SAIiwZ__-2Xr2mSnm3R_z9tE4ZTohTb1nCn6TkHXCI-bOnmg2CuGBe5iQfT_u5Cg-AFAhIKKBJ4QMRROgsZIXZtsGJ7-C4wDo')" }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-body-md text-body-md text-on-surface truncate">Rampa Obstruida</h4>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">08 Oct 2023</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">
                                    Pendiente
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Configuración */}
                <section className="px-margin-mobile mt-2 mb-8">
                    <h3 className="font-label-md text-label-md text-on-surface mb-4">Configuración</h3>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">

                        <button className="w-full flex items-center justify-between p-4 min-h-[52px] border-b border-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-colors text-left focus:outline-none">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                                <span className="font-body-md text-body-md text-on-surface">Notificaciones</span>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 min-h-[52px] border-b border-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-colors text-left focus:outline-none">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-on-surface-variant">language</span>
                                <span className="font-body-md text-body-md text-on-surface">Idioma</span>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 min-h-[52px] border-b border-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-colors text-left focus:outline-none">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                                <span className="font-body-md text-body-md text-on-surface">Privacidad</span>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 min-h-[52px] border-b border-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-colors text-left focus:outline-none">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-on-surface-variant">info</span>
                                <span className="font-body-md text-body-md text-on-surface">Acerca de</span>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                        </button>

                        {/* Botón de Cerrar Sesión */}
                        <button
                            className="w-full flex items-center justify-between p-4 min-h-[52px] hover:bg-error-container/20 active:bg-error-container/40 transition-colors text-left focus:outline-none"
                            onClick={handleLogout}
                        >
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-error">logout</span>
                                <span className="font-body-md text-body-md text-error">Cerrar sesión</span>
                            </div>
                        </button>

                    </div>
                </section>
            </main>

            {/* BottomNavBar */}
            <nav className="fixed bottom-0 w-full h-14 z-50 flex justify-around items-center px-margin-mobile bg-surface shadow-[0_-1px_3px_rgba(0,0,0,0.05)] border-t border-outline-variant/30 md:hidden pb-safe">

                <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-all duration-200 w-12 h-12 rounded-lg">
                    <span className="material-symbols-outlined mb-1 text-[24px]">home</span>
                    <span className="font-label-sm text-label-sm">Inicio</span>
                </button>

                <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-all duration-200 w-12 h-12 rounded-lg">
                    <span className="material-symbols-outlined mb-1 text-[24px]">map</span>
                    <span className="font-label-sm text-label-sm">Mapa</span>
                </button>

                <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-all duration-200 w-12 h-12 rounded-lg">
                    <span className="material-symbols-outlined mb-1 text-[24px]">add_circle</span>
                    <span className="font-label-sm text-label-sm">Reportar</span>
                </button>

                {/* Pestaña Activa: Perfil */}
                <button className="flex flex-col items-center justify-center text-primary font-bold hover:bg-surface-variant/20 active:bg-surface-variant/40 transition-all duration-200 w-12 h-12 rounded-lg">
                    <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        person
                    </span>
                    <span className="font-label-sm text-label-sm">Perfil</span>
                </button>

            </nav>

        </div>
    );
};

export default ProfileScreen;