'use client';

import { useState } from 'react';
import { validateRegistration } from '@/utils/validations';
import PasswordVisibilityIcon from '@/components/ui/PasswordVisibilityIcon';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M12 21c2.5 0 4.5-.8 6-2.1l-3.1-2.4c-.9.6-2 .9-2.9.9-2.3 0-4.2-1.5-4.9-3.6H3.9v2.5C5.4 19.2 8.4 21 12 21z" />
      <path fill="#4A90E2" d="M7.1 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.7H3.9C3.3 8.9 3 10.4 3 12s.3 3.1.9 4.3l3.2-2.5z" />
      <path fill="#FBBC05" d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C16.5 3.8 14.5 3 12 3 8.4 3 5.4 4.8 3.9 7.7l3.2 2.5c.7-2.1 2.6-3.6 4.9-3.6z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.3 8.7h1.9V6.1c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H6v2.9h2.6V21h3.2v-5.6h2.5l.4-2.9h-2.9v-2c0-.8.2-1.8 1.5-1.8z"
      />
    </svg>
  );
}

export default function CitizenRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // TODO: llamar a la API de registro
    console.log('Enviando datos:', formData);
  };

  return (
    <div className="w-full max-w-md">
      {/* Ícono y título */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow-[0_8px_20px_rgba(30,58,138,0.12)]">
          <span className="text-2xl" aria-hidden="true">👤</span>
        </div>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--azul))]">
          <span aria-hidden="true">📍</span>
          Registro ciudadano
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">Ingresá tus datos para acceder al portal oficial</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nombre completo */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Ej. Juan Pérez"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors
              ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-[rgb(var(--azul))]'}`}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            placeholder="nombre@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors
              ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-[rgb(var(--azul))]'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors pr-10
                ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-[rgb(var(--azul))]'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors pr-10
                ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-[rgb(var(--azul))]'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
            >
              <PasswordVisibilityIcon visible={showConfirmPassword} />
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Términos */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="acceptTerms"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="mt-0.5 accent-[rgb(var(--azul))]"
          />
          <label htmlFor="acceptTerms" className="text-xs text-gray-500 leading-snug">
            Al registrarme, acepto los{' '}
            <a href="#" className="text-[rgb(var(--azul))] underline">Términos de Servicio</a> y la{' '}
            <a href="#" className="text-[rgb(var(--azul))] underline">Política de Privacidad</a>.
          </label>
        </div>
        {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms}</p>}

        {/* Botón principal */}
        <button
          type="submit"
          className="auth-primary-button mt-2 enabled:cursor-pointer"
        >
          Registrarse →
        </button>
      </form>

      {/* Separador */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">O CONTINUÁ CON</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Botones sociales */}
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-[#d6deef] rounded-xl bg-white text-[#25324a] text-sm font-medium cursor-pointer hover:border-[#b8c7e6] hover:bg-[#f7f9ff] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,50,74,0.12)] transition-all duration-200"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-[#d6deef] rounded-xl bg-white text-[#25324a] text-sm font-medium cursor-pointer hover:border-[#b8c7e6] hover:bg-[#f7f9ff] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,50,74,0.12)] transition-all duration-200"
        >
          <FacebookIcon />
          Facebook
        </button>
      </div>

      {/* Link a login */}
      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tenés cuenta?{' '}
        <a href="/login" className="font-semibold text-[rgb(var(--azul))] hover:underline">Iniciar sesión</a>
      </p>
    </div>
  );
}