import { useState, useEffect, useRef } from 'react';
import { useAccessibility } from './AccesibilidadContext';
import { useLanguage } from './LanguageContext';
import type { ColorBlindMode } from './AccesibilidadContext';

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
const AccessibilityFloating = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateSetting } = useAccessibility();
    const { t, language } = useLanguage();

    // Voice state
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

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKey);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    // ── Voice navigation ─────────────────────────────────────────────────────
    const startListening = () => {
        const recognition = getSpeechRecognition();
        if (!recognition) {
            showVoiceMsg(t('a11y_voice_not_supported'));
            return;
        }

        recognition.lang = language === 'es' ? 'es-MX' : 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
            const transcript = (event.results[0][0].transcript as string).toLowerCase().trim();
            handleVoiceCommand(transcript);
        };

        recognition.onerror = () => {
            setIsListening(false);
            showVoiceMsg(t('a11y_voice_not_understood'));
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
        const target = VOICE_COMMANDS[transcript];
        const names = language === 'es' ? FRIENDLY_NAMES_ES : FRIENDLY_NAMES_EN;

        if (target) {
            if (target === '__911__') {
                window.location.href = 'tel:911';
                showVoiceMsg(t('a11y_voice_nav_to') + '911');
            } else {
                showVoiceMsg(t('a11y_voice_nav_to') + names[target]);
                setTimeout(() => {
                    setIsOpen(false);
                    onNavigate(target);
                }, 600);
            }
        } else {
            showVoiceMsg(t('a11y_voice_not_understood'));
        }
    };

    const showVoiceMsg = (msg: string) => {
        setVoiceMessage(msg);
        if (voiceMsgTimeout.current) clearTimeout(voiceMsgTimeout.current);
        voiceMsgTimeout.current = setTimeout(() => setVoiceMessage(null), 3500);
    };

    // ── Toggle helper for switches ───────────────────────────────────────────
    const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
        <div className="relative flex items-center">
            <input
                aria-label={label} role="switch" type="checkbox" className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
        </div>
    );

    return (
        <>
            {/* ── Floating button (bottom-left, always visible) ────────────── */}
            {!isOpen && (
                <button
                    aria-label={t('a11y_open_panel')}
                    className="fixed bottom-24 left-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-90 hover:scale-105"
                    style={{
                        background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <span aria-hidden="true" className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                </button>
            )}

            {/* ── Modal overlay ────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    role="presentation"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div
                        aria-labelledby="a11y-modal-title"
                        aria-modal="true"
                        role="dialog"
                        className="bg-surface w-full max-w-[360px] rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col max-h-[90vh] overflow-hidden"
                        style={{ animation: 'a11ySlideUp 0.3s ease-out' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
                            <h2 className="text-xl font-bold text-on-surface" id="a11y-modal-title">
                                <span className="material-symbols-outlined align-middle mr-2 text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                                {t('a11y_title')}
                            </h2>
                            <button aria-label={t('a11y_close_panel')} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true" className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* ── Scrollable controls ──────────────────────────── */}
                        <div className="overflow-y-auto flex-grow px-6 pb-2 space-y-5" style={{ scrollbarWidth: 'thin' }}>

                            {/* Text Size */}
                            <section>
                                <div className="flex items-center gap-2 mb-2">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">format_size</span>
                                    <h3 className="text-sm font-medium text-on-surface">{t('a11y_text_size')}</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span aria-hidden="true" className="text-xs text-on-surface-variant">A</span>
                                    <input
                                        aria-label={t('a11y_text_size')}
                                        className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                                        max="5" min="1" type="range"
                                        value={settings.textSize}
                                        onChange={(e) => updateSetting('textSize', Number(e.target.value))}
                                    />
                                    <span aria-hidden="true" className="text-lg font-bold text-on-surface-variant">A</span>
                                </div>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* Dyslexia Font */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">spellcheck</span>
                                        <div>
                                            <span className="text-sm text-on-surface">{t('a11y_dyslexia')}</span>
                                            <span className="block text-[10px] text-on-surface-variant">{t('a11y_dyslexia_desc')}</span>
                                        </div>
                                    </div>
                                    <Switch checked={settings.dyslexiaFont} onChange={(v) => updateSetting('dyslexiaFont', v)} label={t('a11y_dyslexia')} />
                                </label>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* Color Blind Mode */}
                            <section>
                                <div className="flex items-center gap-2 mb-2">
                                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">palette</span>
                                    <h3 className="text-sm font-medium text-on-surface">{t('a11y_color_blind')}</h3>
                                </div>
                                <select
                                    aria-label={t('a11y_color_blind')}
                                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-sm p-3 rounded-xl appearance-none outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                                    value={settings.colorBlindMode}
                                    onChange={(e) => updateSetting('colorBlindMode', e.target.value as ColorBlindMode)}
                                >
                                    <option value="none">{t('a11y_cb_none')}</option>
                                    <option value="protanopia">{t('a11y_cb_protanopia')}</option>
                                    <option value="deuteranopia">{t('a11y_cb_deuteranopia')}</option>
                                    <option value="tritanopia">{t('a11y_cb_tritanopia')}</option>
                                    <option value="achromatopsia">{t('a11y_cb_achromatopsia')}</option>
                                </select>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* High Contrast */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">contrast</span>
                                        <span className="text-sm text-on-surface">{t('a11y_high_contrast')}</span>
                                    </div>
                                    <Switch checked={settings.highContrast} onChange={(v) => updateSetting('highContrast', v)} label={t('a11y_high_contrast')} />
                                </label>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* Reduced Motion */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">motion_photos_off</span>
                                        <div>
                                            <span className="text-sm text-on-surface">{t('a11y_reduced_motion')}</span>
                                            <span className="block text-[10px] text-on-surface-variant">{t('a11y_reduced_motion_desc')}</span>
                                        </div>
                                    </div>
                                    <Switch checked={settings.reducedMotion} onChange={(v) => updateSetting('reducedMotion', v)} label={t('a11y_reduced_motion')} />
                                </label>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* Voice Assistant (TTS on click) */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">record_voice_over</span>
                                        <div>
                                            <span className="text-sm text-on-surface">{t('a11y_voice_assistant')}</span>
                                            <span className="block text-[10px] text-on-surface-variant">{t('a11y_voice_assistant_desc')}</span>
                                        </div>
                                    </div>
                                    <Switch checked={settings.screenReader} onChange={(v) => updateSetting('screenReader', v)} label={t('a11y_voice_assistant')} />
                                </label>
                            </section>

                            <hr className="border-outline-variant/20" />

                            {/* ── Voice Navigation ─────────────────────────── */}
                            <section className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(63,61,158,0.06))' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span aria-hidden="true" className="material-symbols-outlined text-primary">mic</span>
                                    <h3 className="text-sm font-semibold text-on-surface">{t('a11y_voice_nav')}</h3>
                                </div>

                                <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">{t('a11y_voice_hint')}</p>

                                <button
                                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all ${isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                                        }`}
                                    onClick={isListening ? stopListening : startListening}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {isListening ? 'hearing' : 'mic'}
                                    </span>
                                    {isListening ? t('a11y_voice_listening') : t('a11y_voice_nav')}
                                </button>

                                {/* Voice feedback */}
                                {voiceMessage && (
                                    <div className="mt-2 p-2 rounded-lg bg-surface-container text-xs text-on-surface text-center" style={{ animation: 'a11yFadeIn 0.2s ease-out' }}>
                                        {voiceMessage}
                                    </div>
                                )}
                            </section>

                        </div>

                        {/* ── Done button ───────────────────────────────────── */}
                        <div className="px-6 py-4 shrink-0 border-t border-outline-variant/20">
                            <button
                                className="w-full h-[48px] bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                                onClick={() => setIsOpen(false)}
                            >
                                <span aria-hidden="true" className="material-symbols-outlined">check</span>
                                {t('a11y_done')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Animations ──────────────────────────────────────────────── */}
            <style>{`
                @keyframes a11ySlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes a11yFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none; width: 22px; height: 22px;
                    background: #6C63FF; border-radius: 50%; cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.25); border: 2px solid white;
                }
                input[type=range] { height: 22px; }
            `}</style>
        </>
    );
};

export default AccessibilityFloating;