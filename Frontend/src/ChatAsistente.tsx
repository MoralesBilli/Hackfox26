import React, { useState, useEffect, useRef } from 'react';

type Message = {
    role: 'user' | 'model';
    content: string;
};

type ChatAsistenteProps = {
    onNavigate?: (screen: string) => void;
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const ChatAsistente: React.FC<ChatAsistenteProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [historial, setHistorial] = useState<Message[]>([
        {
            role: 'model',
            content: 'Hola, soy tu asistente ligero de la app. Puedo ayudarte con mapa, rutas, reportes, 911 y accesibilidad.'
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al fondo
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [historial, loading, isOpen]);

    const enviarMensaje = async (texto: string) => {
        if (!texto.trim()) return;

        const nuevoMensaje: Message = { role: 'user', content: texto };
        const historialPrevio = [...historial];
        
        setHistorial(prev => [...prev, nuevoMensaje]);
        setMensaje('');
        setLoading(true);

        try {
            // Mapear historial al formato esperado por el backend (role: user/model)
            const historialAPI = historialPrevio.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch(`${apiUrl}/asistente_chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mensaje: texto,
                    historial: historialAPI
                })
            });

            if (!response.ok) {
                throw new Error('Error al obtener respuesta del asistente');
            }

            const data = await response.json();
            
            if (data.respuesta) {
                setHistorial(prev => [...prev, { role: 'model', content: data.respuesta }]);
            } else {
                setHistorial(prev => [...prev, { role: 'model', content: 'Lo siento, no pude procesar tu solicitud.' }]);
            }
        } catch (error) {
            console.error('Error en chat asistente:', error);
            setHistorial(prev => [...prev, { 
                role: 'model', 
                content: 'Error de conexión. Asegúrate de que el servidor esté activo y vuelve a intentarlo.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        if (action === 'mapa') {
            if (onNavigate) {
                onNavigate('map');
                setHistorial(prev => [
                    ...prev, 
                    { role: 'user', content: 'Abrir mapa' },
                    { role: 'model', content: 'Te he llevado al mapa interactivo. Aquí puedes visualizar incidentes en tiempo real, filtrar reportes por radio y buscar direcciones.' }
                ]);
            }
        } else if (action === 'reporte') {
            enviarMensaje('¿Cómo reporto un obstáculo o problema de accesibilidad?');
        } else if (action === 'ruta') {
            enviarMensaje('¿Cómo calculo una ruta accesible evitando incidentes?');
        } else if (action === '911') {
            window.location.href = 'tel:911';
            setHistorial(prev => [
                ...prev,
                { role: 'user', content: 'Llamar al 911' },
                { role: 'model', content: 'He iniciado la llamada al número de emergencias 911. Por favor mantén la calma y describe tu situación.' }
            ]);
        }
    };

    return (
        <>
            {/* BOTÓN FLOTANTE (BURBUJA) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="
                        fixed bottom-20 right-4 z-[999] w-14 h-14 rounded-full
                        bg-primary text-white shadow-2xl flex items-center justify-center
                        hover:scale-105 active:scale-95 transition-all duration-300
                        md:bottom-6 md:right-6 animate-pulse
                    "
                    style={{
                        boxShadow: '0 8px 30px rgba(102, 0, 0, 0.3)',
                    }}
                    title="Asistente de accesibilidad"
                >
                    <span className="material-symbols-outlined text-2xl font-bold">
                        smart_toy
                    </span>
                </button>
            )}

            {/* VENTANA DE CHAT FLOTANTE */}
            {isOpen && (
                <div
                    className="
                        fixed bottom-20 right-4 w-[360px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]
                        z-[999] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-200/80
                        overflow-hidden md:bottom-6 md:right-6 transition-all duration-300 ease-out
                    "
                    style={{
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    {/* ENCABEZADO */}
                    <div className="h-14 bg-primary text-white px-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">smart_toy</span>
                            <span className="text-sm font-bold tracking-wide">
                                Asistente IA ligero · Inicio
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleQuickAction('911')}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                                title="Llamar al 911"
                            >
                                <span className="material-symbols-outlined text-lg">call</span>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                                title="Cerrar"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>

                    {/* BOTONES RÁPIDOS / CHIPS */}
                    <div className="h-12 border-b border-gray-100 bg-white flex items-center px-3 gap-2 overflow-x-auto shrink-0 select-none no-scrollbar">
                        <button
                            onClick={() => handleQuickAction('mapa')}
                            className="shrink-0 h-7 px-3.5 rounded-full border border-gray-250 bg-white text-[11px] font-semibold text-gray-700 hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
                        >
                            Abrir mapa
                        </button>
                        <button
                            onClick={() => handleQuickAction('reporte')}
                            className="shrink-0 h-7 px-3.5 rounded-full border border-gray-250 bg-white text-[11px] font-semibold text-gray-700 hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
                        >
                            ¿Cómo reporto?
                        </button>
                        <button
                            onClick={() => handleQuickAction('ruta')}
                            className="shrink-0 h-7 px-3.5 rounded-full border border-gray-250 bg-white text-[11px] font-semibold text-gray-700 hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
                        >
                            Necesito ruta rápida
                        </button>
                        <button
                            onClick={() => handleQuickAction('911')}
                            className="shrink-0 h-7 px-3.5 rounded-full border border-red-200 bg-red-50 text-[11px] font-semibold text-red-700 hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                        >
                            Llamar 911
                        </button>
                    </div>

                    {/* MENSAJES */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {historial.map((msg, index) => (
                            <div
                                key={index}
                                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-primary text-white self-end rounded-tr-none'
                                        : 'bg-[#FFF8F6] border border-[#F5DED9] text-gray-800 self-start rounded-tl-none'
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        ))}

                        {/* INDICADOR DE CARGA */}
                        {loading && (
                            <div className="flex gap-1.5 items-center bg-[#FFF8F6] border border-[#F5DED9] rounded-2xl rounded-tl-none p-3.5 self-start shadow-sm max-w-[80px] justify-center">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ENTRADA DE TEXTO */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            enviarMensaje(mensaje);
                        }}
                        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
                    >
                        <input
                            type="text"
                            placeholder="Escribe tu pregunta..."
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            disabled={loading}
                            className="
                                flex-1 h-10 px-4 rounded-full bg-[#FFF8F6] border border-gray-200
                                outline-none text-xs text-gray-800 placeholder-gray-400
                                focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all
                                disabled:opacity-50
                            "
                        />
                        <button
                            type="submit"
                            disabled={loading || !mensaje.trim()}
                            className="
                                h-10 px-4 rounded-full bg-[#ab7b78] text-white font-bold text-xs
                                hover:opacity-90 active:scale-95 transition-all flex items-center justify-center
                                disabled:opacity-50 disabled:pointer-events-none cursor-pointer
                            "
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatAsistente;
