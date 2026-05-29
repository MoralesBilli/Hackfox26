import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';

// ─── Voice command map ───────────────────────────────────────────────────────
const VOICE_COMMANDS: Record<string, string> = {
    // Español
    'inicio': 'feed',
    'ir a inicio': 'feed',
    'ir al inicio': 'feed',
    'home': 'feed',
    'mapa': 'map',
    'ir a mapa': 'map',
    'ir al mapa': 'map',
    'map': 'map',
    'reportar': 'report',
    'reporte': 'report',
    'nuevo reporte': 'report',
    'report': 'report',
    'perfil': 'profile',
    'mi perfil': 'profile',
    'profile': 'profile',
    'emergencia': '__911__',
    '911': '__911__',
    'emergency': '__911__',
};

// Palabras clave para un matching más flexible
const VOICE_KEYWORDS: Record<string, string> = {
    'inicio|home|ir|feed': 'feed',
    'mapa|map': 'map',
    'reportar|reporte|report|nuevo': 'report',
    'perfil|profile|mi|cuenta': 'profile',
    'emergencia|911|emergency': '__911__',
};

const FRIENDLY_NAMES_ES: Record<string, string> = {
    feed: 'Inicio', map: 'Mapa', report: 'Reportar', profile: 'Perfil', '__911__': '911',
};
const FRIENDLY_NAMES_EN: Record<string, string> = {
    feed: 'Home', map: 'Map', report: 'Report', profile: 'Profile', '__911__': '911',
};

// ─── SpeechRecognition type shim ─────────────────────────────────────────────
interface ISpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((ev: any) => void) | null;
    onerror: ((ev: any) => void) | null;
    onend: (() => void) | null;
}

function getSpeechRecognition(): ISpeechRecognition | null {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    return new SR() as ISpeechRecognition;
}

// ─── Component ───────────────────────────────────────────────────────────────
const VoiceControl = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const { t, language } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const voiceMsgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup recognition on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            if (voiceMsgTimeout.current) clearTimeout(voiceMsgTimeout.current);
        };
    }, []);

    // ── Voice navigation ─────────────────────────────────────────────────────
    const startListening = () => {
        const recognition = getSpeechRecognition();
        if (!recognition) {
            showVoiceMsg(t('a11y_voice_not_supported') || 'Reconocimiento de voz no soportado');
            return;
        }

        recognition.lang = language === 'es' ? 'es-MX' : 'en-US';
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const transcript = (event.results[i][0].transcript as string).toLowerCase().trim();
                    handleVoiceCommand(transcript);
                }
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            showVoiceMsg(t('a11y_voice_not_understood') || 'No entendido');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        setVoiceMessage(null);
        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const handleVoiceCommand = (transcript: string) => {
        const names = language === 'es' ? FRIENDLY_NAMES_ES : FRIENDLY_NAMES_EN;
        
        // Primero intenta match exacto
        let target = VOICE_COMMANDS[transcript];
        
        // Si no hay match exacto, busca por palabras clave
        if (!target) {
            for (const [keywords, command] of Object.entries(VOICE_KEYWORDS)) {
                const keywordArray = keywords.split('|');
                if (keywordArray.some(keyword => transcript.includes(keyword))) {
                    target = command;
                    break;
                }
            }
        }

        if (target) {
            if (target === '__911__') {
                window.location.href = 'tel:911';
                showVoiceMsg((t('a11y_voice_nav_to') || 'Navegando a') + ' 911');
            } else {
                showVoiceMsg((t('a11y_voice_nav_to') || 'Navegando a') + ' ' + names[target]);
                setTimeout(() => {
                    onNavigate(target);
                }, 600);
            }
        } else {
            showVoiceMsg(t('a11y_voice_not_understood') || 'No entendido');
        }
    };

    const showVoiceMsg = (msg: string) => {
        setVoiceMessage(msg);
        if (voiceMsgTimeout.current) clearTimeout(voiceMsgTimeout.current);
        voiceMsgTimeout.current = setTimeout(() => setVoiceMessage(null), 3500);
    };

    return (
        <>
            {/* Voice Control FAB */}
            <button
                aria-label="Control de voz"
                className={`fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-all active:scale-90 hover:scale-105 ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-primary'
                } text-on-primary`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Parar escucha' : 'Iniciar control de voz'}
            >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isListening ? 'hearing' : 'mic'}
                </span>
            </button>

            {/* Voice feedback message */}
            {voiceMessage && (
                <div className="fixed bottom-40 right-4 max-w-[200px] p-3 rounded-lg bg-surface-container text-xs text-on-surface text-center shadow-md border border-outline-variant/30 z-40" style={{ animation: 'slideUp 0.3s ease-out' }}>
                    {voiceMessage}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default VoiceControl;
