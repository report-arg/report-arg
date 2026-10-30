'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [ciudadActiva, setCiudadActiva] = useState('1');
  const [ciudadDeclarada, setCiudadDeclarada] = useState('');
  const [provinciaDeclarada, setProvinciaDeclarada] = useState('');
  const [verificadoCiudadInactiva, setVerificadoCiudadInactiva] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setType(params.get('type') || '');
    setCiudadActiva(params.get('ciudadActiva') ?? '1');
    setCiudadDeclarada(params.get('ciudad') || '');
    setProvinciaDeclarada(params.get('provincia') || '');
  }, []);

  const handleChange = (event, index) => {
    const value = event.target.value;
    if (/[^0-9]/.test(value)) return;

    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const finalCode = code.join('');
    if (finalCode.length < 6) {
      setError('Ingresa los 6 dígitos completos.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.verifyEmail(email, finalCode);

      if (type === 'citizen' && ciudadActiva === '0') {
        toast.success('¡Cuenta verificada! Tu ciudad de residencia aún no se encuentra activa.');
        setVerificadoCiudadInactiva(true);
        return;
      }

      toast.success('¡Cuenta verificada! Ya podés iniciar sesión.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (submitError) {
      setError(submitError.response?.data?.error || submitError.message || 'El código ingresado no es válido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');

    try {
      await authService.resendVerificationCode(email);
    } catch (resendError) {
      setError(resendError.response?.data?.error || resendError.message || 'No se pudo reenviar el código');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <Image src="/logo.png" alt="logo-reportarg" className="login-logo-img" width={250} height={60} unoptimized />
        <div className="login-left-content">
          <h1 className="login-title">Construyendo una<br />comunidad más<br />segura.</h1>
          <p className="login-description">Únete al portal institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <Image src="/logo.png" alt="ReportARG" className="login-logo-mobile-img" width={180} height={40} unoptimized />
            <p className="login-logo-mobile-subtitle">Verificación de cuenta</p>
          </div>

          <div className="login-form-header text-center">
            <h2 className="login-form-title">Código de verificación</h2>
            <p className="login-form-subtitle">Enviamos un código de 6 dígitos a <strong>{email || 'tu correo'}</strong></p>
            {type === 'institution' && <p className="login-form-subtitle">Completa la verificación para continuar con el alta institucional.</p>}
          </div>

          {verificadoCiudadInactiva ? (
            <div className="space-y-4 text-left p-5 rounded-2xl border border-amber-200 bg-amber-50/70">
              <h3 className="text-base font-bold text-slate-900">
                Estado de tu ciudad de residencia: {ciudadDeclarada || 'Localidad declarada'}
                {provinciaDeclarada ? `, ${provinciaDeclarada}` : ''}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Tu correo fue verificado y tu ciudad de residencia quedó asociada a tu perfil, pero actualmente no se encuentra activa en ReportARG. Podés solicitar la activación de tu localidad o iniciar sesión para continuar como visitante seleccionando otra ciudad activa.
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <Button
                  href={`/solicitud-activacion?ciudad=${encodeURIComponent(ciudadDeclarada)}&provincia=${encodeURIComponent(provinciaDeclarada)}`}
                  variant="primary"
                  size="md"
                >
                  Solicitar activación de mi ciudad
                </Button>
                <Button
                  href="/login"
                  variant="outline"
                  size="md"
                >
                  Continuar como visitante (Iniciar sesión)
                </Button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '32px 0' }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputsRef.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 600,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    outline: 'none',
                    color: 'rgb(var(--azul))',
                  }}
                />
              ))}
            </div>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Verificar correo y registrarme'}
            </button>

            <div className="text-center mt-6 text-sm text-gray-600" style={{ marginTop: 20, textAlign: 'center' }}>
              ¿No recibiste el código?{' '}
              <button type="button" onClick={handleResend} className="form-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Reenviar código
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
