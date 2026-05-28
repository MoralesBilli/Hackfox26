import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

// Interfaz basada exactamente en tu tabla de requerimientos
interface LoginFormData {
    correo: string;
    contrasena: string;
}

const LoginScreen = () => {
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
            // Reemplaza "http://localhost:8000" con la URL real de tu backend (ej. tu servidor de Python)
            const response = await fetch(`${apiUrl}/iniciar_sesion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si el backend devuelve un error (ej. 401 Unauthorized)
                throw new Error(data.detail || 'Correo o contraseña incorrectos');
            }

            // Si todo sale bien, la descripción de tu API dice que devuelve los tokens y el perfil
            console.log('✅ Autenticación exitosa:', data);

            // Aquí normalmente guardarías el token en localStorage o en un contexto global
            // localStorage.setItem('accessToken', data.access_token);

            alert('¡Sesión iniciada con éxito!');

            // Aquí podrías redirigir al usuario al dashboard
            // window.location.href = '/dashboard';

        } catch (error: any) {
            console.error('❌ Error al iniciar sesión:', error);
            setErrorMessage(error.message || 'Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-container-lowest min-h-screen flex flex-col relative text-on-surface">

            {/* TopAppBar */}
            <header className="bg-primary text-on-primary flex items-start px-4 h-[220px] w-full relative z-10 pt-4 pb-4">
                <div className="flex items-center w-full h-14">
                    <button aria-label="Volver" className="w-12 h-12 flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform">
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
                <div className="bg-surface border border-outline-variant rounded-xl p-6 pt-12 w-full max-w-md shadow-sm relative mt-8">

                    {/* Ícono Flotante */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-md">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            accessible_forward
                        </span>
                    </div>

                    <div className="flex flex-col items-center mb-6">
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface text-center mb-1">
                            Bienvenido de nuevo
                        </h2>
                        <p className="font-body-md text-body-md text-on-surface-variant text-center">
                            Inicia sesión para continuar
                        </p>
                    </div>

                    {/* Mensaje de Error (Se muestra solo si hay un error) */}
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg font-body-md text-sm border border-error/20">
                            {errorMessage}
                        </div>
                    )}

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                        {/* Email Field */}
                        <div className="relative">
                            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1" htmlFor="correo">
                                Correo electrónico
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-outline-variant pointer-events-none">mail</span>
                                <input
                                    className="w-full h-[52px] pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow disabled:opacity-50"
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
                        <div className="relative">
                            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1" htmlFor="contrasena">
                                Contraseña
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-outline-variant pointer-events-none">lock</span>
                                <input
                                    className="w-full h-[52px] pl-10 pr-12 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow disabled:opacity-50"
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
                                    className="absolute right-2 w-10 h-10 flex items-center justify-center text-outline-variant hover:text-on-surface focus:outline-none rounded-full disabled:opacity-50"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <a className="font-label-md text-label-md text-primary hover:underline h-min touch-target-min flex items-center justify-end" href="#">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full h-[52px] bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <div className="h-px bg-outline-variant flex-grow"></div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">o</span>
                        <div className="h-px bg-outline-variant flex-grow"></div>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg flex items-center justify-center gap-3 hover:bg-surface-variant/20 active:scale-95 transition-all disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <img alt="Google Logo" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwTHP44lV2JPmDHwhf2rWFo-1RjOC6yAWc--YXHRNDQ-Dq0iijnoSHU_8W8cQJrcwhVIbzepiMNSme2kaOC4do84urqwUcjzMScNjb-Rcgi-By09IJZoeqxE8kGChDXlgBN7Jd5jbIByMJwpgdYFqinIuEVmeELwCurdfdaDEeozHqQ4j8OaIhY6AH16zVT8JgShNFjA424jfLIeLCBalddw8CqudSLRMwltDLZcIqnALbPHlA74lvILb-zioET04IefCGt6PZFZ4" />
                        Continuar con Google
                    </button>
                </div>

                {/* Register Link */}
                <div className="mt-8 text-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">¿No tienes cuenta?</span>
                    <a className="font-label-md text-label-md text-primary hover:underline ml-1 touch-target-min inline-flex items-center justify-center" href="#">
                        Regístrate
                    </a>
                </div>
            </main>
        </div>
    );
};

export default LoginScreen;