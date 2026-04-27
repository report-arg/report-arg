'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import {
  BuildingOffice2Icon,
  ChevronDownIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/20/solid';

const institutionTypes = [
  { key: 'municipio', label: 'Municipio' },
  { key: 'hospital', label: 'Hospital / Centro de salud' },
  { key: 'escuela', label: 'Escuela / Institución educativa' },
  { key: 'ong', label: 'ONG / Fundación' },
  { key: 'seguridad', label: 'Fuerza de seguridad' },
  { key: 'otra', label: 'Otra institución' },
];

const initialForm = {
  contactName: '',
  email: '',
  password: '',
  confirmPassword: '',
  institutionName: '',
  cuit: '',
  institutionType: '',
  phone: '',
  address: '',
  termsAccepted: false,
};

export default function InstitutionRegister() {
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      formData.contactName.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.institutionName.trim() &&
      formData.cuit.trim() &&
      formData.institutionType &&
      formData.phone.trim() &&
      formData.address.trim() &&
      formData.termsAccepted
    );
  }, [formData]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const payload = {
      contactName: formData.contactName,
      email: formData.email,
      institutionName: formData.institutionName,
      cuit: formData.cuit,
      institutionType: formData.institutionType,
      phone: formData.phone,
      address: formData.address,
      emailVerified: false,
      institutionStatus: 'pending',
    };

    console.log('HU-03 payload:', payload);
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
        mobileSubtitle="Registro institucional"
        formClassName="login-form register-success-box"
      >
        <div className="login-form-header">
          <h2 className="login-form-title">Solicitud enviada</h2>
          <p className="login-form-subtitle">
            Tu institucion quedó registrada en estado pendiente de validacion.
          </p>
        </div>

        <p className="register-success-text">
          Te avisaremos por correo cuando el equipo administrador revise la información.
        </p>

        <button type="button" className="btn-primary" onClick={() => setSubmitted(false)}>
          Crear otra solicitud
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
      mobileSubtitle="Registro institucional"
      formClassName="login-form login-form-register"
    >
      <div className="register-form-brand" aria-hidden>
        <div className="register-form-brand-badge">
          <BuildingOffice2Icon className="register-form-brand-icon" />
        </div>
      </div>

      <div className="login-form-header">
        <h2 className="login-form-title">Crear cuenta institucional</h2>
        <p className="login-form-subtitle">Datos del responsable y datos formales de la institución.</p>
      </div>

      <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">
                NOMBRE COMPLETO DEL RESPONSABLE
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  className="form-input"
                  placeholder="Ej. Juan Perez"
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  required
                />
                <div className="form-input-icon">
                  <UserIcon aria-hidden />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                CORREO ELECTRÓNICO INSTITUCIONAL
              </label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="institucion@dominio.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                <div className="form-input-icon">
                  <EnvelopeIcon aria-hidden />
                </div>
              </div>
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
                    aria-label={
                      showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon aria-hidden />
                    ) : (
                      <EyeIcon aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="institutionName">
                NOMBRE O RAZÓN SOCIAL
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  id="institutionName"
                  name="institutionName"
                  className="form-input"
                  placeholder="Ej. Hospital Municipal San Martin"
                  value={formData.institutionName}
                  onChange={(e) => handleChange('institutionName', e.target.value)}
                  required
                />
                <div className="form-input-icon">
                  <BuildingOffice2Icon aria-hidden />
                </div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="cuit">
                  CUIT
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    id="cuit"
                    name="cuit"
                    className="form-input"
                    placeholder="30-12345678-9"
                    value={formData.cuit}
                    onChange={(e) => handleChange('cuit', e.target.value)}
                    required
                  />
                  <div className="form-input-icon">
                    <IdentificationIcon aria-hidden />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="institutionType">
                  TIPO DE INSTITUCIÓN
                </label>
                <div className="form-input-wrapper">
                  <select
                    id="institutionType"
                    name="institutionType"
                    className="form-input register-select"
                    value={formData.institutionType}
                    onChange={(e) => handleChange('institutionType', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {institutionTypes.map((type) => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-input-icon register-select-icon">
                    <ChevronDownIcon aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  TELEFONO DE CONTACTO INSTITUCIONAL
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="Ej. +54 11 4444-5555"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                  <div className="form-input-icon">
                    <PhoneIcon aria-hidden />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  DIRECCIÓN
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-input"
                    placeholder="Calle 123, Ciudad"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                  />
                  <div className="form-input-icon">
                    <MapPinIcon aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group register-checkbox">
              <label className="register-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                  required
                />
                <span>Acepto los términos de servicio y la política de privacidad.</span>
              </label>
            </div>

            {error ? <p className="register-error">{error}</p> : null}

            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              Registrar institución
            </button>

            <p className="login-footer">
              ¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
            </p>
      </form>
    </AuthSplitLayout>
  );
}
