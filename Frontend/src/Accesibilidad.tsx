import { useState, useEffect, useRef } from 'react';
import { useAccessibility } from './AccesibilidadContext';
import { useLanguage } from './LanguageContext';
import type { ColorBlindMode } from './AccesibilidadContext';

// ─── Friendly names for screen reader feedback ──────────────────────────────
const FRIENDLY_NAMES_ES: Record<string, string> = {
    feed: 'Inicio',
    map: 'Mapa',
    report: 'Reportar',
    profile: 'Perfil',
    '__911__': '911',
};
const FRIENDLY_NAMES_EN: Record<string, string> = {
    feed: 'Home',
    map: 'Map',
    report: 'Report',
    profile: 'Profile',
    '__911__': '911',
};

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';

// ─── Component ───────────────────────────────────────────────────────────────
const AccessibilityFloating = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateSetting } = useAccessibility();
    const { t, language } = useLanguage();

    // Voice states
    const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
    const voiceMsgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Speak voice confirmation
    const speakFeedback = (text: string) => {
        const synth = window.speechSynthesis;
        if (synth) {
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'es' ? 'es-MX' : 'en-US';
            synth.speak(utterance);
        }
    };

    const showVoiceMsg = (msg: string) => {
        setVoiceMessage(msg);
        if (voiceMsgTimeout.current) clearTimeout(voiceMsgTimeout.current);
        voiceMsgTimeout.current = setTimeout(() => setVoiceMessage(null), 3500);
    };

    // react-speech-recognition hook
    const {
        transcript,
        finalTranscript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Toggle listening based on settings
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;

        if (settings.voiceNavigation && !listening) {
            SpeechRecognition.startListening({ 
                continuous: true, 
                language: language === 'es' ? 'es-MX' : 'en-US' 
            });
        } else if (!settings.voiceNavigation && listening) {
            SpeechRecognition.stopListening();
            resetTranscript();
        }
    }, [settings.voiceNavigation, listening, language, browserSupportsSpeechRecognition, resetTranscript]);

    // Manual command matching
    useEffect(() => {
        if (!transcript) return;
        
        const lowerTranscript = transcript
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        let matchedTarget: string | null = null;

        if (/.*(inicio|home|feed|principal|noticias).*/.test(lowerTranscript)) {
            matchedTarget = 'feed';
        } else if (/.*(mapa|map|ubicar|ubicacion).*/.test(lowerTranscript)) {
            matchedTarget = 'map';
        } else if (/.*(reportar|reporte|report|nuevo|obstaculo|incidencia).*/.test(lowerTranscript)) {
            matchedTarget = 'report';
        } else if (/.*(perfil|profile|cuenta|usuario|registro|login).*/.test(lowerTranscript)) {
            matchedTarget = 'profile';
        } else if (/.*(emergencia|911|emergency|urgencia).*/.test(lowerTranscript)) {
            matchedTarget = '__911__';
        }

        if (matchedTarget) {
            const names = language === 'es' ? FRIENDLY_NAMES_ES : FRIENDLY_NAMES_EN;
            
            if (matchedTarget === '__911__') {
                const msg = (t('a11y_voice_nav_to') || 'Navegando a') + ' 911';
                showVoiceMsg(msg);
                speakFeedback(msg);
                setTimeout(() => {
                    window.location.href = 'tel:911';
                }, 800);
            } else {
                const msg = (t('a11y_voice_nav_to') || 'Navegando a') + ' ' + names[matchedTarget];
                showVoiceMsg(msg);
                speakFeedback(msg);
                setTimeout(() => {
                    setIsOpen(false);
                    onNavigate(matchedTarget as string);
                }, 800);
            }
            resetTranscript();
        }
    }, [transcript, language, t, onNavigate]);

    // Fallback if phrase finishes but no match was made
    useEffect(() => {
        if (finalTranscript && finalTranscript.trim() !== '') {
            const msg = t('a11y_voice_not_understood') || 'Comando no reconocido. Intenta de nuevo.';
            showVoiceMsg(msg + ' (' + finalTranscript + ')');
            speakFeedback(msg);
            resetTranscript();
        }
    }, [finalTranscript, t, resetTranscript]);

    // Close on Escape key
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
                        background: settings.voiceNavigation
                            ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
                            : 'linear-gradient(135deg, #8A1C1C 0%, #5E0000 100%)',
                        color: '#fff',
                        boxShadow: settings.voiceNavigation
                            ? '0 4px 20px rgba(239,68,68,0.4)'
                            : '0 4px 20px rgba(102,0,0,0.4)',
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <span aria-hidden="true" className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {settings.voiceNavigation ? 'mic' : 'accessible'}
                    </span>
                    {settings.voiceNavigation && (
                        <span className="voice-indicator-ping"></span>
                    )}
                </button>
            )}

            {/* Real-time speech transcription debug text (visible outside the modal, directly under the microphone button) */}
            {!isOpen && settings.voiceNavigation && transcript && (
                <div 
                    className="fixed left-4 max-w-[200px] p-2 rounded-xl text-center border shadow-lg z-40 text-xs font-medium"
                    style={{
                        bottom: '16px', // Just below the button which is at bottom-24
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(4px)',
                        animation: 'a11yFadeIn 0.2s ease-out'
                    }}
                >
                    <div className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Escuchando:</div>
                    <div className="italic">"{transcript}"</div>
                </div>
            )}

            {/* Voice feedback message (always visible when active) */}
            {voiceMessage && (
                <div className="fixed bottom-40 left-4 max-w-[220px] p-3 rounded-lg bg-surface-container text-xs text-on-surface text-center shadow-md border border-outline-variant/30 z-40" style={{ animation: 'a11yFadeIn 0.3s ease-out' }}>
                    {voiceMessage}
                </div>
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

                            {/* Mouse Magnifier */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">zoom_in</span>
                                        <div>
                                            <span className="text-sm text-on-surface">{t('a11y_mouse_magnifier')}</span>
                                            <span className="block text-[10px] text-on-surface-variant">{t('a11y_mouse_magnifier_desc')}</span>
                                        </div>
                                    </div>
                                    <Switch checked={settings.mouseMagnifier} onChange={(v) => updateSetting('mouseMagnifier', v)} label={t('a11y_mouse_magnifier')} />
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

                            {/* ── Voice Navigation (Persistent Switch) ──────── */}
                            <section>
                                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                                    <div className="flex items-center gap-3">
                                        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">mic</span>
                                        <div>
                                            <span className="text-sm text-on-surface">{t('a11y_voice_nav')}</span>
                                            <span className="block text-[10px] text-on-surface-variant">{t('a11y_voice_nav_desc')}</span>
                                        </div>
                                    </div>
                                    <Switch checked={settings.voiceNavigation} onChange={(v) => updateSetting('voiceNavigation', v)} label={t('a11y_voice_nav')} />
                                </label>
                                {settings.voiceNavigation && (
                                    <div className="mt-3 p-3 rounded-xl text-xs bg-primary/5 text-primary border border-primary/10 leading-relaxed animate-pulse">
                                        <div className="flex items-center gap-1.5 font-semibold mb-1">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            {t('a11y_voice_listening')}
                                        </div>
                                        {t('a11y_voice_hint')}
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

            {/* ── Animations and Custom styles ────────────────────────────────── */}
            <style>{`
                @keyframes a11ySlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes a11yFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .voice-indicator-ping {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 12px;
                    height: 12px;
                    background-color: #10B981;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: voicePing 1.5s infinite ease-in-out;
                }
                @keyframes voicePing {
                    0% { transform: scale(0.8); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.6; }
                    100% { transform: scale(0.8); opacity: 1; }
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none; width: 22px; height: 22px;
                    background: #660000; border-radius: 50%; cursor: pointer;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.25); border: 2px solid white;
                }
                input[type=range] { height: 22px; }
            `}</style>
        </>
    );
};

export default AccessibilityFloating;