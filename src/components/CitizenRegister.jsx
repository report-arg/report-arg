'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/20/solid';
import { validateRegistration } from '@/utils/validations';

export default function CitizenRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log('Citizen register payload:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthSplitLayout
        title={
          <>
            Construyendo una
            <br />
            comunidad más
            <br />
            segura.
          </>
        }
        description="Únete al portal institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano."
        mobileSubtitle="Registro ciudadano"
        formClassName="login-form register-success-box"
      >
        <div className="login-form-header">
          <h2 className="login-form-title">Cuenta creada</h2>
          <p className="login-form-subtitle">Tu registro ciudadano se completó correctamente.</p>
        </div>

        <p className="register-success-text">Ya puedes iniciar sesión y comenzar a usar la plataforma.</p>

        <button type="button" className="btn-primary" onClick={() => setSubmitted(false)}>
          Crear otra cuenta
        </button>

        <Link href="/login" className="form-link">
          Ir a iniciar sesión
        </Link>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title={
        <>
          Construyendo una
          <br />
          comunidad más
          <br />
          segura.
        </>
      }
      description="Únete al portal institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano."
      mobileSubtitle="Registro ciudadano"
      formClassName="login-form login-form-register"
    >
      <div className="register-form-brand" aria-hidden>
        <div className="register-form-brand-badge">
          <UserIcon className="register-form-brand-icon" />
        </div>
      </div>

      <div className="login-form-header">
        <h2 className="login-form-title">Crear cuenta ciudadana</h2>
        <p className="login-form-subtitle">Ingresa tus datos para acceder al portal oficial.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            NOMBRE COMPLETO
          </label>
          <div className="form-input-wrapper">
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="form-input"
              placeholder="Ej. Juan Perez"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
            <div className="form-input-icon">
              <UserIcon aria-hidden />
            </div>
          </div>
          {errors.fullName ? <p className="register-error">{errors.fullName}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            CORREO ELECTRÓNICO
          </label>
          <div className="form-input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="nombre@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <div className="form-input-icon">
              <EnvelopeIcon aria-hidden />
            </div>
          </div>
          {errors.email ? <p className="register-error">{errors.email}</p> : null}
        </div>

        <div className="register-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              CONTRASEÑA
            </label>
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
                onChange={(e) => handleChange('password', e.target.value)}
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
            {errors.password ? <p className="register-error">{errors.password}</p> : null}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              CONFIRMAR CONTRASEÑA
            </label>
            <div className="form-input-wrapper">
              <div className="form-input-icon form-input-icon-left">
                <LockClosedIcon aria-hidden />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input has-left-icon"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
              </button>
            </div>
            {errors.confirmPassword ? <p className="register-error">{errors.confirmPassword}</p> : null}
          </div>
        </div>

        <div className="form-group register-checkbox">
          <label className="register-checkbox-label">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
            />
            <span>Acepto los términos de servicio y la política de privacidad.</span>
          </label>
          {errors.acceptTerms ? <p className="register-error">{errors.acceptTerms}</p> : null}
        </div>

        <button type="submit" className="btn-primary">
          Registrar cuenta
        </button>

        <p className="login-footer">
          ¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}