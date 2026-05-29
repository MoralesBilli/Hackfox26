import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

// 1. Definimos la interfaz (el "molde") de nuestros datos
interface FormData {
    nombre: string;
    apellidoPa: string;
    apellidoMa: string;
    correo: string;
    contrasena: string;
    confirmarContrasena: string;
}

const RegistroScreen = ({ onNavigate }: any) => {
    // 2. Le decimos a useState que use nuestra interfaz FormData
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        apellidoPa: '',
        apellidoMa: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: ''
    });

    // Tipamos el estado del boolean
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // 3. Tipamos el evento de cambio (ChangeEvent) para un Input HTML
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // 4. Tipamos el evento de envío (FormEvent) para un Formulario HTML
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.contrasena !== formData.confirmarContrasena) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const datosParaEnviar = {
            nombre: formData.nombre,
            apellidoPa: formData.apellidoPa,
            apellidoMa: formData.apellidoMa,
            correo: formData.correo,
            contrasena: formData.contrasena
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

        try {
            const response = await fetch(`${apiUrl}/creacion_usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosParaEnviar),
            });

            let data: any = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            if (response.ok) {
                alert(`¡Usuario creado exitosamente!`);
                setFormData({
                    nombre: '',
                    apellidoPa: '',
                    apellidoMa: '',
                    correo: '',
                    contrasena: '',
                    confirmarContrasena: ''
                });
            } else {
                alert(`Error: ${data.error || 'No se pudo crear el usuario'}`);
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
            alert("Error de red: No se pudo conectar con el backend.");
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-hidden antialiased">
            
            {/* Círculos difuminados decorativos de fondo (Glow blobs) - Coherentes con Onboarding/Login */}
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

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center px-margin-mobile -mt-[100px] relative z-20 pb-24 w-full max-w-[1024px] mx-auto">
                
                {/* Form Card */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-outline-variant/45 relative overflow-hidden w-full max-w-md mt-8">
                    
                    {/* Línea de color superior gradiente */}
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary via-secondary to-primary-fixed-dim"></div>
                    
                    <div className="mb-6">
                        <h2 className="text-[22px] md:text-[24px] font-black text-on-surface mb-1">Crear cuenta</h2>
                        <p className="font-body-md text-sm text-on-surface-variant">Es gratis y toma 1 minuto</p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                        <div className="flex flex-col gap-4">
                            {/* Nombre(s) */}
                            <div className="flex flex-col gap-1">
                                <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="nombre">Nombre(s)</label>
                                <div className="relative flex items-center group">
                                    <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                        id="nombre"
                                        placeholder="Ej. María"
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Apellidos en 2 columnas con gap-4 */}
                            <div className="flex gap-4">
                                {/* Apellido Paterno */}
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="apellidoPa">Ap. Paterno</label>
                                    <div className="relative flex items-center group">
                                        <input
                                            className="w-full min-h-[52px] px-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                            id="apellidoPa"
                                            placeholder="Ej. López"
                                            type="text"
                                            required
                                            value={formData.apellidoPa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Apellido Materno */}
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="apellidoMa">Ap. Materno</label>
                                    <div className="relative flex items-center group">
                                        <input
                                            className="w-full min-h-[52px] px-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                            id="apellidoMa"
                                            placeholder="Ej. Pérez"
                                            type="text"
                                            required
                                            value={formData.apellidoMa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input: Correo electrónico */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="correo">Correo electrónico</label>
                            <div className="relative flex items-center group">
                                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                    id="correo"
                                    placeholder="correo@ejemplo.com"
                                    type="email"
                                    required
                                    value={formData.correo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Input: Contraseña */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="contrasena">Contraseña</label>
                            <div className="relative flex items-center group">
                                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    className="w-full min-h-[52px] pl-11 pr-12 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                    id="contrasena"
                                    placeholder="Mínimo 8 caracteres"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                />
                                <button
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    className="absolute right-3 w-10 h-10 flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-variant/20 transition-all rounded-full cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Input: Confirmar contraseña */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="confirmarContrasena">Confirmar contraseña</label>
                            <div className="relative flex items-center group">
                                <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-body-md"
                                    id="confirmarContrasena"
                                    placeholder="Repite tu contraseña"
                                    type="password"
                                    required
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 mt-2">
                            <div className="flex items-center h-6">
                                <input 
                                    className="w-5 h-5 rounded-md border-outline-variant/60 text-primary focus:ring-primary/20 bg-surface-container-lowest cursor-pointer transition-colors duration-200" 
                                    id="terms" 
                                    type="checkbox" 
                                    required 
                                />
                            </div>
                            <label className="font-body-md text-sm text-on-surface-variant cursor-pointer pt-0.5" htmlFor="terms">
                                Acepto los <a className="text-primary font-bold underline hover:text-primary/80 transition-colors" href="#">términos y condiciones</a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            className="w-full min-h-[54px] mt-4 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_8px_24px_rgba(102,0,0,0.25)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer" 
                            type="submit"
                        >
                            Crear cuenta
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <p className="font-body-md text-sm text-on-surface-variant">
                        ¿Ya tienes cuenta?
                        <a onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="text-primary font-bold ml-1.5 hover:underline cursor-pointer" href="#">Inicia sesión</a>
                    </p>
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

export default RegistroScreen;