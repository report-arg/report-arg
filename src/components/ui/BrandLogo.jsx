'use client';

import Image from 'next/image';

// Componente reutilizable para renderizar el logo y wordmark de REPORTARG.
export default function BrandLogo({
  logoSrc = '/reportarg-logo.png',
  logoAlt = 'Logo de REPORTARG',
  containerClassName = '',
  logoClassName = 'h-9 w-9 sm:h-11 sm:w-11',
  textClassName = 'brand-wordmark brand-text',
  textSizeClassName = '',
}) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${containerClassName}`.trim()}>
      <Image src={logoSrc} alt={logoAlt} width={40} height={40} className={logoClassName} />
      <span className={`${textClassName} ${textSizeClassName}`.trim()}>
        REPORT<span className="brand-accent">ARG</span>
      </span>
    </div>
  );
}
