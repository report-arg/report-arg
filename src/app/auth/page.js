'use client';

import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/ui/BrandLogo';
import AccountTypeSelector from '@/components/auth/AccountTypeSelector';

// Tipos de cuenta disponibles para el usuario.
const accountTypes = [
  {
    id: 'citizen',
    label: 'Ciudadano',
    description: 'Accede a servicios municipales, realiza reportes y mantenete informado sobre tu barrio.',
    icon: '👤',
  },
  {
    id: 'institution',
    label: 'Institución',
    description: 'Gestiona tramites para tu empresa, ONG o entidad publica con herramientas avanzadas.',
    icon: '🏢',
  },
];

// Página de selección de tipo de cuenta.
export default function AccountTypePage() {
  const router = useRouter();

  const handleContinue = (selectedType) => {
    if (selectedType === 'citizen') router.push('/register/citizen');
    if (selectedType === 'institution') router.push('/register/institution');
  };

  return (
    <div className="auth-page min-h-screen">
      <nav className="auth-navbar h-16 sm:h-20 w-full backdrop-blur-sm px-4 sm:px-7 flex items-center justify-between">
        <BrandLogo textClassName="brand-wordmark brand-text" />
        <div className="auth-link-muted text-[0.80rem] sm:text-[0.90rem]">
          <span>¿Ya tenés cuenta? </span>
          <a href="/login" ><span className="brand-text font-bold hover:underline">Iniciar Sesión</span></a>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[920px] px-6 sm:px-10 pt-10 sm:pt-16 pb-28 sm:pb-32">

        <div className="text-center mt-6 sm:mt-8">
          <h1 className="auth-heading text-[2.6rem] sm:text-[3.2rem] font-semibold tracking-[-0.03em]">
            Elegí tu tipo de cuenta
          </h1>
          <p className="auth-copy mt-4 text-[1.02rem] sm:text-[1.12rem] max-w-[640px] mx-auto leading-relaxed">
            Selecciona el perfil que mejor se adapte a tus necesidades para comenzar a utilizar nuestra plataforma.
          </p>
        </div>

        <AccountTypeSelector options={accountTypes} onContinue={handleContinue} />

      </main>

      <footer className="auth-footer-text fixed bottom-0 left-0 right-0 px-4 sm:px-7 py-3 text-[0.6rem] sm:text-[0.63rem] uppercase tracking-[0.12em] flex items-center justify-between">
        <div className="flex gap-4 sm:gap-6">
          <a href="#">Privacidad</a>
          <a href="#">Terminos</a>
          <a href="#">Ayuda</a>
        </div>
        <span>© 2026 REPORTARG</span>
      </footer>
    </div>
  );
}
