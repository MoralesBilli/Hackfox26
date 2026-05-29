import React, { createContext, useContext, useState } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    es: {
        // App / Navigation
        app_title: 'Tijuana Sin Barreras',
        app_subtitle: 'Mapa de accesibilidad urbana',
        nav_home: 'Inicio',
        nav_map: 'Mapa',
        nav_report: 'Reportar',
        nav_profile: 'Perfil',
        
        // Map Screen Header & Sidebar
        my_location: 'Mi ubicación',
        search_title: 'Buscar ubicación',
        search_subtitle: 'Encuentra lugares y calcula rutas',
        search_placeholder: 'Buscar calle, colonia o lugar...',
        incident_controls: 'Control de incidentes',
        show_incidents: 'Mostrar incidentes',
        avoid_incidents: 'Evitar zonas con incidentes',
        update_incidents_btn: 'Actualizar incidentes',
        filter_incidents_title: 'Filtrar incidentes',
        filter_all: 'Todos',
        filter_accidents: 'Accidentes',
        filter_pedestrian: 'Peatonal',
        filter_infrastructure: 'Infraestructura',
        filter_emergencies: 'Emergencias',
        filter_accessibility: 'Accesibilidad',
        distance_filter_title: 'Filtro por distancia',
        distance_filter_limit: 'Limitar por distancia (1-5 km)',
        search_radius_label: 'Radio de búsqueda',
        distance_filtering_msg: 'Filtrando incidentes a menos de {radius} km de tu ubicación.',
        loading_location: 'Obteniendo ubicación...',
        gps_accuracy: 'Precisión GPS',
        update_location_btn: 'Actualizar ubicación',
        
        // Map Interactivity
        interactive_map_title: 'Mapa interactivo',
        real_time_loc_subtitle: 'Ubicación en tiempo real',
        sidebar_show_tooltip: 'Mostrar buscador y filtros',
        sidebar_hide_tooltip: 'Ocultar panel de búsqueda',
        user_current_loc_popup: 'Tu ubicación actual',
        searched_place_popup: 'Lugar encontrado',
        suggested_routes_title: 'Rutas sugeridas (toca para cambiar)',
        active_route_label: 'Ruta Activa',
        alternative_route_label: 'Alternativa',
        optimized_route_msg: 'Ruta optimizada para evitar barreras urbanas reportadas.',
        
        // Chat Assistant
        assistant_title: 'Asistente IA ligero · Inicio',
        assistant_welcome: 'Hola, soy tu asistente ligero de la app. Puedo ayudarte con mapa, rutas, reportes, 911 y accesibilidad.',
        assistant_input_placeholder: 'Escribe tu pregunta...',
        assistant_send_btn: 'Enviar',
        chip_open_map: 'Abrir mapa',
        chip_how_report: '¿Cómo reporto?',
        chip_need_route: 'Necesito ruta rápida',
        chip_call_911: 'Llamar 911',
        chat_model_opened_map: 'Te he llevado al mapa interactivo. Aquí puedes visualizar incidentes en tiempo real, filtrar reportes por radio y buscar direcciones.',
        chat_model_called_911: 'He iniciado la llamada al número de emergencias 911. Por favor mantén la calma y describe tu situación.',
        chat_conn_error: 'Error de conexión. Asegúrate de que el servidor esté activo y vuelve a intentarlo.',

        // Feed & Symbolology
        symbol_title: 'Simbología',
        symbol_subtitle: 'Identifica los reportes comunitarios y barreras de accesibilidad según su color asignado:',
        symbol_desc_accident: 'Choques o bloqueos vehiculares graves en calzada.',
        symbol_desc_pedestrian: 'Obstáculos en banquetas, cruces o semáforos peatonales dañados.',
        symbol_desc_infrastructure: 'Baches, escombros abandonados, grietas y aceras rotas.',
        symbol_desc_emergency: 'Cables eléctricos expuestos, incendios o hoyos peligrosos profundos.',
        symbol_desc_mobility: 'Bloqueo de rampas para sillas de ruedas o accesos adaptados.',
        feed_loading: 'Cargando reportes en tiempo real...',
        feed_no_reports: 'No hay reportes activos en este momento.',
        feed_update_btn: 'Actualizar',
        feed_active_count: 'reportes activos',
        feed_notifications: 'Notificaciones',
        feed_show_map: 'Ver en mapa',
        cat_citizen_report: 'Reporte Ciudadano',
        cat_traffic_accident: 'Accidente Vial',
        cat_pedestrian_problem: 'Problema Peatonal',
        cat_damaged_infrastructure: 'Infraestructura',
        cat_emergency_risk: 'Emergencia / Riesgo',
        cat_disability_hazard: 'Peligro Movilidad',
        status_pending: 'Pendiente',
        status_verified: 'Verificado',

        // Accessibility Panel
        a11y_title: 'Accesibilidad',
        a11y_text_size: 'Tamaño de texto',
        a11y_dyslexia: 'Fuente para dislexia',
        a11y_dyslexia_desc: 'Mejora la legibilidad',
        a11y_color_blind: 'Ajuste de color (Daltonismo)',
        a11y_cb_none: 'Por defecto (Sin filtro)',
        a11y_cb_protanopia: 'Protanopía (Rojo - Verde)',
        a11y_cb_deuteranopia: 'Deuteranopía (Verde - Rojo)',
        a11y_cb_tritanopia: 'Tritanopía (Azul - Amarillo)',
        a11y_cb_achromatopsia: 'Acromatopsia (Escala de grises)',
        a11y_high_contrast: 'Alto contraste',
        a11y_reduced_motion: 'Reducir movimiento',
        a11y_reduced_motion_desc: 'Desactiva animaciones',
        a11y_voice_assistant: 'Asistente de voz',
        a11y_voice_assistant_desc: 'Lee elementos al tocarlos',
        a11y_done: 'Listo',
        a11y_voice_nav: 'Navegación por voz',
        a11y_voice_nav_desc: 'Mantiene el micrófono activo para comandos de voz',
        a11y_voice_listening: 'Escuchando...',
        a11y_voice_hint: 'Di: "inicio", "mapa", "reportar", "perfil" o "emergencia"',
        a11y_voice_nav_to: 'Navegando a: ',
        a11y_voice_not_understood: 'No entendí el comando. Intenta de nuevo.',
        a11y_voice_not_supported: 'Tu navegador no soporta reconocimiento de voz.',
        a11y_open_panel: 'Abrir panel de accesibilidad',
        a11y_close_panel: 'Cerrar panel',
    },
    en: {
        // App / Navigation
        app_title: 'Barrier-Free Tijuana',
        app_subtitle: 'Urban accessibility map',
        nav_home: 'Home',
        nav_map: 'Map',
        nav_report: 'Report',
        nav_profile: 'Profile',
        
        // Map Screen Header & Sidebar
        my_location: 'My location',
        search_title: 'Search location',
        search_subtitle: 'Find places and calculate routes',
        search_placeholder: 'Search street, neighborhood, or place...',
        incident_controls: 'Incident control',
        show_incidents: 'Show incidents',
        avoid_incidents: 'Avoid incident zones',
        update_incidents_btn: 'Update incidents',
        filter_incidents_title: 'Filter incidents',
        filter_all: 'All',
        filter_accidents: 'Accidents',
        filter_pedestrian: 'Pedestrian',
        filter_infrastructure: 'Infrastructure',
        filter_emergencies: 'Emergencies',
        filter_accessibility: 'Accessibility',
        distance_filter_title: 'Distance filter',
        distance_filter_limit: 'Limit by distance (1-5 km)',
        search_radius_label: 'Search radius',
        distance_filtering_msg: 'Filtering incidents closer than {radius} km from your location.',
        loading_location: 'Getting location...',
        gps_accuracy: 'GPS Accuracy',
        update_location_btn: 'Update location',
        
        // Map Interactivity
        interactive_map_title: 'Interactive map',
        real_time_loc_subtitle: 'Real-time location',
        sidebar_show_tooltip: 'Show search and filters',
        sidebar_hide_tooltip: 'Hide search panel',
        user_current_loc_popup: 'Your current location',
        searched_place_popup: 'Found place',
        suggested_routes_title: 'Suggested routes (tap to switch)',
        active_route_label: 'Active Route',
        alternative_route_label: 'Alternative',
        optimized_route_msg: 'Optimized route to avoid reported urban barriers.',
        
        // Chat Assistant
        assistant_title: 'Light AI Assistant · Home',
        assistant_welcome: 'Hi, I am your app light assistant. I can help you with maps, routes, reports, 911 and accessibility.',
        assistant_input_placeholder: 'Write your question...',
        assistant_send_btn: 'Send',
        chip_open_map: 'Open map',
        chip_how_report: 'How do I report?',
        chip_need_route: 'I need a fast route',
        chip_call_911: 'Call 911',
        chat_model_opened_map: 'I have taken you to the interactive map. Here you can visualize incidents in real time, filter reports by radius, and search for addresses.',
        chat_model_called_911: 'I have started the call to the emergency number 911. Please stay calm and describe your situation.',
        chat_conn_error: 'Connection error. Make sure the server is active and try again.',

        // Feed & Symbolology
        symbol_title: 'Symbolology',
        symbol_subtitle: 'Identify community reports and accessibility barriers by their assigned color:',
        symbol_desc_accident: 'Collisions or serious vehicle blockages on the road.',
        symbol_desc_pedestrian: 'Obstacles on sidewalks, crossings or damaged pedestrian signals.',
        symbol_desc_infrastructure: 'Potholes, abandoned debris, cracks and broken sidewalks.',
        symbol_desc_emergency: 'Exposed electrical cables, fires or deep dangerous holes.',
        symbol_desc_mobility: 'Blocking of wheelchair ramps or adapted accesses.',
        feed_loading: 'Loading real-time reports...',
        feed_no_reports: 'No active reports at this moment.',
        feed_update_btn: 'Update',
        feed_active_count: 'active reports',
        feed_notifications: 'Notifications',
        feed_show_map: 'View on map',
        cat_citizen_report: 'Citizen Report',
        cat_traffic_accident: 'Traffic Accident',
        cat_pedestrian_problem: 'Pedestrian Issue',
        cat_damaged_infrastructure: 'Infrastructure',
        cat_emergency_risk: 'Emergency / Risk',
        cat_disability_hazard: 'Mobility Hazard',
        status_pending: 'Pending',
        status_verified: 'Verified',

        // Accessibility Panel
        a11y_title: 'Accessibility',
        a11y_text_size: 'Text size',
        a11y_dyslexia: 'Dyslexia font',
        a11y_dyslexia_desc: 'Improves readability',
        a11y_color_blind: 'Color adjustment (Color blindness)',
        a11y_cb_none: 'Default (No filter)',
        a11y_cb_protanopia: 'Protanopia (Red - Green)',
        a11y_cb_deuteranopia: 'Deuteranopia (Green - Red)',
        a11y_cb_tritanopia: 'Tritanopia (Blue - Yellow)',
        a11y_cb_achromatopsia: 'Achromatopsia (Grayscale)',
        a11y_high_contrast: 'High contrast',
        a11y_reduced_motion: 'Reduce motion',
        a11y_reduced_motion_desc: 'Disables animations',
        a11y_voice_assistant: 'Voice assistant',
        a11y_voice_assistant_desc: 'Reads elements on tap',
        a11y_done: 'Done',
        a11y_voice_nav: 'Voice navigation',
        a11y_voice_nav_desc: 'Keeps microphone active for voice commands',
        a11y_voice_listening: 'Listening...',
        a11y_voice_hint: 'Say: "home", "map", "report", "profile" or "emergency"',
        a11y_voice_nav_to: 'Navigating to: ',
        a11y_voice_not_understood: 'Command not understood. Try again.',
        a11y_voice_not_supported: 'Your browser does not support voice recognition.',
        a11y_open_panel: 'Open accessibility panel',
        a11y_close_panel: 'Close panel',
    }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('app_lang');
        return (savedLang === 'en' ? 'en' : 'es') as Language;
    });

    const toggleLanguage = () => {
        setLanguage(prev => {
            const next = prev === 'es' ? 'en' : 'es';
            localStorage.setItem('app_lang', next);
            return next;
        });
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
