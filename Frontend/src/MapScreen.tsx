import React, { useEffect, useMemo, useState } from 'react';
import {
    CircleMarker,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap
} from 'react-leaflet';

import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type ReportLocation = {
    id: string;
    title: string;
    subtitle: string;
    position: LatLngTuple;
};

type RoutePlan = {
    coordinates: LatLngTuple[];
    distanceKm: number;
    durationMin: number;
};

const DEFAULT_LOCATION: LatLngTuple = [32.5338, -117.0373];


function FlyToUser({
    location
}: {
    location: LatLngTuple | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.flyTo(location, 18, {
                duration: 1.5
            });
        }
    }, [location]);

    return null;
}

const MapScreen = () => {

    // =========================
    // USER LOCATION
    // =========================

    const [userLocation, setUserLocation] =
        useState<LatLngTuple | null>(null);

    const [accuracy, setAccuracy] =
        useState<number | null>(null);

    const [loadingLocation, setLoadingLocation] =
        useState(false);

    const [locationError, setLocationError] =
        useState('');

    // =========================
    // ROUTE
    // =========================

    const [route, setRoute] =
        useState<RoutePlan | null>(null);

    // =========================
    // GET LOCATION
    // =========================

    const getCurrentLocation = () => {

        setLoadingLocation(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setUserLocation([lat, lng]);

                setAccuracy(position.coords.accuracy);

                setLoadingLocation(false);
            },

            (error) => {

                console.error(error);

                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError(
                        'Debes permitir acceso a ubicación'
                    );
                } else {
                    setLocationError(
                        'No se pudo obtener ubicación'
                    );
                }

                setLoadingLocation(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
    };

    // =========================
    // INITIAL LOCATION
    // =========================

    useEffect(() => {
        getCurrentLocation();
    }, []);

    // =========================
    // ROUTES
    // =========================

    const calculateRoute = async (
        destination: LatLngTuple
    ) => {

        if (!userLocation) return;

        try {

            const fromLonLat =
                `${userLocation[1]},${userLocation[0]}`;

            const toLonLat =
                `${destination[1]},${destination[0]}`;

            const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${fromLonLat};${toLonLat}` +
                `?overview=full&geometries=geojson`;

            const response = await fetch(url);

            const data = await response.json();

            if (!data.routes?.length) return;

            const rawCoords =
                data.routes[0].geometry.coordinates;

            const coords: LatLngTuple[] =
                rawCoords.map(
                    (c: [number, number]) => [c[1], c[0]]
                );

            setRoute({
                coordinates: coords,
                distanceKm:
                    data.routes[0].distance / 1000,
                durationMin:
                    data.routes[0].duration / 60
            });

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // USER MARKER ICON
    // =========================

    const userIcon = useMemo(() => {

        return L.divIcon({
            className: '',
            html: `
                <div
                    style="
                        width:20px;
                        height:20px;
                        background:#2563eb;
                        border:4px solid white;
                        border-radius:999px;
                        box-shadow:0 0 10px rgba(0,0,0,.4);
                    "
                ></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

    }, []);

return (

    <div className="w-full h-screen bg-[#f5f7fb] flex flex-col overflow-hidden">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="h-16 shrink-0 bg-primary text-white border-b border-white/10 shadow-md z-30">

            <div className="w-full h-full max-w-7xl mx-auto px-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">

                        <span className="material-symbols-outlined">
                            menu
                        </span>

                    </button>

                    <div>

                        <h1 className="text-lg font-bold leading-none">
                            Tijuana Sin Barreras
                        </h1>

                        <p className="text-xs text-white/80">
                            Mapa de accesibilidad urbana
                        </p>

                    </div>

                </div>

                <button
                    onClick={getCurrentLocation}
                    className="h-10 px-4 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                    Mi ubicación
                </button>

            </div>

        </header>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <main className="flex-1 overflow-hidden">

            <div className="w-full h-full max-w-7xl mx-auto p-4">

                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">

                    {/* ======================================================
                        LEFT PANEL
                    ====================================================== */}

                    {/* ======================================================
                        SEARCH PANEL
                    ====================================================== */}

                    <aside className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

                        {/* SEARCH HEADER */}

                        <div className="p-5 border-b">

                            <h2 className="text-xl font-bold text-gray-800">
                                Buscar ubicación
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Encuentra lugares y calcula rutas
                            </p>

                        </div>

                        {/* SEARCH BAR */}

                        <div className="p-5 border-b">

                            <div className="relative">

                                <span
                                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    search
                                </span>

                                <input
                                    type="text"
                                    placeholder="Buscar calle, colonia o lugar..."
                                    className="
                                        w-full
                                        h-14
                                        rounded-2xl
                                        border
                                        border-gray-300
                                        bg-gray-50
                                        pl-12
                                        pr-4
                                        outline-none
                                        focus:border-primary
                                        focus:ring-4
                                        focus:ring-primary/10
                                        transition-all
                                    "
                                />

                            </div>

                        </div>

                        {/* LOCATION INFO */}

                        <div className="px-5 py-4 border-b bg-gray-50">

                            {loadingLocation && (

                                <div className="flex items-center gap-2 text-sm text-gray-600">

                                    <span className="material-symbols-outlined animate-spin text-[18px]">
                                        progress_activity
                                    </span>

                                    Obteniendo ubicación...

                                </div>

                            )}

                            {locationError && (

                                <div className="text-sm text-red-500">
                                    {locationError}
                                </div>

                            )}

                            {userLocation && (

                                <div className="space-y-3">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs text-gray-500">
                                                Precisión GPS
                                            </p>

                                            <p className="font-bold text-primary">
                                                {Math.round(accuracy ?? 0)}m
                                            </p>

                                        </div>

                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">

                                            <span className="material-symbols-outlined">
                                                my_location
                                            </span>

                                        </div>

                                    </div>

                                    <button
                                        onClick={getCurrentLocation}
                                        className="
                                            w-full
                                            h-12
                                            rounded-xl
                                            bg-primary
                                            text-white
                                            font-semibold
                                            hover:opacity-90
                                            transition-opacity
                                        "
                                    >
                                        Actualizar ubicación
                                    </button>

                                </div>

                            )}

                        </div>

                        {/* QUICK ACTIONS */}

                        <div className="p-5 flex flex-col gap-3">

                            <button
                                className="
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    hover:border-primary
                                    hover:bg-primary/5
                                    transition-all
                                    flex
                                    items-center
                                    gap-4
                                    px-4
                                "
                            >

                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                                    <span className="material-symbols-outlined">
                                        accessible
                                    </span>

                                </div>

                                <div className="text-left">

                                    <p className="font-semibold text-gray-800">
                                        Rutas accesibles
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Calles adaptadas
                                    </p>

                                </div>

                            </button>

                            <button
                                className="
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    hover:border-primary
                                    hover:bg-primary/5
                                    transition-all
                                    flex
                                    items-center
                                    gap-4
                                    px-4
                                "
                            >

                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">

                                    <span className="material-symbols-outlined">
                                        warning
                                    </span>

                                </div>

                                <div className="text-left">

                                    <p className="font-semibold text-gray-800">
                                        Zonas con barreras
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Reportes recientes
                                    </p>

                                </div>

                            </button>

                        </div>

                    </aside>

                    {/* ======================================================
                        MAP SECTION
                    ====================================================== */}

                    <section className="flex flex-col gap-4 overflow-hidden">

                        {/* MAP CARD */}

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">

                            {/* MAP TOPBAR */}

                            <div className="h-16 border-b px-5 flex items-center justify-between shrink-0">

                                <div>

                                    <h2 className="font-bold text-gray-800">
                                        Mapa interactivo
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Ubicación en tiempo real
                                    </p>

                                </div>

                                <div className="flex items-center gap-2">

                                </div>

                            </div>

                            {/* ======================================================
                                MAP CONTAINER
                            ====================================================== */}

                            <div className="flex-1 relative min-h-[300px]">

                                <MapContainer
                                    center={userLocation || DEFAULT_LOCATION}
                                    zoom={16}
                                    className="w-full h-full z-0"
                                    zoomControl={true}
                                >

                                    <TileLayer
                                        attribution='&copy; OpenStreetMap contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {/* USER LOCATION */}

                                    <FlyToUser
                                        location={userLocation}
                                    />

                                    {userLocation && (

                                        <>

                                            {/* ACCURACY AREA */}

                                            <CircleMarker
                                                center={userLocation}
                                                radius={40}
                                                pathOptions={{
                                                    color: '#2563eb',
                                                    fillColor: '#2563eb',
                                                    fillOpacity: 0.15
                                                }}
                                            />

                                            {/* USER MARKER */}

                                            <Marker
                                                position={userLocation}
                                                icon={userIcon}
                                                draggable={true}

                                                eventHandlers={{

                                                    dragend: (e) => {

                                                        const marker =
                                                            e.target;

                                                        const pos =
                                                            marker.getLatLng();

                                                        setUserLocation([
                                                            pos.lat,
                                                            pos.lng
                                                        ]);
                                                    }
                                                }}
                                            >

                                                <Popup>
                                                    Tu ubicación actual
                                                </Popup>

                                            </Marker>

                                        </>

                                    )}

                                   
                                    {/* ROUTE */}

                                    {route && (

                                        <Polyline
                                            positions={route.coordinates}
                                            pathOptions={{
                                                color: '#2563eb',
                                                weight: 6
                                            }}
                                        />

                                    )}

                                </MapContainer>

                            </div>

                            {/* MAP FOOTER */}

                            {route && (

                                <div className="border-t px-5 py-4 bg-gray-50 shrink-0">

                                    <div className="flex flex-wrap items-center gap-6">

                                        <div>

                                            <p className="text-xs text-gray-500">
                                                Distancia
                                            </p>

                                            <p className="font-bold text-gray-800">
                                                {route.distanceKm.toFixed(2)} km
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-500">
                                                Tiempo estimado
                                            </p>

                                            <p className="font-bold text-gray-800">
                                                {route.durationMin.toFixed(0)} min
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                    </section>

                </div>

            </div>

        </main>

        {/* ======================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <nav className="h-16 shrink-0 bg-white border-t border-gray-200 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30">

            <button className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors">

                <span className="material-symbols-outlined">
                    home
                </span>

                <span className="text-xs mt-1">
                    Inicio
                </span>

            </button>

            <button className="flex flex-col items-center justify-center text-primary">

                <span
                    className="material-symbols-outlined"
                    style={{
                        fontVariationSettings: "'FILL' 1"
                    }}
                >
                    map
                </span>

                <span className="text-xs font-semibold mt-1">
                    Mapa
                </span>

            </button>

            <button className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors">

                <span className="material-symbols-outlined">
                    add_circle
                </span>

                <span className="text-xs mt-1">
                    Reportar
                </span>

            </button>

            <button className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors">

                <span className="material-symbols-outlined">
                    person
                </span>

                <span className="text-xs mt-1">
                    Perfil
                </span>

            </button>

        </nav>

    </div>

);}

export default MapScreen;   