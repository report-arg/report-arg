'use client';

import { useState } from 'react';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { institutionRegisterSchema } from '@/utils/schemas';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/ui/StepIndicator';
import InstitutionDataStep from '@/components/auth/InstitutionDataStep';
import InstitutionLocationStep from '@/components/auth/InstitutionLocationStep';

export default function InstitutionRegister() {
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
    resolver: zodResolver(institutionRegisterSchema),
    mode: 'onTouched',
    defaultValues: {
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
    },
  });

  const onNextStep = async () => {
    // Validate Step 2 fields
    const isStepValid = await trigger([
      'contactName', 'email', 'password', 'confirmPassword', 
      'institutionName', 'cuit', 'institutionType', 'phone'
    ]);
    if (isStepValid) {
      setStep(3);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        emailVerified: false,
        institutionStatus: 'pending',
      };
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('HU-03 payload:', payload);
      toast.info('Te enviamos un código para verificar el correo.');
      router.push(`/verify?email=${encodeURIComponent(data.email)}&type=institution`);
    } catch (error) {
      toast.error('Ocurrió un error en el registro');
    }
  };

  return (
    <AuthSplitLayout
      title={
        <>
          Gestiona trámites
          <br />
          para tu Institución
        </>
      }
      description="Plataforma avanzada para empresas, ONGs y entidades públicas."
      mobileSubtitle="Registro institucional"
      formClassName="login-form login-form-register"
    >
      <StepIndicator currentStep={step} />

      <div className="login-form-header text-center">
        <h2 className="login-form-title">Registro Institucional</h2>
        <p className="login-form-subtitle">
          {step === 2 ? 'Datos del responsable e institución.' : '¿Dónde está ubicada físicamente?'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 2 && (
          <InstitutionDataStep
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
          <InstitutionLocationStep
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
