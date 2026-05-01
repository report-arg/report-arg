'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  provincia: '',
  ciudad: '',
  zona: '',
  address: '',
  termsAccepted: false,
};

export default function InstitutionRegister() {
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/register-institution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error en el registro');
      }

      router.push(`/verify?email=${encodeURIComponent(formData.email)}&type=institution`);
    } catch (submitError) {
      setError(submitError.message || 'Ocurrió un error en el registro');
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
            Únete al portal institucional para la gestión y reporte inteligente de incidentes.
            Tecnología al servicio del ciudadano.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            <p className="login-logo-mobile-subtitle">Registro institucional</p>
          </div>

          <div className="register-form-brand" aria-hidden>
            <div className="register-form-brand-badge">
              <BuildingOffice2Icon className="register-form-brand-icon" />
            </div>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Crear cuenta institucional</h2>
            <p className="login-form-subtitle">
              Datos del responsable y datos formales de la institución.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">NOMBRE COMPLETO DEL RESPONSABLE</label>
              <div className="form-input-wrapper">
                <input type="text" id="contactName" className="form-input" placeholder="Ej. Juan Perez" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} required />
                <div className="form-input-icon"><UserIcon aria-hidden /></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO INSTITUCIONAL</label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="institucion@dominio.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                <div className="form-input-icon"><EnvelopeIcon aria-hidden /></div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="password">CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" className="form-input has-left-icon" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-input has-left-icon" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="institutionName">NOMBRE O RAZÓN SOCIAL</label>
              <div className="form-input-wrapper">
                <input type="text" id="institutionName" className="form-input" placeholder="Ej. Hospital Municipal San Martin" value={formData.institutionName} onChange={(e) => handleChange('institutionName', e.target.value)} required />
                <div className="form-input-icon"><BuildingOffice2Icon aria-hidden /></div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="cuit">CUIT</label>
                <div className="form-input-wrapper">
                  <input type="text" id="cuit" className="form-input" placeholder="30-12345678-9" value={formData.cuit} onChange={(e) => handleChange('cuit', e.target.value)} required />
                  <div className="form-input-icon"><IdentificationIcon aria-hidden /></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="institutionType">TIPO DE INSTITUCIÓN</label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select id="institutionType" className="form-input form-select" value={formData.institutionType} onChange={(e) => handleChange('institutionType', e.target.value)} required>
                    <option value="">Selecciona una opción</option>
                    {institutionTypes.map((type) => (
                      <option key={type.key} value={type.key}>{type.label}</option>
                    ))}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">TELÉFONO DE CONTACTO</label>
                <div className="form-input-wrapper">
                  <input type="text" id="phone" className="form-input" placeholder="221 555 1234" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
                  <div className="form-input-icon"><PhoneIcon aria-hidden /></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">DIRECCIÓN</label>
                <div className="form-input-wrapper">
                  <input type="text" id="address" className="form-input" placeholder="Calle 123, número, barrio" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} required />
                  <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
                </div>
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="provincia">PROVINCIA</label>
                <input type="text" id="provincia" className="form-input" placeholder="Buenos Aires" value={formData.provincia} onChange={(e) => handleChange('provincia', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">CIUDAD</label>
                <input type="text" id="ciudad" className="form-input" placeholder="La Plata" value={formData.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="zona">ZONA</label>
              <input type="text" id="zona" className="form-input" placeholder="Centro" value={formData.zona} onChange={(e) => handleChange('zona', e.target.value)} required />
            </div>

            <label className="register-checkbox">
              <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => handleChange('termsAccepted', e.target.checked)} />
              <span>Acepto los términos y condiciones</span>
            </label>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>

            <p className="login-footer">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
