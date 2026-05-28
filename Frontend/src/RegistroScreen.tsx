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

const RegistroScreen = () => {
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
            apellidos: `${formData.apellidoPa} ${formData.apellidoMa}`.trim(),
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

            const data = await response.json();

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
        <div className="min-h-screen bg-background flex flex-col font-body-md text-on-background overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
            {/* TopAppBar */}
            <header className="flex items-center px-4 h-14 w-full z-40 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container sticky top-0 flat">
                <button aria-label="Volver" className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition-transform active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
                </button>
                <h1 className="ml-2 font-app-title text-app-title text-on-primary truncate tracking-tight">Tijuana Sin Barreras</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-md mx-auto px-margin-mobile py-6 flex flex-col justify-center">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary"></div>
                    <div className="mb-6">
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">Crear cuenta</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Es gratis y toma 1 minuto</p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                        <div className="flex flex-col gap-4">
                            {/* Nombre(s) */}
                            <div className="flex flex-col gap-1">
                                <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="nombre">Nombre(s)</label>
                                <div className="relative flex items-center group">
                                    <span className="material-symbols-outlined absolute left-3 text-outline group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
                                        id="nombre"
                                        placeholder="Ej. María"
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-gutter">
                                {/* Apellido Paterno */}
                                <div className="flex-1 flex flex-col gap-1">
                                    <label className="font-label-sm text-label-sm text-on-surface-variant pl-1" htmlFor="apellidoPa">Ap. Paterno</label>
                                    <div className="relative flex items-center group">
                                        <input
                                            className="w-full min-h-[52px] px-4 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
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
                                            className="w-full min-h-[52px] px-4 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
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
                                    className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
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
                                    className="w-full min-h-[52px] pl-11 pr-12 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
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
                                    className="absolute right-3 w-10 h-10 flex items-center justify-center text-outline hover:text-on-surface transition-colors"
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
                                    className="w-full min-h-[52px] pl-11 pr-4 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md"
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
                                <input className="w-5 h-5 rounded border-outline text-primary focus:ring-primary focus:ring-2 bg-surface-container-lowest cursor-pointer" id="terms" type="checkbox" required />
                            </div>
                            <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer pt-0.5" htmlFor="terms">
                                Acepto los <a className="text-primary font-label-md text-label-md underline hover:text-primary-container transition-colors" href="#">términos y condiciones</a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button className="w-full min-h-[52px] mt-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all shadow-sm" type="submit">
                            Crear cuenta
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        ¿Ya tienes cuenta?
                        <a className="text-primary font-label-md text-label-md ml-1 hover:underline" href="#">Inicia sesión</a>
                    </p>
                </div>
            </main>

            {/* Floating Action Button (Accessibility) */}
            <button aria-label="Opciones de accesibilidad" className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-50 hover:bg-primary-container hover:scale-105 active:scale-95 transition-all group">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>accessible</span>
                <span className="absolute right-16 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Accesibilidad</span>
            </button>
        </div>
    );
};

export default RegistroScreen;