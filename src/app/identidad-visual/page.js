import { notFound } from 'next/navigation';
import BrandCatalogClient from './brand-catalog-client';

export const metadata = {
  title: 'Identidad Visual & Catálogo de Marca | ReportARG',
  description: 'Catálogo interno de revisión de identidad visual para ReportARG: logo, isotipo, paleta de colores de marca e iconos personalizados.'
};

export default function IdentidadVisualPage() {
  // Protección de la herramienta interna en entornos de producción sin flag explícito
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_BRAND_CATALOG !== 'true') {
    notFound();
  }

  return <BrandCatalogClient />;
}
