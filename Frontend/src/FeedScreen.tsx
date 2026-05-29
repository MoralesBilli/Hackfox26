import React, { useState, useEffect, useRef } from 'react';

// --- INTERFACES ENRIQUECIDAS ---
interface PostData {
    id: string;
    author: string;
    timeLocation: string;
    status: string;
    statusType: 'pending' | 'verified';
    avatarSrc: string;
    imageSrc: string;
    content: string;
    showMapLink?: boolean;
    tipo?: string;
    color?: string;
    latitud?: number;
    longitud?: number;
}

// Configuración de la URL de la API del backend
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Mapeos visuales de tipo de reporte
const formatTipo = (tipo: string) => {
    if (!tipo) return "Reporte Ciudadano";
    switch (tipo) {
        case "accidente_vial": return "Accidente Vial";
        case "Problema_peatonal": return "Problema Peatonal";
        case "infraestructura_dañada": return "Infraestructura Dañada";
        case "emergencia_riesgo": return "Emergencia / Riesgo";
        case "peligro_discapacidad": return "Peligro de Discapacidad";
        default: return tipo.replace(/_/g, ' ');
    }
};

const getTipoIcon = (tipo: string) => {
    switch (tipo) {
        case "accidente_vial": return "car_crash";
        case "Problema_peatonal": return "directions_walk";
        case "infraestructura_dañada": return "construction";
        case "emergencia_riesgo": return "warning";
        case "peligro_discapacidad": return "accessible";
        default: return "report";
    }
};

const colorMap: Record<string, { bg: string; text: string; border: string; iconColor: string; shadow: string }> = {
    rojo: {
        bg: 'bg-red-50/90 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-900/40',
        iconColor: 'text-red-500',
        shadow: 'hover:shadow-red-100/50 dark:hover:shadow-none'
    },
    naranja: {
        bg: 'bg-orange-50/90 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-900/40',
        iconColor: 'text-orange-500',
        shadow: 'hover:shadow-orange-100/50 dark:hover:shadow-none'
    },
    cafe: {
        bg: 'bg-amber-50/90 dark:bg-amber-950/20',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-900/30',
        iconColor: 'text-amber-600',
        shadow: 'hover:shadow-amber-100/50 dark:hover:shadow-none'
    },
    negro: {
        bg: 'bg-zinc-100 dark:bg-zinc-900/50',
        text: 'text-zinc-800 dark:text-zinc-200',
        border: 'border-zinc-300 dark:border-zinc-700',
        iconColor: 'text-zinc-700 dark:text-zinc-300',
        shadow: 'hover:shadow-zinc-100/50 dark:hover:shadow-none'
    },
    morado: {
        bg: 'bg-purple-50/90 dark:bg-purple-950/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-900/40',
        iconColor: 'text-purple-500',
        shadow: 'hover:shadow-purple-100/50 dark:hover:shadow-none'
    },
    gris: {
        bg: 'bg-slate-50/90 dark:bg-slate-900/20',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800',
        iconColor: 'text-slate-500',
        shadow: 'hover:shadow-slate-100/50 dark:hover:shadow-none'
    }
};

const formatTimeLocation = (fechaStr: string) => {
    if (!fechaStr) return 'Reciente • Tijuana';
    try {
        const date = new Date(fechaStr);
        const options: Intl.DateTimeFormatOptions = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return `${date.toLocaleDateString('es-MX', options)} • Tijuana`;
    } catch (e) {
        return 'Reciente • Tijuana';
    }
};

// --- SUBCOMPONENTE: Tarjeta del Feed Premium ---
const FeedCard = ({ post, onNavigate }: { post: PostData; onNavigate?: any }) => {
    const badge = post.color && colorMap[post.color] ? colorMap[post.color] : colorMap.gris;

    return (
        <article className={`bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm ring-1 ring-outline-variant/10 hover:shadow-md transition-all duration-300 group flex flex-col ${badge.shadow}`}>
            {/* Encabezado */}
            <div className="p-4 flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                    <img alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/5" src={post.avatarSrc} />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-title-md text-title-md leading-tight font-bold text-on-surface">{post.author}</p>
                            {post.tipo && (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold tracking-wide transition-all ${badge.bg} ${badge.text} ${badge.border}`}>
                                    <span className="material-symbols-outlined text-[13px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {getTipoIcon(post.tipo)}
                                    </span>
                                    {formatTipo(post.tipo)}
                                </span>
                            )}
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">{post.timeLocation}</p>
                    </div>
                </div>

                {post.statusType === 'pending' ? (
                    <div className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold uppercase tracking-wider">
                        {post.status}
                    </div>
                ) : (
                    <div className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {post.status}
                    </div>
                )}
            </div>

            {/* Imagen Principal */}
            <div className="w-full relative aspect-video overflow-hidden bg-surface-container">
                <img alt="Reporte" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" src={post.imageSrc} />
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                <p className="font-body-md text-body-md text-on-surface/90 leading-relaxed">{post.content}</p>

                {post.showMapLink && (
                    <button 
                        onClick={() => onNavigate && onNavigate('map')}
                        className="flex items-center gap-1.5 text-primary dark:text-primary-fixed-dim hover:underline font-bold transition-all focus:outline-none w-fit"
                    >
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="font-label-sm text-xs">Ver en el mapa</span>
                    </button>
                )}
            </div>
        </article>
    );
};

// --- COMPONENTE PRINCIPAL ---
const FeedScreen = ({ onNavigate }: { onNavigate?: any }) => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLiveReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/obtener_reportes`);
            if (!response.ok) {
                throw new Error(`Error de servidor: ${response.status}`);
            }
            const data = await response.json();
            
            // Mapeo de la respuesta del backend
            const mappedPosts = data.map((tarjeta: any, index: number) => {
                const isVerified = tarjeta.estado === 'verificado' || tarjeta.estado === 'aprobado';
                return {
                    id: tarjeta.id || `report-${index}`,
                    author: 'Reporte Ciudadano',
                    timeLocation: formatTimeLocation(tarjeta.fecha),
                    status: isVerified ? 'Verificado' : 'Pendiente',
                    statusType: isVerified ? 'verified' : 'pending',
                    avatarSrc: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
                    imageSrc: tarjeta.imagen || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
                    content: tarjeta.descripcion || 'Obstáculo detectado en la vía pública.',
                    showMapLink: !!(tarjeta.latitud && tarjeta.longitud),
                    tipo: tarjeta.tipo,
                    color: tarjeta.color,
                    latitud: tarjeta.latitud,
                    longitud: tarjeta.longitud
                };
            });

            setPosts(mappedPosts);
        } catch (err: any) {
            console.error('Error al cargar reportes desde el backend:', err);
            setError(err.message || 'Error de conexión');
            // Cargar datos de respaldo interactivos si no hay backend activo
            setPosts([
                {
                    id: '1',
                    author: 'Marcos Jiménez',
                    timeLocation: 'Hace 2 horas • Playas de Tijuana',
                    status: 'Pendiente',
                    statusType: 'pending',
                    avatarSrc: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
                    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDDMh1yrgkAoP7vp_Cd4d3HB2BBv3do2Cjl9Pqloruy0I0WVS3P10BVVy3apJJptOotA9BaBgTrUjvnqRe0PrL-6qyp9x-a_NM_SA-T7DvKIinkTzeAtfpGHFiKyY4neLy0q98wIbqXk2h_OIlIOuJO5VP3NscxrJnNCNzKllisUxq7zypXGqUfWnI6LjbkYTadww5ysiwvF1_hlan4V9G4z0DyXqjuLeGHUgx1yp80m_qhQ_eSmbHXGzjDuQuHj5UE8TuadHKScM',
                    content: 'Rampa de acceso completamente obstruida por escombros en la Calle Paseo Ensenada. Imposible transitar con silla de ruedas. #Accesibilidad #Tijuana',
                    showMapLink: true,
                    tipo: 'peligro_discapacidad',
                    color: 'morado'
                },
                {
                    id: '2',
                    author: 'Elena Vargas',
                    timeLocation: 'Hace 5 horas • Zona Centro',
                    status: 'Verificado',
                    statusType: 'verified',
                    avatarSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
                    imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXu6M9WNCN-mC-Qc0B_XyBWKfvhysIOtJqaDCYOXcSI7WLovpgaDjd-qao84O8ksKTONh7R95d8EBaAl2z-t4Fuq0MSzh7uMgrcu0Bl019HytjzTruXhGui5aAGCUsST4cLB6LlfnOk2hylve3GsZ6GtRx8VnPEW8tMFST288FnvkWcT4h6_fnzH--dJQhvBKWheWS1QdhZc-2b57KVhO8HM6pHp1bTkPV0K3x99JuDcZKJH9-70dYNGr7N_IpNp0dk-b8Od13lVXCA',
                    content: '¡Buenas noticias! Han instalado guía táctil en la Av. Revolución. Gracias a todos los que reportaron y apoyaron la solicitud. ¡Tijuana avanza!',
                    tipo: 'infraestructura_dañada',
                    color: 'cafe'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveReports();
    }, []);

    return (
        <div className="bg-background text-on-background min-h-screen">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* TopAppBar */}
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 docked full-width top-0 sticky z-50">
                <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/25">
                            <img alt="Logo App" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" />
                        </div>
                        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-primary dark:text-primary-fixed-dim">
                            Tijuana Sin Barreras
                        </h1>
                    </div>
                    <button 
                        onClick={() => onNavigate && onNavigate('profile')}
                        className="text-on-surface-variant hover:text-primary active:scale-95 transition-all duration-150 focus:outline-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            <main className="max-w-max-width mx-auto pb-32">
                {/* Story-style Filters */}
                <section className="py-4 overflow-x-auto hide-scrollbar whitespace-nowrap px-margin-mobile flex gap-4">
                    <button 
                        onClick={fetchLiveReports}
                        className="inline-flex flex-col items-center gap-2 group focus:outline-none"
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">sync</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Actualizar</span>
                    </button>

                    <button 
                        onClick={() => onNavigate && onNavigate('map')}
                        className="inline-flex flex-col items-center gap-2 group focus:outline-none"
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-outline-variant/60 p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined text-3xl">map</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Ver Mapa</span>
                    </button>
                </section>

                {/* Social Feed */}
                <div className="flex flex-col gap-6 px-margin-mobile">
                    {loading ? (
                        <div className="w-full flex flex-col justify-center items-center py-16 gap-3">
                            <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
                            <span className="font-label-md text-label-md text-on-surface-variant">Obteniendo reportes comunitarios en tiempo real...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-error-container/30 border border-error-container rounded-2xl text-center space-y-3">
                            <p className="font-body-md text-on-error-container/90">
                                Mostrando reportes sin conexión (backend inactivo).
                            </p>
                            <button 
                                onClick={fetchLiveReports}
                                className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                            >
                                Reintentar Conexión
                            </button>
                        </div>
                    ) : null}

                    {!loading && posts.map((post) => (
                        <FeedCard key={post.id} post={post} onNavigate={onNavigate} />
                    ))}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">explore_off</span>
                            <p className="font-label-lg text-on-surface-variant mt-2">No se encontraron reportes activos.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* FAB (Añadir Reporte) */}
            <button 
                onClick={() => onNavigate && onNavigate('report')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-50 transition-transform active:scale-90 hover:brightness-110 focus:outline-none"
            >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
            </button>

            {/* BottomNavBar */}
            <nav className="bg-surface/85 backdrop-blur-md border-t border-outline-variant/30 shadow-lg fixed bottom-0 left-0 right-0 w-full flex justify-around items-center px-4 py-2 pb-[env(safe-area-inset-bottom)] z-50">
                <button 
                    onClick={() => onNavigate && onNavigate('home')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">home</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('map')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">explore</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('report')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('profile')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">person</span>
                </button>
            </nav>
        </div>
    );
};

export default FeedScreen;