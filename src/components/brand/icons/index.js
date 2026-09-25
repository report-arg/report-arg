import React from 'react';
import { IconBase } from '../IconBase';

// ==========================================
// 01. SÍMBOLO DE MARCA (LOGO PROBADO Y APROBADO)
// ==========================================

/**
 * Isotipo Oficial ReportARG (Basado en la Propuesta A).
 * Geometría pulida con separación uniforme entre pin y ondas de transmisión.
 */
export const PinReportArg = (props) => (
  <IconBase {...props}>
    {/* Onda superior de transmisión */}
    <path d="M7 4.5a6.5 6.5 0 0 1 10 0" />
    {/* Pin base simétrico */}
    <path d="M12 21.5c-3.8-3.8-5.5-7.2-5.5-10a5.5 5.5 0 1 1 11 0c0 2.8-1.7 6.2-5.5 10Z" />
    {/* Exclamación / Alerta interior */}
    <path d="M12 8.5v3" />
    <circle cx="12" cy="14" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

// ==========================================
// 02. PINES DE UBICACIÓN
// ==========================================

export const PinClaim = (props) => (
  <IconBase {...props}>
    <path d="M12 21.5c-4-4-6-7.5-6-10.5a6 6 0 1 1 12 0c0 3-2 6.5-6 10.5Z" />
    <path d="M12 8v3.5" />
    <circle cx="12" cy="14" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

export const PinOfficial = (props) => (
  <IconBase {...props}>
    <path d="M12 21.5c-4-4-6-7.5-6-10.5a6 6 0 1 1 12 0c0 3-2 6.5-6 10.5Z" />
    <path d="M9 11.5l2 2l4-4" />
  </IconBase>
);

// ==========================================
// 03. CATEGORÍAS CIUDADANAS (BASADAS EN SEED DB)
// ==========================================

/** LUZ - Cortes de luz / Electricidad */
export const ElectricityIcon = (props) => (
  <IconBase {...props}>
    <path d="M13 2L3 13h9l-1 9l10-11h-9l1-9z" />
  </IconBase>
);

/** AGUA - Agua y cloacas */
export const WaterIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 21a6 6 0 0 0 6-6c0-4-6-11-6-11s-6 7-6 11a6 6 0 0 0 6 6Z" />
    <path d="M12 17a2 2 0 0 0 2-2" strokeWidth="1.5" />
  </IconBase>
);

/** SEG - Seguridad */
export const SecurityIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 3a12 12 0 0 0-8.5 3A12 12 0 0 0 3 12c0 5.25 3.75 9.75 9 11c5.25-1.25 9-5.75 9-11c0-2.1-.5-4.1-1.5-6A12 12 0 0 0 12 3Z" />
    <path d="M12 8v4" />
    <circle cx="12" cy="15" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

/** TRANS - Transporte público */
export const TransportIcon = (props) => (
  <IconBase {...props}>
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <path d="M4 11h16" />
    <circle cx="7.5" cy="15" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="15" r="1" fill="currentColor" stroke="none" />
    <path d="M6 18v3" />
    <path d="M18 21v-3" />
  </IconBase>
);

/** RES - Residuos y limpieza */
export const TrashIcon = (props) => (
  <IconBase {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </IconBase>
);

/** OBR - Obras viales y calles */
export const StreetIcon = (props) => (
  <IconBase {...props}>
    <path d="M5 21L8.5 3" />
    <path d="M19 21L15.5 3" />
    <path d="M12 6v3" />
    <path d="M12 12v3" />
    <path d="M12 18v1" />
  </IconBase>
);

/** ALUM - Alumbrado público (Bombilla / foquito de luz tradicional con destellos de brillo) */
export const LightingIcon = (props) => (
  <IconBase {...props}>
    {/* Silueta clásica de bombilla de luz */}
    <path d="M15 14c.8-1 1.5-2.2 1.5-4a4.5 4.5 0 1 0-9 0c0 1.8.7 3 1.5 4 .8 1 1 1.8 1 3h4c0-1.2.2-2 1-3Z" />
    {/* Base roscada de la bombilla */}
    <path d="M10 21h4" />
    {/* Destellos / Rayos superiores de iluminación */}
    <path d="M12 2v2" />
    <path d="M4.9 4.9l1.4 1.4" />
    <path d="M19.1 4.9l-1.4 1.4" />
  </IconBase>
);

/** ESP - Espacios públicos */
export const PublicSpaceIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 22v-6" />
    <path d="M17 16c2.5 0 4.5-2.2 4-4.7C20.5 8.7 18.5 7 16 7c0-3-3-5-6-4c-2.8 1-4 3.7-3.5 6.5C4 9.5 2 11.5 2 14c0 2.5 2.2 4.5 4.7 4C7.7 17.8 9.2 16 12 16h5Z" />
  </IconBase>
);

/** ALERT - Alertas */
export const AlertCategoryIcon = (props) => (
  <IconBase {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

/** INFO - Información general */
export const InfoCategoryIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 10v6" />
    <circle cx="12" cy="7" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

/** SALUD - Salud pública (Cruz médica / sanitaria limpia sin contorno circular de botón) */
export const HealthIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-5H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h5V3Z" />
  </IconBase>
);

/**
 * FALLBACK: Icono general de categoría por defecto.
 * Se utiliza para categorías dinámicas nuevas creadas por un administrador sin icono específico.
 */
export const CategoryFallbackIcon = (props) => (
  <IconBase {...props}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </IconBase>
);

// ==========================================
// 04. ACCIONES Y COMUNICACIÓN
// ==========================================

export const ReportProblemIcon = (props) => (
  <IconBase {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M12 8v4.5" />
    <circle cx="12" cy="15.5" r="0.85" fill="currentColor" stroke="none" />
  </IconBase>
);

export const MeTooIcon = (props) => (
  <IconBase {...props}>
    <circle cx="10" cy="7" r="3.5" />
    <path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M17 9v6" />
    <path d="M14 12h6" />
  </IconBase>
);

export const OfficialCommIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10l2 2l4-4" />
  </IconBase>
);

// ==========================================
// 05. SISTEMA DE ESTADOS DE RECLAMOS
// ==========================================

export const StatusPending = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </IconBase>
);

export const StatusReview = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7v5l3.5 2" />
  </IconBase>
);

export const StatusProcess = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6v2M12 16v2M6 12h2M16 12h2M7.75 7.75l1.4 1.4M14.85 14.85l1.4 1.4M7.75 16.25l1.4-1.4M14.85 9.15l1.4-1.4" />
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
  </IconBase>
);

export const StatusResolved = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M8.5 12l2.5 2.5l5-5" />
  </IconBase>
);

export const StatusCanceled = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9 9l6 6" />
    <path d="M15 9l-6 6" />
  </IconBase>
);

// ==========================================
// Mapeo Inteligente de Categorías de Base de Datos
// ==========================================

export const REAL_CATEGORIES = [
  { code: 'LUZ', name: 'Cortes de luz', type: 'ambos', component: ElectricityIcon, description: 'Problemas de suministro eléctrico o fallas' },
  { code: 'AGUA', name: 'Problemas de agua', type: 'ambos', component: WaterIcon, description: 'Falta de agua, presión o cloacas' },
  { code: 'SEG', name: 'Seguridad', type: 'ambos', component: SecurityIcon, description: 'Situaciones de riesgo o seguridad vecinal' },
  { code: 'TRANS', name: 'Transporte público', type: 'ambos', component: TransportIcon, description: 'Paradas, frecuencias y servicio de colectivo' },
  { code: 'RES', name: 'Residuos', type: 'reclamo', component: TrashIcon, description: 'Recolección de basura y limpieza urbana' },
  { code: 'OBR', name: 'Obras viales', type: 'reclamo', component: StreetIcon, description: 'Calles en mal estado, baches o veredas' },
  { code: 'ALUM', name: 'Alumbrado público', type: 'reclamo', component: LightingIcon, description: 'Luminarias apagadas, focos o focos rotos' },
  { code: 'ESP', name: 'Espacios públicos', type: 'reclamo', component: PublicSpaceIcon, description: 'Plazas, parques y arbolado' },
  { code: 'ALERT', name: 'Alertas', type: 'comunicado', component: AlertCategoryIcon, description: 'Avisos urgentes y cortes programados' },
  { code: 'INFO', name: 'Información general', type: 'comunicado', component: InfoCategoryIcon, description: 'Comunicaciones informativas institucionales' },
  { code: 'SALUD', name: 'Salud', type: 'comunicado', component: HealthIcon, description: 'Campañas e iniciativas sanitarias' }
];

/**
 * Retorna el icono correspondiente según el código de la categoría de la DB.
 * Si la categoría es nueva o desconocida, retorna `CategoryFallbackIcon`.
 *
 * @param {string} code - Código de la categoría (ej. 'LUZ', 'AGUA', 'SEG')
 * @returns {React.ComponentType}
 */
export function getCategoryIcon(code) {
  if (!code) return CategoryFallbackIcon;
  const normalized = String(code).toUpperCase().trim();
  const match = REAL_CATEGORIES.find((c) => c.code === normalized);
  return match ? match.component : CategoryFallbackIcon;
}

export const ALL_BRAND_ICONS = {
  pins: [
    { component: PinReportArg, key: 'PinReportArg', name: 'Isotipo ReportARG', use: 'Símbolo principal de marca' },
    { component: PinClaim, key: 'PinClaim', name: 'Pin Reclamo', use: 'Ubicación de reclamo en mapa' },
    { component: PinOfficial, key: 'PinOfficial', name: 'Pin Oficial', use: 'Ubicación de institución o comunicado' }
  ],
  categories: REAL_CATEGORIES,
  fallback: {
    component: CategoryFallbackIcon,
    name: 'Categoría por Defecto (Fallback)',
    use: 'Utilizado para nuevas categorías creadas dinámicamente desde el panel Admin sin icono asignado'
  },
  actions: [
    { component: ReportProblemIcon, key: 'ReportProblemIcon', name: 'Reportar Problema', use: 'Acción de crear nuevo reclamo' },
    { component: MeTooIcon, key: 'MeTooIcon', name: 'A mí también', use: 'Adhesión vecinal a un reclamo existente' },
    { component: OfficialCommIcon, key: 'OfficialCommIcon', name: 'Comunicado Oficial', use: 'Publicación verificada de instituciones' }
  ],
  status: [
    { component: StatusPending, key: 'StatusPending', name: '1. Pendiente', use: 'Reclamo registrado a la espera de evaluación inicial' },
    { component: StatusReview, key: 'StatusReview', name: '2. En revisión', use: 'Evaluado por el equipo de gestión para análisis técnico' },
    { component: StatusProcess, key: 'StatusProcess', name: '3. En proceso', use: 'Gestión iniciada por la entidad responsable' },
    { component: StatusResolved, key: 'StatusResolved', name: '4. Resuelto', use: 'Reclamo marcado como finalizado por la entidad responsable' },
    { component: StatusCanceled, key: 'StatusCanceled', name: 'Salida: Cancelado', use: 'Reclamo anulado por su autor antes de iniciar la revisión' }
  ]
};
