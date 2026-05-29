import React, {
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    Circle,
    CircleMarker,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap
} from 'react-leaflet';

import L, {
    type LatLngTuple
} from 'leaflet';

import 'leaflet/dist/leaflet.css';

// ======================================================
// TYPES
// ======================================================

type SearchResult = {
    name: string;
    lat: number;
    lon: number;
};

type Incident = {
    id: string;
    categoria: string;
    color: string;
    descripcion: string;
    estado: string;
    fecha: string;
    imagen?: string;
    latitud: number;
    longitud: number;
    subcategoria: string;
    tipo: string;
};

type RoutePlan = {
    coordinates: LatLngTuple[];
    distanceKm: number;
    durationMin: number;
    alternativeRoutes?: RoutePlan[];
};

// ======================================================
// DEFAULT LOCATION
// ======================================================

const DEFAULT_LOCATION: LatLngTuple = [
    32.5338,
    -117.0373
];

function FlyToUser({ location, autoCenter }: { location: LatLngTuple | null; autoCenter: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (location && autoCenter) {
            map.flyTo(location, map.getZoom() > 14 ? map.getZoom() : 18, {
                duration: 1.2
            });
        }
    }, [location, autoCenter, map]);

    return null;
}

// ======================================================
// MAP EVENTS HANDLER (DETECT MANUAL PANNING/ZOOMING)
// ======================================================

function MapEventsHandler({ onManualInteraction }: { onManualInteraction: () => void }) {
    const map = useMap();
    useEffect(() => {
        const handler = () => {
            onManualInteraction();
        };
        map.on('dragstart', handler);
        map.on('zoomstart', handler);
        return () => {
            map.off('dragstart', handler);
            map.off('zoomstart', handler);
        };
    }, [map, onManualInteraction]);

    return null;
}

// ======================================================
// FLY TO PLACE
// ======================================================

function FlyToPlace({ location }: { location: LatLngTuple | null }) {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.flyTo(location, 16, {
                duration: 1.5
            });
        }
    }, [location, map]);

    return null;
}

// ======================================================
// COMPONENT
// ======================================================

const MapScreen = ({ onNavigate }: { onNavigate?: any }) => {

    // ======================================================
    // USER LOCATION
    // ======================================================

    const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [autoCenter, setAutoCenter] = useState(true);

    // ======================================================
    // SEARCH
    // ======================================================

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<LatLngTuple | null>(null);

    // ======================================================
    // ROUTE
    // ======================================================

    const [route, setRoute] = useState<RoutePlan | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // ======================================================
    // INCIDENTES
    // ======================================================

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [showIncidents, setShowIncidents] = useState(true);
    const [avoidIncidents, setAvoidIncidents] = useState(true);
    const [loadingIncidents, setLoadingIncidents] = useState(false);
    const [filterType, setFilterType] = useState<string>('todos');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        setLocationError('');
        setAutoCenter(true); // Forzar que el mapa se centre en el usuario

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
                    setLocationError('Debes permitir acceso a ubicación');
                } else {
                    setLocationError('No se pudo obtener ubicación');
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

    // ======================================================
    // LOAD INCIDENTS FROM API
    // ======================================================

    const loadIncidents = async () => {
        setLoadingIncidents(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/obtener_reportes');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Mapear y normalizar los datos recibidos del backend para evitar tuplas/arrays en las coordenadas
            const normalizedData = data.map((item: any, index: number) => {
                // Extraer latitud y longitud manejando si vienen en una lista/tupla debido a la coma final en python
                let lat = Array.isArray(item.latitud) ? item.latitud[0] : item.latitud;
                let lon = Array.isArray(item.longitud) ? item.longitud[0] : item.longitud;

                // Asegurar conversión numérica
                const parsedLat = typeof lat === 'string' ? parseFloat(lat) : lat;
                const parsedLon = typeof lon === 'string' ? parseFloat(lon) : lon;

                return {
                    id: item.id || `incident-${index}`,
                    categoria: item.categoria || 'Reporte Ciudadano',
                    color: item.color || 'gris',
                    descripcion: item.descripcion || 'Obstáculo detectado en la vía pública.',
                    estado: item.estado || '',
                    fecha: item.fecha || new Date().toISOString(),
                    imagen: item.imagen || '',
                    latitud: parsedLat,
                    longitud: parsedLon,
                    subcategoria: item.subcategoria || 'Reporte de Accesibilidad',
                    tipo: item.tipo || 'desconocido'
                };
            });

            // Filtrar solo incidentes con coordenadas válidas y que estén pendientes o aprobados/verificados
            const activeIncidents = normalizedData.filter(
                (inc: Incident) => 
                    typeof inc.latitud === 'number' && 
                    !isNaN(inc.latitud) && 
                    typeof inc.longitud === 'number' && 
                    !isNaN(inc.longitud) && 
                    (inc.estado === 'pendiente' || inc.estado === 'aprobado' || inc.estado === 'verificado')
            );
            
            setIncidents(activeIncidents);
        } catch (error) {
            console.error('Error cargando incidentes:', error);
        
            setIncidents([
                {
                    "id": "08eb1682-7d72-4e23-a846-df055703ca7d",
                    "categoria": "Accidente vial",
                    "color": "rojo",
                    "descripcion": "Sin rampa - Choque",
                    "estado": "pendiente",
                    "fecha": "2026-05-28T23:37:54.367860+00:00",
                    "imagen": "https://res.cloudinary.com/dakdmsfij/image/upload/v1780036673/tijuana_barreras/zx91hgtt20b9em7doi1c.jpg",
                    "latitud": 32.531920131377426,
                    "longitud": -117.03578186092521,
                    "subcategoria": "Choques",
                    "tipo": "accidente_vial"
                }
            ]);
        } finally {
            setLoadingIncidents(false);
        }
    };

    // ======================================================
    // INCIDENT ICON
    // ======================================================

    const getIncidentIcon = (incident: Incident) => {
        const colors = {
            'rojo': '#dc2626',      // Accidente vial
            'naranja': '#f97316',   // Problema peatonal
            'cafe': '#78350f',      // Infraestructura dañada
            'negro': '#09090b',     // Emergencia / riesgo
            'morado': '#a855f7',    // Peligro movilidad / discapacidad
            'gris': '#6b7280'       // Otros / por defecto
        };
        
        const icons: Record<string, string> = {
            'accidente_vial': 'car_crash',
            'Problema_peatonal': 'directions_walk',
            'infraestructura_dañada': 'construction',
            'emergencia_riesgo': 'warning',
            'peligro_discapacidad': 'accessible'
        };
        
        const color = colors[incident.color as keyof typeof colors] || '#6b7280';
        const iconName = icons[incident.tipo] || 'report';
        
        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${color};
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                    transition: transform 0.2s;
                ">
                    <span class="material-symbols-outlined" style="
                        font-size: 18px;
                        color: white;
                        font-weight: bold;
                    ">${iconName}</span>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    };

    // ======================================================
    // CALCULATE PROXIMITY TO INCIDENTS
    // ======================================================

    const calculateIncidentProximity = (route: any, incidents: Incident[]) => {
        let totalProximity = 0;
        const threshold = 0.001; // ~100 metros
        
        for (const incident of incidents) {
            let minDistance = Infinity;
            
            for (const coord of route.geometry.coordinates) {
                const distance = Math.sqrt(
                    Math.pow(coord[0] - incident.longitud, 2) + 
                    Math.pow(coord[1] - incident.latitud, 2)
                );
                minDistance = Math.min(minDistance, distance);
            }
            
            if (minDistance < threshold) {
                totalProximity += (threshold - minDistance);
            }
        }
        
        return totalProximity;
    };

    // ======================================================
    // CALCULATE ROUTE AVOIDING INCIDENTS
    // ======================================================

    const calculateRouteAvoidingIncidents = async (destination: LatLngTuple) => {
        if (!userLocation) return;
        
        try {
            const activeIncidents = incidents.filter(
                inc => inc.estado === 'pendiente' || inc.estado === 'aprobado'
            );
            
            if (avoidIncidents && activeIncidents.length > 0) {
                const fromLonLat = `${userLocation[1]},${userLocation[0]}`;
                const toLonLat = `${destination[1]},${destination[0]}`;
                
                const url = `https://router.project-osrm.org/route/v1/driving/${fromLonLat};${toLonLat}?overview=full&geometries=geojson&alternatives=true`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.routes?.length) {
                    const routesWithScore = data.routes.map((route: any) => ({
                        route,
                        score: calculateIncidentProximity(route, activeIncidents),
                        distance: route.distance
                    }));
                    
                    // Ordenar: primero menor score de incidentes (seguridad), luego menor distancia (recorrido)
                    routesWithScore.sort((a: any, b: any) => {
                        if (a.score !== b.score) {
                            return a.score - b.score;
                        }
                        return a.distance - b.distance;
                    });
                    
                    const bestRoute = routesWithScore[0].route;
                    const coords = bestRoute.geometry.coordinates.map(
                        (c: [number, number]) => [c[1], c[0]] as LatLngTuple
                    );
                    
                    setRoute({
                        coordinates: coords,
                        distanceKm: bestRoute.distance / 1000,
                        durationMin: bestRoute.duration / 60,
                        alternativeRoutes: routesWithScore.slice(1, 3).map((r: any) => ({
                            coordinates: r.route.geometry.coordinates.map(
                                (c: [number, number]) => [c[1], c[0]] as LatLngTuple
                            ),
                            distanceKm: r.route.distance / 1000,
                            durationMin: r.route.duration / 60
                        }))
                    });
                    return;
                }
            }
            
            await calculateRoute(destination);
        } catch (error) {
            console.error('Error calculando ruta segura:', error);
            await calculateRoute(destination);
        }
    };

    // ======================================================
    // CALCULATE ROUTE
    // ======================================================

    const calculateRoute = async (destination: LatLngTuple) => {
        if (!userLocation) return;

        try {
            const fromLonLat = `${userLocation[1]},${userLocation[0]}`;
            const toLonLat = `${destination[1]},${destination[0]}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${fromLonLat};${toLonLat}?overview=full&geometries=geojson&alternatives=true`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.routes?.length) return;

            // Ordenar las rutas puramente por distancia ascendente (menor recorrido)
            const sortedRoutes = [...data.routes].sort((a: any, b: any) => a.distance - b.distance);
            const primaryRoute = sortedRoutes[0];
            const coords: LatLngTuple[] = primaryRoute.geometry.coordinates.map(
                (c: [number, number]) => [c[1], c[0]]
            );

            setRoute({
                coordinates: coords,
                distanceKm: primaryRoute.distance / 1000,
                durationMin: primaryRoute.duration / 60,
                alternativeRoutes: sortedRoutes.slice(1, 3).map((r: any) => ({
                    coordinates: r.geometry.coordinates.map(
                        (c: [number, number]) => [c[1], c[0]] as LatLngTuple
                    ),
                    distanceKm: r.distance / 1000,
                    durationMin: r.duration / 60
                }))
            });
        } catch (error) {
            console.error(error);
        }
    };

    // ======================================================
    // SELECT ALTERNATIVE ROUTE (SWAP PRINCIPAL <-> ALTERNATIVE)
    // ======================================================

    const handleSelectRoute = (selected: RoutePlan) => {
        if (!route) return;

        const currentMainRoute: RoutePlan = {
            coordinates: route.coordinates,
            distanceKm: route.distanceKm,
            durationMin: route.durationMin
        };

        const newAlternativeRoutes = [
            currentMainRoute,
            ...(route.alternativeRoutes || [])
        ].filter(r => r !== selected);

        setRoute({
            coordinates: selected.coordinates,
            distanceKm: selected.distanceKm,
            durationMin: selected.durationMin,
            alternativeRoutes: newAlternativeRoutes
        });
    };

    // ======================================================
    // SEARCH PLACE
    // ======================================================

    const searchPlace = async () => {
        if (!search.trim()) return;

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/buscar?q=${encodeURIComponent(search)}`
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                console.error(data.error);
                setSearchResults([]);
                return;
            }

            setSearchResults(data);

            if (data.length > 0) {
                const place = data[0];
                const coords: LatLngTuple = [place.lat, place.lon];
                setSelectedPlace(coords);
                setIsSidebarCollapsed(true); // Colapsar el panel para mostrar el mapa más grande
                
                if (avoidIncidents) {
                    await calculateRouteAvoidingIncidents(coords);
                } else {
                    await calculateRoute(coords);
                }
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            setSearchResults([]);
        }
    };

    // ======================================================
    // USER ICON
    // ======================================================

    const userIcon = useMemo(() => {
        return L.divIcon({
            className: '',
            html: `
                <div style="
                    width:20px;
                    height:20px;
                    background:#2563eb;
                    border:4px solid white;
                    border-radius:999px;
                    box-shadow:0 0 10px rgba(0,0,0,.4);
                "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }, []);

    // ======================================================
    // UTILIDADES DE DISTANCIA (Fórmula de Haversine)
    // ======================================================

    // Convertir grados a radianes
    const toRadians = (degrees: number): number => {
        return degrees * (Math.PI / 180);
    };

    // Calcular distancia entre dos coordenadas usando la fórmula de Haversine
    const calculateDistance = (
        lat1: number, 
        lon1: number, 
        lat2: number, 
        lon2: number
    ): number => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // ======================================================
    // FILTROS Y ESTADOS DE DISTANCIA (Rango de 1 a 5 km)
    // ======================================================
    
    const [radiusFilter, setRadiusFilter] = useState<number>(3); // Radio en km (3km por defecto)
    const [showRadiusFilter, setShowRadiusFilter] = useState<boolean>(true);

    // Obtener incidentes que están dentro del radio seleccionado (1 a 5 km)
    const incidentsWithinRadius = useMemo(() => {
        if (showRadiusFilter && userLocation) {
            return incidents.filter(incident => {
                const distance = calculateDistance(
                    userLocation[0],
                    userLocation[1],
                    incident.latitud,
                    incident.longitud
                );
                return distance <= radiusFilter;
            });
        }
        return incidents;
    }, [incidents, userLocation, radiusFilter, showRadiusFilter]);

    // Filtrar los incidentes dentro del radio según el tipo/categoría seleccionado
    const filteredIncidents = useMemo(() => {
        return incidentsWithinRadius.filter(inc => 
            filterType === 'todos' ? true : inc.tipo === filterType
        );
    }, [incidentsWithinRadius, filterType]);

    // Calcular estadísticas dinámicas sobre los incidentes filtrados por radio
    const incidentStats = useMemo(() => {
        const total = incidentsWithinRadius.length;
        const pendientes = incidentsWithinRadius.filter(i => i.estado === 'pendiente').length;
        const accidentes = incidentsWithinRadius.filter(i => i.tipo === 'accidente_vial').length;
        const peatonal = incidentsWithinRadius.filter(i => i.tipo === 'Problema_peatonal').length;
        const infraestructura = incidentsWithinRadius.filter(i => i.tipo === 'infraestructura_dañada').length;
        const emergencia = incidentsWithinRadius.filter(i => i.tipo === 'emergencia_riesgo').length;
        const discapacidad = incidentsWithinRadius.filter(i => i.tipo === 'peligro_discapacidad').length;
        return { total, pendientes, accidentes, peatonal, infraestructura, emergencia, discapacidad };
    }, [incidentsWithinRadius]);

    // ======================================================
    // INITIAL EFFECTS
    // ======================================================

    useEffect(() => {
        getCurrentLocation();
        loadIncidents();
        
        // Recargar incidentes cada 30 segundos
        const interval = setInterval(loadIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    // ======================================================
    // RETURN
    // ======================================================

    return (
        <div className="w-full h-screen bg-[#f5f7fb] flex flex-col overflow-hidden">
            {/* HEADER */}
            <header className="h-16 shrink-0 bg-primary text-white border-b border-white/10 shadow-md z-30">
                <div className="w-full h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined">menu</span>
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

            {/* CONTENT */}
            <main className="flex-1 overflow-hidden">
                <div className="w-full h-full max-w-7xl mx-auto p-4">
                    <div className={`w-full h-full grid gap-4 transition-all duration-300 ${
                        isSidebarCollapsed 
                            ? 'grid-cols-1' 
                            : 'grid-cols-1 lg:grid-cols-[380px_1fr]'
                    }`}>
                        {/* SIDEBAR */}
                        <aside className={`bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col overflow-y-auto transition-all duration-300 ${
                            isSidebarCollapsed ? 'hidden' : 'flex'
                        }`}>
                            {/* HEADER */}
                            <div className="p-5 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Buscar ubicación
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Encuentra lugares y calcula rutas
                                </p>
                            </div>

                            {/* SEARCH */}
                            <div className="p-5 border-b">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Buscar calle, colonia o lugar..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                searchPlace();
                                            }
                                        }}
                                        className="
                                            w-full h-14 rounded-2xl border border-gray-300 bg-gray-50
                                            pl-12 pr-4 outline-none focus:border-primary
                                            focus:ring-4 focus:ring-primary/10 transition-all
                                        "
                                    />
                                </div>

                                {/* RESULTS */}
                                <div className="mt-4 flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {searchResults.map((place, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                const coords: LatLngTuple = [place.lat, place.lon];
                                                setSelectedPlace(coords);
                                                setIsSidebarCollapsed(true); // Colapsar el panel al seleccionar
                                                if (avoidIncidents) {
                                                    calculateRouteAvoidingIncidents(coords);
                                                } else {
                                                    calculateRoute(coords);
                                                }
                                            }}
                                            className="p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 text-left transition-all"
                                        >
                                            <p className="text-sm font-medium text-gray-800">
                                                {place.name}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* INCIDENT CONTROLS */}
                            <div className="p-5 border-b">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Control de incidentes
                                </h3>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm text-gray-600">
                                            Mostrar incidentes
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={showIncidents}
                                            onChange={(e) => setShowIncidents(e.target.checked)}
                                            className="toggle"
                                        />
                                    </label>
                                    
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm text-gray-600">
                                            Evitar zonas con incidentes
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={avoidIncidents}
                                            onChange={(e) => setAvoidIncidents(e.target.checked)}
                                            className="toggle"
                                        />
                                    </label>
                                    
                                    <button
                                        onClick={loadIncidents}
                                        className="w-full h-10 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                                        disabled={loadingIncidents}
                                    >
                                        {loadingIncidents ? 'Cargando...' : 'Actualizar incidentes'}
                                    </button>
                                </div>
                            </div>

                            {/* INCIDENT FILTERS */}
                            <div className="p-5 border-b">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Filtrar incidentes
                                </h3>
                                
                                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                                    <button
                                        onClick={() => setFilterType('todos')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'todos' 
                                                ? 'bg-primary text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Todos ({incidentStats.total})
                                    </button>
                                    <button
                                        onClick={() => setFilterType('accidente_vial')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'accidente_vial' 
                                                ? 'bg-red-500 text-white' 
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                    >
                                        🚗 Accidentes ({incidentStats.accidentes})
                                    </button>
                                    <button
                                        onClick={() => setFilterType('Problema_peatonal')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'Problema_peatonal' 
                                                ? 'bg-orange-500 text-white' 
                                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                        }`}
                                    >
                                        🚶 Peatonal ({incidentStats.peatonal})
                                    </button>
                                    <button
                                        onClick={() => setFilterType('infraestructura_dañada')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'infraestructura_dañada' 
                                                ? 'bg-amber-800 text-white' 
                                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                        }`}
                                    >
                                        🚧 Infraestructura ({incidentStats.infraestructura})
                                    </button>
                                    <button
                                        onClick={() => setFilterType('emergencia_riesgo')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'emergencia_riesgo' 
                                                ? 'bg-zinc-900 text-white' 
                                                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                                        }`}
                                    >
                                        ⚠️ Emergencias ({incidentStats.emergencia})
                                    </button>
                                    <button
                                        onClick={() => setFilterType('peligro_discapacidad')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150 ${
                                            filterType === 'peligro_discapacidad' 
                                                ? 'bg-purple-600 text-white' 
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                        }`}
                                    >
                                        ♿ Accesibilidad ({incidentStats.discapacidad})
                                    </button>
                                </div>
                                
                                {incidents.length > 0 && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded-xl">
                                        <div className="text-xs text-gray-600">
                                            📊 {incidentStats.total} incidentes activos
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* DISTANCE RANGE FILTER */}
                            <div className="p-5 border-b">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Filtro por distancia
                                </h3>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm text-gray-600 font-medium">
                                            Limitar por distancia (1-5 km)
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={showRadiusFilter}
                                            onChange={(e) => setShowRadiusFilter(e.target.checked)}
                                            className="toggle"
                                        />
                                    </label>
                                    
                                    {showRadiusFilter && (
                                        <div className="space-y-2 pt-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-gray-500">Radio de búsqueda:</span>
                                                <span className="text-primary">{radiusFilter} km</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                step="0.5"
                                                value={radiusFilter}
                                                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
                                                <span>1 km</span>
                                                <span>2 km</span>
                                                <span>3 km</span>
                                                <span>4 km</span>
                                                <span>5 km</span>
                                            </div>
                                            
                                            {userLocation && (
                                                <div className="mt-2.5 p-2 bg-gray-50 rounded-xl text-[11px] text-gray-600 leading-normal border border-gray-100">
                                                    📍 Filtrando incidentes a menos de <span className="font-bold text-gray-800">{radiusFilter} km</span> de tu ubicación.
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
                                        >
                                            Actualizar ubicación
                                        </button>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* MAP */}
                        <section className="flex flex-col gap-4 overflow-hidden">
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
                                {/* MAP HEADER */}
                                <div className="h-16 border-b px-5 flex items-center justify-between shrink-0">
                                    <div>
                                        <h2 className="font-bold text-gray-800">
                                            Mapa interactivo
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Ubicación en tiempo real
                                        </p>
                                    </div>
                                </div>

                                {/* MAP */}
                                <div className="flex-1 relative min-h-[300px]">
                                    {/* Botón flotante para expandir/colapsar panel */}
                                    <button
                                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                        className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-xl shadow-md border border-gray-250 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                        title={isSidebarCollapsed ? "Mostrar buscador y filtros" : "Ocultar panel de búsqueda"}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {isSidebarCollapsed ? 'search' : 'arrow_back'}
                                        </span>
                                    </button>

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

                                        <FlyToUser location={userLocation} />
                                        <FlyToPlace location={selectedPlace} />

                                        {/* USER */}
                                        {userLocation && (
                                            <>
                                                <CircleMarker
                                                    center={userLocation}
                                                    radius={40}
                                                    pathOptions={{
                                                        color: '#2563eb',
                                                        fillColor: '#2563eb',
                                                        fillOpacity: 0.15
                                                    }}
                                                />
                                                <Marker
                                                    position={userLocation}
                                                    icon={userIcon}
                                                    draggable={true}
                                                    eventHandlers={{
                                                        dragend: (e) => {
                                                            const marker = e.target;
                                                            const pos = marker.getLatLng();
                                                            setUserLocation([pos.lat, pos.lng]);
                                                        }
                                                    }}
                                                >
                                                    <Popup>Tu ubicación actual</Popup>
                                                </Marker>
                                            </>
                                        )}

                                        {/* SEARCHED PLACE */}
                                        {selectedPlace && (
                                            <Marker position={selectedPlace}>
                                                <Popup>Lugar encontrado</Popup>
                                            </Marker>
                                        )}

                                        {/* SEARCH RADIUS GEOGRAPHIC CIRCLE */}
                                        {showRadiusFilter && userLocation && (
                                            <Circle
                                                center={userLocation}
                                                radius={radiusFilter * 1000} // Convertir km a metros
                                                pathOptions={{
                                                    color: '#2563eb',
                                                    fillColor: '#2563eb',
                                                    fillOpacity: 0.05,
                                                    weight: 1.5,
                                                    dashArray: '6, 6'
                                                }}
                                            />
                                        )}

                                        {/* INCIDENTS */}
                                        {showIncidents && filteredIncidents.map((incident) => (
                                            <Marker
                                                key={incident.id}
                                                position={[incident.latitud, incident.longitud]}
                                                icon={getIncidentIcon(incident)}
                                            >
                                                <Popup>
                                                    <div className="p-3 min-w-[280px] max-w-[320px]">
                                                        <div className="flex items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-red-500">
                                                                    warning
                                                                </span>
                                                                <h3 className="font-bold text-gray-800">
                                                                    {incident.categoria}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            {incident.descripcion}
                                                        </p>
                                                        
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-500">Tipo:</span>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {incident.subcategoria}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                            <span className="text-xs text-gray-500">Reportado:</span>
                                                            <p className="text-xs text-gray-600">
                                                                {new Date(incident.fecha).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        
                                                        {incident.imagen && (
                                                            <div className="mb-3">
                                                                <img 
                                                                    src={incident.imagen} 
                                                                    alt="Evidencia"
                                                                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                                    onClick={() => window.open(incident.imagen, '_blank')}
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                                                            📍 {incident.latitud.toFixed(6)}, {incident.longitud.toFixed(6)}
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}

                                        {/* ROUTE */}
                                        {route && (
                                            <>
                                                <Polyline
                                                    positions={route.coordinates}
                                                    pathOptions={{
                                                        color: '#2563eb',
                                                        weight: 6
                                                    }}
                                                />
                                                {route.alternativeRoutes && route.alternativeRoutes.map((altRoute, idx) => (
                                                    <Polyline
                                                        key={idx}
                                                        positions={altRoute.coordinates}
                                                        pathOptions={{
                                                            color: '#9ca3af',
                                                            weight: 6,
                                                            opacity: 0.6,
                                                            dashArray: '5, 8',
                                                            className: 'cursor-pointer'
                                                        }}
                                                        eventHandlers={{
                                                            click: () => handleSelectRoute(altRoute)
                                                        }}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </MapContainer>
                                </div>

                                {/* ROUTE INFO & SELECTOR */}
                                {route && (
                                    <div className="border-t px-5 py-4 bg-gray-50 shrink-0 flex flex-col gap-3">
                                        <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                                            Rutas sugeridas (toca para cambiar)
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {/* Ruta Activa */}
                                            <button 
                                                className="flex-1 p-3 rounded-xl bg-primary/10 border-2 border-primary text-left transition-all flex items-center justify-between"
                                                onClick={() => {}}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-extrabold text-primary uppercase">Ruta Activa</p>
                                                    <p className="text-sm font-black text-gray-800 truncate">
                                                        {route.distanceKm.toFixed(2)} km • {route.durationMin.toFixed(0)} min
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-primary shrink-0">
                                                    check_circle
                                                </span>
                                            </button>

                                            {/* Rutas Alternativas */}
                                            {route.alternativeRoutes && route.alternativeRoutes.map((altRoute, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelectRoute(altRoute)}
                                                    className="flex-1 p-3 rounded-xl bg-white border border-gray-250 hover:border-gray-400 hover:shadow-sm active:scale-[0.99] text-left transition-all flex items-center justify-between cursor-pointer"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase font-bold">Alternativa {idx + 1}</p>
                                                        <p className="text-sm font-semibold text-gray-700 truncate">
                                                            {altRoute.distanceKm.toFixed(2)} km • {altRoute.durationMin.toFixed(0)} min
                                                        </p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-gray-400 shrink-0">
                                                        alt_route
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {avoidIncidents && incidents.length > 0 && (
                                            <div className="text-[11px] text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-1.5 w-fit font-medium">
                                                <span>🛡️</span>
                                                <span>Ruta optimizada para evitar barreras urbanas reportadas.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="h-16 shrink-0 bg-surface/85 backdrop-blur-md border-t border-outline-variant/30 shadow-lg w-full flex justify-around items-center px-4 py-2 z-30">
                <button 
                    onClick={() => onNavigate && onNavigate('home')}
                    className="flex items-center justify-center text-on-surface-variant w-12 h-12 hover:bg-surface-variant/50 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined">home</span>
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('map')}
                    className="flex items-center justify-center text-primary font-bold w-12 h-12 bg-surface-variant/30 rounded-full transition-all duration-200 active:scale-90"
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
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

export default MapScreen;