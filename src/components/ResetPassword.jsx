'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/20/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Ocurrió un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo restablecer la contraseña');
      }

      setChanged(true);
    } catch (resetError) {
      setError(resetError.message || 'No se pudo restablecer la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (token && changed) {
    return (
      <div className="reset-container">
        <div className="reset-right" style={{ width: '100%' }}>
          <div className="reset-form">
            <div className="reset-success">
              <div className="reset-success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="reset-success-title">Contraseña actualizada</h2>
              <p className="reset-success-text">Ya podés iniciar sesión con tu nueva contraseña.</p>
              <Link href="/login" className="btn-primary">Ir al login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (token) {
    return (
      <div className="reset-container">
        <div className="reset-left">
          <img src="/logo.png" alt="logo-reportarg" className="reset-logo-img" />
          <div className="reset-left-content">
            <h1 className="reset-title">Construyendo una<br />comunidad más<br />segura.</h1>
            <p className="reset-description">Define el nivel institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.</p>
          </div>
        </div>

        <div className="reset-right">
          <div className="reset-form">
            <div className="reset-logo-mobile">
              <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            </div>

            <div className="reset-form-header">
              <h2 className="reset-form-title">Elegí una nueva contraseña</h2>
              <p className="reset-form-subtitle">Ingresá y confirmá tu nueva contraseña para recuperar el acceso.</p>
            </div>

            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">NUEVA CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type="password" id="password" className="form-input has-left-icon" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type="password" id="confirmPassword" className="form-input has-left-icon" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              {error && <p className="register-error">{error}</p>}

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="reset-container">
        <div className="reset-left">
          <img src="/logo.png" alt="logo-reportarg" className="reset-logo-img" />
          <div className="reset-left-content">
            <h1 className="reset-title">Construyendo una<br />comunidad más<br />segura.</h1>
            <p className="reset-description">Define el nivel institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.</p>
          </div>
        </div>

        <div className="reset-right">
          <div className="reset-form">
            <div className="reset-logo-mobile">
              <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            </div>

            <div className="reset-success">
              <div className="reset-success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="reset-success-title">Enlace enviado</h2>
              <p className="reset-success-text">Revisa tu casilla de correo. Te enviamos las instrucciones para restablecer tu acceso.</p>
              <button onClick={() => setSent(false)} className="btn-primary">Enviar nuevamente</button>
              <Link href="/login" className="reset-back">Volver al inicio de sesión</Link>
            </div>
          </div>
          <h2 className="reset-success-title">Enlace enviado</h2>
          <p className="reset-success-text">
            Revisa tu casilla de correo. Te enviamos las instrucciones para restablecer tu acceso.
          </p>
          <button onClick={() => setSent(false)} className="btn-primary">
            Enviar nuevamente
          </button>
          <Link href="/login" className="reset-back">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-left">
        <img src="/logo.png" alt="logo-reportarg" className="reset-logo-img" />
        <div className="reset-left-content">
          <h1 className="reset-title">Construyendo una<br />comunidad más<br />segura.</h1>
          <p className="reset-description">Define el nivel institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.</p>
        </div>
      </div>

      <div className="reset-right">
        <div className="reset-form">
          <div className="reset-logo-mobile">
            <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
          </div>

          <div className="reset-form-header">
            <h2 className="reset-form-title">Recuperar contraseña</h2>
            <p className="reset-form-subtitle">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
          </div>

          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL</label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <input type="email" id="email" className="form-input" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <Link href="/login" className="reset-back">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}
