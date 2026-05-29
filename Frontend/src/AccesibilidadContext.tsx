import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScreenMagnifier } from './ScreenMagnifier';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface AccessibilitySettings {
    textSize: number;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    voiceSpeed: number;
    dyslexiaFont: boolean;
    colorBlindMode: ColorBlindMode;
    voiceNavigation: boolean;
    mouseMagnifier: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
}

const defaultSettings: AccessibilitySettings = {
    textSize: 3,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    voiceSpeed: 1.0,
    dyslexiaFont: false,
    colorBlindMode: 'none',
    voiceNavigation: false,
    mouseMagnifier: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const savedPrefs = localStorage.getItem('a11y_prefs');
        return savedPrefs ? { ...defaultSettings, ...JSON.parse(savedPrefs) } : defaultSettings;
    });

    const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    // Efecto de Persistencia y Manipulación del DOM GLOBAL
    useEffect(() => {
        localStorage.setItem('a11y_prefs', JSON.stringify(settings));
        const root = document.documentElement;

        // Tamaño de Texto
        const scaleMap: Record<number, string> = { 1: '75%', 2: '87.5%', 3: '100%', 4: '112.5%', 5: '125%' };
        root.style.fontSize = scaleMap[settings.textSize] || '100%';

        // Alto Contraste
        if (settings.highContrast) root.classList.add('a11y-high-contrast');
        else root.classList.remove('a11y-high-contrast');

        // Reducción de Movimiento
        if (settings.reducedMotion) root.classList.add('a11y-reduced-motion');
        else root.classList.remove('a11y-reduced-motion');

        // Dislexia
        if (settings.dyslexiaFont) root.classList.add('dyslexia-mode');
        else root.classList.remove('dyslexia-mode');

        // Daltonismo
        root.setAttribute('data-colorblind', settings.colorBlindMode);

    }, [settings]);

    // Efecto del Asistente de Voz
    useEffect(() => {
        const synth = window.speechSynthesis;

        if (!settings.screenReader) {
            synth.cancel();
            return;
        }

        const handleSpeak = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const textToRead = target.getAttribute('aria-label') || target.innerText || target.getAttribute('alt');

            if (textToRead) {
                synth.cancel();
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.rate = settings.voiceSpeed;
                utterance.lang = 'es-MX';
                synth.speak(utterance);
            }
        };

        document.addEventListener('click', handleSpeak, true);
        return () => {
            document.removeEventListener('click', handleSpeak, true);
            synth.cancel();
        };
    }, [settings.screenReader, settings.voiceSpeed]);

    return (
        <AccessibilityContext.Provider value={{ settings, updateSetting }}>
            {/* INYECTAMOS LOS FILTROS SVG Y ESTILOS GLOBALES AQUÍ PARA QUE VIVAN EN TODA LA APP */}
            <svg style={{ display: 'none' }} aria-hidden="true">
                <defs>
                    <filter id="protanopia">
                        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="deuteranopia">
                        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="tritanopia">
                        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0" />
                    </filter>
                </defs>
            </svg>
            <style>{`
                /* Fuente para Dislexia */
                .dyslexia-mode, .dyslexia-mode * {
                    font-family: 'OpenDyslexic', 'Comic Sans MS', 'Lexend', Arial, sans-serif !important;
                    letter-spacing: 0.05em !important;
                    word-spacing: 0.1em !important;
                }

                /* Filtros de Daltonismo */
                html[data-colorblind="protanopia"] { filter: url('#protanopia'); }
                html[data-colorblind="deuteranopia"] { filter: url('#deuteranopia'); }
                html[data-colorblind="tritanopia"] { filter: url('#tritanopia'); }
                html[data-colorblind="achromatopsia"] { filter: grayscale(100%); }
            `}</style>

            {children}
            <ScreenMagnifier />
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error("useAccessibility debe usarse dentro de un AccessibilityProvider");
    return context;
};