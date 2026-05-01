'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { hasValidationErrors, validateCitizenRegister } from '@/utils/schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  provincia: '',
  ciudad: '',
  zona: '',
  acceptTerms: false,
};

export default function CitizenRegister() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[name];

      if (name === 'password' || name === 'confirmPassword') {
        delete nextErrors.password;
        delete nextErrors.confirmPassword;
      }

      return nextErrors;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateCitizenRegister(formData);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/register-citizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar ciudadano');
      }

      router.push(`/verify?email=${encodeURIComponent(formData.email)}&type=citizen`);
    } catch (error) {
      setServerError(error.message || 'Ocurrió un error al registrar ciudadano');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo.png" alt="logo-reportarg" className="login-logo-img" />
        <div className="login-left-content">
          <h1 className="login-title">
            Construyendo una
            <br />
            comunidad más
            <br />
            segura.
          </h1>
          <p className="login-description">
            Registrate como ciudadano para reportar incidentes y dar seguimiento a tus alertas.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            <p className="login-logo-mobile-subtitle">Registro ciudadano</p>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Crear cuenta ciudadana</h2>
            <p className="login-form-subtitle">Completa tus datos personales y ubicación.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">NOMBRE</label>
                <div className="form-input-wrapper">
                  <input type="text" id="nombre" className="form-input" placeholder="Ej. Ana" value={formData.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.nombre && <p className="register-error">{errors.nombre}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="apellido">APELLIDO</label>
                <div className="form-input-wrapper">
                  <input type="text" id="apellido" className="form-input" placeholder="Ej. García" value={formData.apellido} onChange={(e) => handleChange('apellido', e.target.value)} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.apellido && <p className="register-error">{errors.apellido}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO</label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="ejemplo@correo.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                <div className="form-input-icon"><EnvelopeIcon aria-hidden /></div>
              </div>
              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="password">CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" className="form-input has-left-icon" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.password && <p className="register-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-input has-left-icon" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="register-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="provincia">PROVINCIA</label>
                <div className="form-input-wrapper">
                  <input type="text" id="provincia" className="form-input" placeholder="Buenos Aires" value={formData.provincia} onChange={(e) => handleChange('provincia', e.target.value)} />
                  <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
                </div>
                {errors.provincia && <p className="register-error">{errors.provincia}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">CIUDAD</label>
                <div className="form-input-wrapper">
                  <input type="text" id="ciudad" className="form-input" placeholder="La Plata" value={formData.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} />
                  <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
                </div>
                {errors.ciudad && <p className="register-error">{errors.ciudad}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="zona">ZONA</label>
              <div className="form-input-wrapper">
                <input type="text" id="zona" className="form-input" placeholder="Centro" value={formData.zona} onChange={(e) => handleChange('zona', e.target.value)} />
                <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
              </div>
              {errors.zona && <p className="register-error">{errors.zona}</p>}
            </div>

            <label className="register-checkbox">
              <input type="checkbox" checked={formData.acceptTerms} onChange={(e) => handleChange('acceptTerms', e.target.checked)} />
              <span>Acepto los términos y condiciones</span>
            </label>
            {errors.acceptTerms && <p className="register-error">{errors.acceptTerms}</p>}

            {serverError && <p className="register-error">{serverError}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>

            <p className="login-footer">
              ¿Representás una organización? <Link href="/register/institution">Registrate como institución</Link>
            </p>
            <p className="login-footer">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}