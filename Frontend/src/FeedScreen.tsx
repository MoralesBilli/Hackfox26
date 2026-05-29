import React, { useState, useEffect, useRef } from 'react';

// --- INTERFACES Y DATOS DE PRUEBA ---
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
}

// Datos iniciales (Página 1)
const initialPosts: PostData[] = [
    {
        id: '1',
        author: 'Marcos Jiménez',
        timeLocation: 'hace 2 horas • Playas de Tijuana',
        status: 'Pendiente',
        statusType: 'pending',
        avatarSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR60t21mVYB__srGruVpng91NlkhAjPdD8rgBAG0UrkymW3b_Qys9uj_tuWuXkHGl-fcfo3bkcBhAhCwdcNOU-fQDFcb_HYfCh_5jnKIBwzLycfRAyPs-HJOxm9LJrJEdJ4AdEBlmPTxM65pagpy_lIy_hYuqAHYQ5f2i0SEmCX5EGcpsjku_ulm7EJr6kHnOXfwnTgQ4e_629vHrgkv8VqWLwLumskGAl29EGDzbPzHrFdX3F2AWLQOx1geEyjVhhLxFnwg8cLbc',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDDMh1yrgkAoP7vp_Cd4d3HB2BBv3do2Cjl9Pqloruy0I0WVS3P10BVVy3apJJptOotA9BaBgTrUjvnqRe0PrL-6qyp9x-a_NM_SA-T7DvKIinkTzeAtfpGHFiKyY4neLy0q98wIbqXk2h_OIlIOuJO5VP3NscxrJnNCNzKllisUxq7zypXGqUfWnI6LjbkYTadww5ysiwvF1_hlan4V9G4z0DyXqjuLeGHUgx1yp80m_qhQ_eSmbHXGzjDuQuHj5UE8TuadHKScM',
        content: 'Rampa de acceso completamente obstruida por escombros en la Calle Paseo Ensenada. Imposible transitar con silla de ruedas. #Accesibilidad #Tijuana',
        showMapLink: true,
    },
    {
        id: '2',
        author: 'Elena Vargas',
        timeLocation: 'hace 5 horas • Zona Centro',
        status: 'Verificado',
        statusType: 'verified',
        avatarSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAivtRx1trF7mTlGocy2ISsD5YUUHotpa3EHrca1Ko_ue9E9IF6Jziiu1Gil7UPSTgxb1v9WyjwLQIIKjiXFmHApQm5Gm_EsaNsbTGGJSs_QmZ6KUxhlJT0sl1iHABppXuN9gx2HZ5J8ssORxusZoKu6CdTix2orhZfgmhepE68PJaiLNyOemtTRGcOq5YCld09wWDcmUnGEPEvhb1fJ8es16Mxnb4zgNvQmyPzm7vEDh2PbnTaOgO6AHeRuTW_UbOUejVHLf7YwJM',
        imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6M9WNCN-mC-Qc0B_XyBWKfvhysIOtJqaDCYOXcSI7WLovpgaDjd-qao84O8ksKTONh7R95d8EBaAl2z-t4Fuq0MSzh7uMgrcu0Bl019HytjzTruXhGui5aAGCUsST4cLB6LlfnOk2hylve3GsZ6GtRx8VnPEW8tMFST288FnvkWcT4h6_fnzH--dJQhvBKWheWS1QdhZc-2b57KVhO8HM6pHp1bTkPV0K3x99JuDcZKJH9-70dYNGr7N_IpNp0dk-b8Od13lVXCA',
        content: '¡Buenas noticias! Han instalado guía táctil en la Av. Revolución. Gracias a todos los que reportaron y apoyaron la solicitud. ¡Tijuana avanza!',
    }
];

// Función simulada para generar más publicaciones basadas en la página actual
const fetchMoreMockPosts = (page: number): PostData[] => {
    return [
        {
            id: `generated-1-${page}`,
            author: 'Carlos Mendoza',
            timeLocation: `hace ${page * 3} horas • Otay Centenario`,
            status: 'Pendiente',
            statusType: 'pending',
            avatarSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXdFzxnKnAJ-7qYYjm1zN70MhBYo0RWQzKelR0h5eL69OkEJGP4Tr2oNk84l5C7usVNIqFmb4CkdBz2WnunYV9gLKZS10LxWcLMpAYXH_KyLd5jm2J0X8g6FecgjEtvLE4NlKSQvtdfUahZgoSE1VatDHcgV6xlgm_5m43KhaolDZ-DbwFHvK_FHzS5maZlcTaS7VWsPV0_3jArkHlbMftPnApK51viOMAd1Sg-cLQ69stnnNKAyH0xGp3mLngvZHGB0uFzaWg7Zg',
            imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDDMh1yrgkAoP7vp_Cd4d3HB2BBv3do2Cjl9Pqloruy0I0WVS3P10BVVy3apJJptOotA9BaBgTrUjvnqRe0PrL-6qyp9x-a_NM_SA-T7DvKIinkTzeAtfpGHFiKyY4neLy0q98wIbqXk2h_OIlIOuJO5VP3NscxrJnNCNzKllisUxq7zypXGqUfWnI6LjbkYTadww5ysiwvF1_hlan4V9G4z0DyXqjuLeGHUgx1yp80m_qhQ_eSmbHXGzjDuQuHj5UE8TuadHKScM',
            content: `[Reporte Voluntario - Carga ${page}] Banqueta destrozada en la zona escolar cerca de la UABC. Los alumnos en silla de ruedas tienen que bajarse al carril vehicular. Peligro constante.`,
            showMapLink: true,
        },
        {
            id: `generated-2-${page}`,
            author: 'Ana Lucía Ríos',
            timeLocation: `hace ${page * 4} horas • Rio Tijuana`,
            status: 'Verificado',
            statusType: 'verified',
            avatarSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAivtRx1trF7mTlGocy2ISsD5YUUHotpa3EHrca1Ko_ue9E9IF6Jziiu1Gil7UPSTgxb1v9WyjwLQIIKjiXFmHApQm5Gm_EsaNsbTGGJSs_QmZ6KUxhlJT0sl1iHABppXuN9gx2HZ5J8ssORxusZoKu6CdTix2orhZfgmhepE68PJaiLNyOemtTRGcOq5YCld09wWDcmUnGEPEvhb1fJ8es16Mxnb4zgNvQmyPzm7vEDh2PbnTaOgO6AHeRuTW_UbOUejVHLf7YwJM',
            imageSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6M9WNCN-mC-Qc0B_XyBWKfvhysIOtJqaDCYOXcSI7WLovpgaDjd-qao84O8ksKTONh7R95d8EBaAl2z-t4Fuq0MSzh7uMgrcu0Bl019HytjzTruXhGui5aAGCUsST4cLB6LlfnOk2hylve3GsZ6GtRx8VnPEW8tMFST288FnvkWcT4h6_fnzH--dJQhvBKWheWS1QdhZc-2b57KVhO8HM6pHp1bTkPV0K3x99JuDcZKJH9-70dYNGr7N_IpNp0dk-b8Od13lVXCA',
            content: `¡Misión cumplida! Repararon el semáforo sonoro del cruce peatonal en Paseo de los Héroes. Ahora cruzar de forma segura es una realidad para la comunidad invidente.`,
        }
    ];
};

// --- SUBCOMPONENTE: Tarjeta del Feed ---
const FeedCard = ({ post }: { post: PostData }) => {
    return (
        <article className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm ring-1 ring-outline-variant/20">
            {/* Encabezado */}
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img alt="Avatar" className="w-10 h-10 rounded-full object-cover" src={post.avatarSrc} />
                    <div>
                        <p className="font-title-md text-title-md leading-tight">{post.author}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{post.timeLocation}</p>
                    </div>
                </div>

                {post.statusType === 'pending' ? (
                    <div className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm">
                        {post.status}
                    </div>
                ) : (
                    <div className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {post.status}
                    </div>
                )}
            </div>

            {/* Imagen Principal */}
            <div className={`w-full relative ${post.statusType === 'pending' ? 'aspect-square' : 'aspect-[4/5]'}`}>
                <img alt="Reporte" className="w-full h-full object-cover" src={post.imageSrc} />
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-4 space-y-3">
                <p className="font-body-md text-body-md text-on-surface">{post.content}</p>

                {post.showMapLink && (
                    <button className="flex items-center gap-2 text-on-tertiary-fixed-variant hover:underline focus:outline-none">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="font-label-sm text-label-sm">Ver en el mapa</span>
                    </button>
                )}
            </div>
        </article>
    );
};

// --- COMPONENTE PRINCIPAL ---
const FeedScreen = () => {
    const [posts, setPosts] = useState<PostData[]>(initialPosts);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && !loading && hasMore) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, [loading, hasMore, page]);

    const loadMorePosts = () => {
        setLoading(true);

        setTimeout(() => {
            const nextPage = page + 1;
            const newPosts = fetchMoreMockPosts(nextPage);

            if (nextPage >= 4) {
                setHasMore(false);
            }

            setPosts((prevPosts) => [...prevPosts, ...newPosts]);
            setPage(nextPage);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="bg-background text-on-background min-h-screen">

            <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            {/* TopAppBar */}
            <header className="bg-surface/85 backdrop-blur-md dark:bg-surface-dim/85 docked full-width top-0 sticky z-50">
                <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-on-primary-fixed-variant">
                            <img alt="Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXdFzxnKnAJ-7qYYjm1zN70MhBYo0RWQzKelR0h5eL69OkEJGP4Tr2oNk84l5C7usVNIqFmb4CkdBz2WnunYV9gLKZS10LxWcLMpAYXH_KyLd5jm2J0X8g6FecgjEtvLE4NlKSQvtdfUahZgoSE1VatDHcgV6xlgm_5m43KhaolDZ-DbwFHvK_FHzS5maZlcTaS7VWsPV0_3jArkHlbMftPnApK51viOMAd1Sg-cLQ69stnnNKAyH0xGp3mLngvZHGB0uFzaWg7Zg" />
                        </div>
                        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-on-primary-fixed-variant dark:text-on-primary-container">
                            Tijuana Sin Barreras
                        </h1>
                    </div>
                    <button className="text-primary dark:text-primary-fixed-dim hover:opacity-80 active:scale-95 transition-all duration-150 focus:outline-none">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            <main className="max-w-max-width mx-auto pb-32">
                {/* Story-style Filters */}
                <section className="py-4 overflow-x-auto hide-scrollbar whitespace-nowrap px-margin-mobile flex gap-4">
                    <button className="inline-flex flex-col items-center gap-2 group focus:outline-none">
                        <div className="w-16 h-16 rounded-full border-2 border-on-primary-fixed-variant p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-on-primary-fixed-variant">
                                <span className="material-symbols-outlined text-3xl">near_me</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Cerca de mí</span>
                    </button>

                    <button className="inline-flex flex-col items-center gap-2 group focus:outline-none">
                        <div className="w-16 h-16 rounded-full border-2 border-outline-variant p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined text-3xl">schedule</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Recientes</span>
                    </button>

                    <button className="inline-flex flex-col items-center gap-2 group focus:outline-none">
                        <div className="w-16 h-16 rounded-full border-2 border-outline-variant p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined text-3xl">verified</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Verificados</span>
                    </button>

                    <button className="inline-flex flex-col items-center gap-2 group focus:outline-none">
                        <div className="w-16 h-16 rounded-full border-2 border-outline-variant p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined text-3xl">map</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Mapa</span>
                    </button>

                    <button className="inline-flex flex-col items-center gap-2 group focus:outline-none">
                        <div className="w-16 h-16 rounded-full border-2 border-outline-variant p-0.5 transition-transform group-active:scale-90">
                            <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined text-3xl">group</span>
                            </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Vecinos</span>
                    </button>
                </section>

                {/* Social Feed */}
                <div className="flex flex-col gap-6 px-margin-mobile">
                    {posts.map((post) => (
                        <FeedCard key={post.id} post={post} />
                    ))}
                </div>

                {/* Centinela del Scroll Infinito */}
                <div ref={sentinelRef} className="w-full flex justify-center items-center py-8">
                    {loading && (
                        <div className="flex flex-col items-center gap-2 text-on-primary-fixed-variant">
                            <div className="w-8 h-8 border-4 border-surface-variant border-t-on-primary-fixed-variant rounded-full animate-spin"></div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Cargando reportes comunitarios...</span>
                        </div>
                    )}
                    {!hasMore && (
                        <p className="font-label-md text-label-md text-on-surface-variant text-center opacity-60">
                            Has llegado al final de los reportes en tu área.
                        </p>
                    )}
                </div>
            </main>

            {/* FAB */}
            <button className="fixed bottom-24 right-6 w-14 h-14 bg-on-primary-fixed-variant text-on-primary rounded-full shadow-lg flex items-center justify-center z-50 transition-transform active:scale-90 hover:brightness-110 focus:outline-none">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
            </button>

            {/* BottomNavBar */}
            <nav className="bg-surface/85 backdrop-blur-md dark:bg-surface-dim/85 border-t border-outline-variant/30 shadow-lg fixed bottom-0 left-0 right-0 w-full flex justify-around items-center px-4 py-2 pb-[env(safe-area-inset-bottom)] z-50">
                <a className="flex items-center justify-center bg-on-primary-fixed-variant dark:bg-primary-container text-on-primary rounded-full w-12 h-12 transition-all duration-200 active:scale-90" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                </a>
                <a className="flex items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">explore</span>
                </a>
                <a className="flex items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">add_circle</span>
                </a>
                <a className="flex items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">notifications</span>
                </a>
                <a className="flex items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90" href="#" onClick={e => e.preventDefault()}>
                    <span className="material-symbols-outlined">person</span>
                </a>
            </nav>

        </div>
    );
};

export default FeedScreen;