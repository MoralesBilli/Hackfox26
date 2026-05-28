/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // --- COPIADO DEL HTML ---
            "colors": {
                "surface-container-lowest": "#ffffff",
                "surface-dim": "#d7dbd6",
                "on-surface-variant": "#3f4943",
                "primary-fixed": "#9ff4c9",
                "on-primary": "#ffffff",
                "on-secondary": "#ffffff",
                "surface": "#f7faf5",
                "primary": "#004e34",
                "inverse-primary": "#84d7ae",
                "tertiary-container": "#755600",
                "secondary": "#3959b0",
                "on-primary-fixed": "#002114",
                "inverse-on-surface": "#eef2ed",
                "inverse-surface": "#2d312e",
                "on-surface": "#181d1a",
                "surface-container": "#ebefea",
                "on-primary-container": "#90e4ba",
                "on-error": "#ffffff",
                "secondary-container": "#84a2fe",
                "surface-variant": "#e0e4de",
                "error-container": "#ffdad6",
                "on-tertiary-fixed-variant": "#5c4300",
                "on-tertiary": "#ffffff",
                "surface-bright": "#f7faf5",
                "secondary-fixed-dim": "#b4c5ff",
                "on-secondary-fixed": "#00174b",
                "primary-fixed-dim": "#84d7ae",
                "on-secondary-fixed-variant": "#1c4197",
                "surface-container-high": "#e5e9e4",
                "on-tertiary-fixed": "#261a00",
                "on-tertiary-container": "#ffcc5c",
                "on-secondary-container": "#09348b",
                "error": "#ba1a1a",
                "outline-variant": "#bec9c1",
                "primary-container": "#006847",
                "surface-container-low": "#f1f5ef",
                "tertiary-fixed-dim": "#f5be3c",
                "surface-tint": "#096c4b",
                "tertiary": "#584000",
                "secondary-fixed": "#dbe1ff",
                "outline": "#6f7a72",
                "on-primary-fixed-variant": "#005237",
                "surface-container-highest": "#e0e4de",
                "background": "#f7faf5",
                "on-error-container": "#93000a",
                "tertiary-fixed": "#ffdfa0",
                "on-background": "#181d1a"
            },
            "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            "spacing": {
                "margin-desktop": "32px",
                "gutter": "16px",
                "touch-target-min": "48px",
                "unit": "4px",
                "margin-mobile": "16px"
            },
            "fontFamily": {
                "label-md": ["Atkinson Hyperlegible Next"],
                "label-sm": ["Atkinson Hyperlegible Next"],
                "app-title": ["Atkinson Hyperlegible Next"],
                "body-md": ["Atkinson Hyperlegible Next"],
                "headline-lg-mobile": ["Atkinson Hyperlegible Next"],
                "headline-lg": ["Atkinson Hyperlegible Next"]
            },
            "fontSize": {
                "label-md": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
                "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
                "app-title": ["28px", { "lineHeight": "36px", "fontWeight": "700" }],
                "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                "headline-lg-mobile": ["20px", { "lineHeight": "26px", "fontWeight": "700" }],
                "headline-lg": ["22px", { "lineHeight": "28px", "fontWeight": "700" }]
            }
            // -----------------------------
        },
    },
    plugins: [],
}