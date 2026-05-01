'use client';
import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

/**
 * Componente para la verificación de correo electrónico vía OTP (One-Time Password).
 * Maneja tanto ciudadanos como instituciones basándose en parámetros de URL.
 */
function VerifyEmailForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'tu correo';
  const type = searchParams.get('type');
  const inputsRef = useRef([]);

  /**
   * Maneja el salto automático entre las casillas de OTP al escribir.
   */
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  /**
   * Maneja la tecla Retroceso (Backspace).
   * Si la casilla actual está vacía, devuelve el foco a la casilla anterior.
   */
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  /**
   * Envía el código OTP para ser validado.
   * Dependiendo del typeParam, redirige o muestra un mensaje de "revisión administrativa".
   */
  const onSubmit = async (e) => {
    e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length < 6) {
      toast.error('Ingresa los 6 dígitos completos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyEmail(finalCode, email);
      if (type === 'institution') {
        toast.success('¡Correo verificado! Tu solicitud fue enviada para revisión administrativa.', { duration: 5000 });
      } else {
        toast.success('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      }
      router.push('/login');
    } catch (error) {
      toast.error('El código es incorrecto. Intenta con 123456.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    toast.promise(authService.resendVerificationCode(email), {
      loading: 'Reenviando código...',
      success: 'Nuevo código enviado',
      error: 'Error al reenviar',
    });
  };

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
      mobileSubtitle="Verificación de cuenta"
      formClassName="login-form login-form-register"
    >
      <div className="login-form-header text-center">
        <h2 className="login-form-title">Código de verificación</h2>
        <p className="login-form-subtitle mt-2">
          Enviamos un código de 6 dígitos a <br />
          <span className="font-semibold text-[rgb(var(--azul))]">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="flex justify-center gap-2 sm:gap-4 my-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[rgb(var(--azul))] focus:ring-2 focus:ring-[rgba(var(--azul),0.2)] focus:outline-none transition-all bg-white text-gray-900"
            />
          ))}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verificando...' : 'Verificar correo y registrarme'}
        </button>

        <div className="text-center mt-6 text-sm text-gray-600">
          ¿No recibiste el código?{' '}
          <button type="button" onClick={handleResend} className="text-[rgb(var(--azul))] font-semibold hover:underline">
            Reenviar código
          </button>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
