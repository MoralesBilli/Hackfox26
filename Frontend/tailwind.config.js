/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // --- Color Principal ---
                'primary': '#660000',             // Tu color base (Guinda oscuro)
                'on-primary': '#FFFFFF',          // Texto sobre el color principal
                'primary-fixed-dim': '#FFB4AB',   // Tono más claro para enlaces/Dark Mode

                // --- Secundarios (Para iconos secundarios y mapas) ---
                'secondary': '#775652',           // Tono tierra desaturado que combina con el guinda

                // --- Fondos y Superficies (Tonos cálidos muy sutiles) ---
                'background': '#FFF8F6',          // Fondo general de la app (casi blanco con toque cálido)
                'on-background': '#231918',       // Texto general
                'surface': '#FFF8F6',             // Fondo del TopAppBar y menús
                'on-surface': '#231918',          // Texto sobre superficies (títulos principales)
                'surface-variant': '#F5DED9',     // Fondos para hover en botones
                'on-surface-variant': '#534341',  // Texto secundario (fechas, subtítulos)

                // --- Contenedores (Para las tarjetas de reportes) ---
                'surface-container-lowest': '#FFFFFF', // Fondo de la tarjeta (FeedCard)
                'surface-container': '#FCEAE7',        // Fondo grisáceo cálido para contenedores de imagen

                // --- Bordes y Divisiones ---
                'outline-variant': '#D8C2BE',     // Color para las líneas sutiles (ring, bordes)

                // --- Estados (Pendiente vs Verificado) ---
                'error-container': '#FFDAD6',          // Fondo rojo claro para estado "Pendiente"
                'on-error-container': '#410002',       // Texto rojo oscuro para "Pendiente"
                'tertiary-fixed': '#DCE7C5',           // Fondo verde olivo/pálido para estado "Verificado"
                'on-tertiary-fixed-variant': '#3D4C28',// Texto verde oscuro para "Verificado"
            }
        },
    },
    plugins: [],
}