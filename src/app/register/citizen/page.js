'use client';

import CitizenRegistrationForm from '@/components/auth/CitizenRegistrationForm';
import BrandLogo from '@/components/ui/BrandLogo';

export default function CitizenRegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — solo visible en desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-[rgb(var(--azul))] flex-col justify-center px-16 relative overflow-hidden">
        {/* Logo */}
        <BrandLogo
          logoSrc="/reportarg-logo-sinfondo.png"
          containerClassName="absolute top-12 left-16"
          logoClassName="h-11 w-11 sm:h-13 sm:w-13"
          textClassName="brand-wordmark text-white"
          textSizeClassName="text-[1.1rem] sm:text-[1.35rem]"
        />

        <h2 className="max-w-[20inch] text-[3.1rem] font-extrabold tracking-[-0.03em] text-white leading-[1.02] mb-7 drop-shadow-[0_6px_18px_rgba(9,28,87,0.3)]">
          Construyendo una comunidad <span className="font-black italic text-[#dbe8ff]">más segura.</span>
        </h2>
        <p className="max-w-[34ch] text-[1.33rem] text-blue-100/90 leading-[1.55] font-medium">
          Únete al portal institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.
        </p>

        {/* Decorativo */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900/40 rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <BrandLogo
            logoSrc="/reportarg-logo-sinfondo.png"
            containerClassName="lg:hidden justify-center mb-8"
            logoClassName="h-9 w-9"
            textClassName="brand-wordmark brand-text"
            textSizeClassName="text-[1rem]"
          />
          <CitizenRegistrationForm />
        </div>
      </div>
    </div>
  );
}