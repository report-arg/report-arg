//archivo: ResetPassword.jsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password:', email);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthSplitLayout
        title={
          <>
            Impulsando la
            <br />
            Gestión Ciudadana
          </>
        }
        description="Una plataforma moderna para comunidades conectadas. Transparencia, eficiencia y participación en un solo lugar."
        mobileSubtitle="Recuperar contraseña"
        formClassName="reset-form"
      >
        <div className="reset-success">
          <div className="reset-success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
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
    <AuthSplitLayout
      title={
        <>
          Impulsando la
          <br />
          Gestión Ciudadana
        </>
      }
      description="Una plataforma moderna para comunidades conectadas. Transparencia, eficiencia y participación en un solo lugar."
      mobileSubtitle="Recuperar contraseña"
      formClassName="reset-form"
    >
      <div className="reset-form-header">
        <h2 className="reset-form-title">Recuperar contraseña</h2>
        <p className="reset-form-subtitle">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            EMAIL
          </label>
          <div className="form-input-wrapper">
            <div className="form-input-icon">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Enviar enlace
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px' }}>
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>

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
    </AuthSplitLayout>
  );
}
