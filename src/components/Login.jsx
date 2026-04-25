'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/20/solid';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo.png" alt="logo-reportarg" className="login-logo-img" />
        <div className="login-left-content">
          <h1 className="login-title">
            Impulsando la<br />Gestión Ciudadana
          </h1>
          <p className="login-description">
            Una plataforma moderna para comunidades conectadas. 
            Transparencia, eficiencia y participación en un solo lugar.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form">
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            <p className="login-logo-mobile-subtitle">Tu conexión con la comunidad</p>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Iniciar sesión</h2>
            <p className="login-form-subtitle">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO</label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="form-input-icon">
                  <EnvelopeIcon aria-hidden />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">CONTRASEÑA</label>
              <div className="form-input-wrapper">
                <div className="form-input-icon form-input-icon-left">
                  <LockClosedIcon aria-hidden />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input has-left-icon"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                </button>
              </div>
              <Link href="/reset-password" className="form-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="btn-primary">
              Ingresar
            </button>
          </form>

          <div className="login-divider">O continuar con</div>

          <div className="social-buttons">
            <button className="btn-social">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="btn-social">
              <svg viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
