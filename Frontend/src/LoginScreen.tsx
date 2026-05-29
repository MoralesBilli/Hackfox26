import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

// Interfaz basada exactamente en tu tabla de requerimientos
interface LoginFormData {
    correo: string;
    contrasena: string;
}

const LoginScreen = ({ onNavigate }: any) => {
    const [formData, setFormData] = useState<LoginFormData>({
        correo: '',
        contrasena: ''
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Nuevos estados para manejar la petición HTTP
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        // Limpiamos el error si el usuario empieza a escribir de nuevo
        if (errorMessage) setErrorMessage(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

        try {
            const response = await fetch(`${apiUrl}/iniciar_sesion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            let data: any = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            if (!response.ok) {
                // Si el backend devuelve un error (ej. 401 o 502)
                throw new Error(data.error || data.detail || 'Correo o contraseña incorrectos');
            }

            // Si todo sale bien, la descripción de tu API dice que devuelve los tokens y el perfil
            console.log('✅ Autenticación exitosa:', data);

            // Guardar el token en localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.usuario) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }

            alert('¡Sesión iniciada con éxito!');

            // Aquí redirigimos al usuario al dashboard
            onNavigate('home');

        } catch (error: any) {
            console.error('❌ Error al iniciar sesión:', error);
            setErrorMessage(error.message || 'Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-hidden antialiased">

            {/* Círculos difuminados decorativos de fondo (Glow blobs) - Coherentes con Onboarding */}
            <div className="absolute top-[-10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[10000ms] mix-blend-multiply"></div>

            {/* TopAppBar */}
            <header className="bg-primary text-on-primary flex items-start px-4 h-[220px] w-full relative z-10 pt-4 pb-4">
                <div className="flex items-center w-full h-14 max-w-6xl mx-auto">
                    <button
                        onClick={() => onNavigate('home')}
                        aria-label="Volver"
                        className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="font-app-title text-app-title text-on-primary ml-2 truncate">
                        Tijuana Sin Barreras
                    </h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center px-margin-mobile -mt-[100px] relative z-20 pb-24 w-full max-w-[1024px] mx-auto">

                {/* Login Card */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/45 rounded-3xl p-6 pt-12 w-full max-w-md shadow-xl relative mt-8 overflow-visible">

                    {/* Línea de color superior gradiente */}
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary via-secondary to-primary-fixed-dim rounded-t-3xl"></div>

                    {/* Ícono Flotante con efecto premium */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg transition-transform hover:scale-110 duration-300">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            accessible_forward
                        </span>
                    </div>

                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-[22px] md:text-[24px] font-black text-on-surface text-center mb-1">
                            Bienvenido de nuevo
                        </h2>
                        <p className="font-body-md text-sm text-on-surface-variant text-center">
                            Inicia sesión para continuar
                        </p>
                    </div>

                    {/* Mensaje de Error (Se muestra solo si hay un error) */}
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl font-body-md text-sm border border-error-container/40 animate-fade-in">
                            {errorMessage}
                        </div>
                    )}

                    <form className="flex flex-col gap-4.5" onSubmit={handleSubmit}>

                        {/* Email Field */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="correo">
                                Correo electrónico
                            </label>
                            <div className="relative flex items-center group">
                                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    className="w-full h-[52px] pl-11 pr-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md disabled:opacity-50"
                                    id="correo"
                                    placeholder="tu@correo.com"
                                    required
                                    type="email"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="contrasena">
                                Contraseña
                            </label>
                            <div className="relative flex items-center group">
                                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    className="w-full h-[52px] pl-11 pr-12 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md disabled:opacity-50"
                                    id="contrasena"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    className="absolute right-2 w-10 h-10 flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-variant/20 focus:outline-none rounded-full transition-all disabled:opacity-50 cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <a className="font-label-md text-sm text-primary hover:underline h-min touch-target-min flex items-center justify-end font-bold" href="#">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full h-[54px] bg-primary text-on-primary font-bold rounded-xl transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_8px_24px_rgba(102,0,0,0.25)] hover:scale-[1.01] active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                    Iniciando...
                                </>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="h-px bg-outline-variant/40 flex-grow"></div>
                        <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase">o</span>
                        <div className="h-px bg-outline-variant/40 flex-grow"></div>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        className="w-full h-[54px] bg-surface border-2 border-outline-variant/20 text-on-surface font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-surface-variant/5 hover:border-outline-variant/50 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                    >
                        <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwTHP44lV2JPmDHwhf2rWFo-1RjOC6yAWc--YXHRNDQ-Dq0iijnoSHU_8W8cQJrcwhVIbzepiMNSme2kaOC4do84urqwUcjzMScNjb-Rcgi-By09IJZoeqxE8kGChDXlgBN7Jd5jbIByMJwpgdYFqinIuEVmeELwCurdfdaDEeozHqQ4j8OaIhY6AH16zVT8JgShNFjA424jfLIeLCBalddw8CqudSLRMwltDLZcIqnALbPHlA74lvILb-zioET04IefCGt6PZFZ4" />
                        Continuar con Google
                    </button>
                </div>

                {/* Register Link */}
                <div className="mt-8 text-center">
                    <span className="font-body-md text-sm text-on-surface-variant">¿No tienes cuenta?</span>
                    <a onClick={(e) => { e.preventDefault(); onNavigate('registro'); }} className="font-bold text-sm text-primary hover:underline ml-1.5 touch-target-min inline-flex items-center justify-center cursor-pointer" href="#">
                        Regístrate
                    </a>
                </div>
            </main>

            {/* Botón Flotante de Accesibilidad */}
            <button
                onClick={() => onNavigate('accessibility')}
                aria-label="Opciones de Accesibilidad"
                className="fixed bottom-margin-mobile left-margin-mobile md:left-auto md:right-margin-desktop md:bottom-margin-desktop h-[56px] w-[56px] md:w-auto md:px-6 bg-primary text-on-primary rounded-full flex items-center justify-center md:justify-start gap-2 shadow-[0px_8px_24px_rgba(102,0,0,0.25)] z-50 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30 group cursor-pointer"
            >
                <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    accessible
                </span>
                <span className="hidden md:inline font-bold whitespace-nowrap">
                    Accesibilidad
                </span>
            </button>
        </div>
    );
};

export default LoginScreen;