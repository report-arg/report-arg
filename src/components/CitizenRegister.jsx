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

export default function CitizenRegisterPage() {
  const [step, setStep] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(citizenRegisterSchema),
    mode: 'onTouched',
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

  const onNextStep = async () => {
    // Validate Step 2 fields
    const isStepValid = await trigger(['nombre', 'apellido', 'email', 'password', 'confirmPassword']);
    if (isStepValid) {
      setStep(3);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Citizen register payload:', data);
      toast.info('Te enviamos un código para verificar tu correo.');
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
      <StepIndicator currentStep={step} />

      <div className="login-form-header text-center">
        <h2 className="login-form-title">Crear cuenta ciudadana</h2>
        <p className="login-form-subtitle">
          {step === 2 ? 'Ingresa tus datos personales.' : '¿Dónde resides actualmente?'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

        {step === 3 && (
          <CitizenLocationStep
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            setStep={setStep}
          />
        )}
      </form>
    </AuthSplitLayout>
  );
}