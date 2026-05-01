'use client';
import { useState } from 'react';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { citizenRegisterSchema } from '@/utils/schemas';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/ui/StepIndicator';
import CitizenDataStep from '@/components/auth/CitizenDataStep';
import CitizenLocationStep from '@/components/auth/CitizenLocationStep';

/**
 * Componente principal para el registro de ciudadanos.
 * Funciona como un "Controlador" de un asistente de múltiples pasos (Wizard).
 * Maneja el estado global del formulario y la lógica de envío, 
 * mientras delega la UI a los sub-componentes (CitizenDataStep y CitizenLocationStep).
 */
export default function CitizenRegisterPage() {
  // Estado para controlar en qué paso del Wizard nos encontramos (Inicia en 2 porque el paso 1 es la selección de cuenta)
  const [step, setStep] = useState(2);
  
  // Estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  // Configuración de react-hook-form con validación estricta usando Zod
  const {
    register,
    handleSubmit,
    trigger, // Utilizado para validar un paso específico antes de avanzar
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(citizenRegisterSchema),
    mode: 'onTouched', // Valida los campos cuando el usuario hace focus out
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      provincia: '',
      ciudad: '',
      zona: '',
      acceptTerms: false,
    },
  });

  /**
   * Valida asíncronamente los campos del paso actual (Datos Personales).
   * Si son válidos, permite al usuario avanzar al paso 3 (Ubicación).
   */
  const onNextStep = async () => {
    const isStepValid = await trigger(['nombre', 'apellido', 'email', 'password', 'confirmPassword']);
    if (isStepValid) {
      setStep(3);
    }
  };

  /**
   * Manejador final del formulario. Se ejecuta solo cuando todos los pasos son válidos.
   * Redirige silenciosamente a la pantalla de verificación de email.
   */
  const onSubmit = async (data) => {
    try {
      // Simulación temporal de la llamada a la API (TODO: Conectar con el backend real)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Citizen register payload:', data);
      
      // Feedback neutral: No confirmamos registro hasta verificar el email
      toast.info('Te enviamos un código para verificar tu correo.');
      
      // Redirección pasando el email como query parameter
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast.error('Ocurrió un error en el registro');
    }
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
      mobileSubtitle="Registro ciudadano"
      formClassName="login-form login-form-register"
    >
      {/* Componente visual que muestra la barra de progreso (1 -> 2 -> 3) */}
      <StepIndicator currentStep={step} />

      <div className="login-form-header text-center">
        <h2 className="login-form-title">Crear cuenta ciudadana</h2>
        <p className="login-form-subtitle">
          {step === 2 ? 'Ingresa tus datos personales.' : '¿Dónde resides actualmente?'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Paso 2: Datos Personales */}
        {step === 2 && (
          <CitizenDataStep
            register={register}
            errors={errors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onNextStep={onNextStep}
          />
        )}

        {/* Paso 3: Datos de Ubicación (Geolocalización) */}
        {step === 3 && (
          <CitizenLocationStep
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            setStep={setStep} // Permite volver al paso anterior
          />
        )}
      </form>
    </AuthSplitLayout>
  );
}