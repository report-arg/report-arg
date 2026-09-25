/**
 * Tokens de diseño y definiciones del sistema visual de ReportARG.
 */

export const BRAND_COLORS = [
  { step: '50', hex: '#F0F7FF', name: 'Brand 50', textDark: true, role: 'Superficie destacada / Hover suave' },
  { step: '100', hex: '#E0EFFF', name: 'Brand 100', textDark: true, role: 'Bordes activos / Badges' },
  { step: '200', hex: '#BDE0FF', name: 'Brand 200', textDark: true, role: 'Acentos claros / Iconos secundarios' },
  { step: '300', hex: '#85C8FF', name: 'Brand 300', textDark: true, role: 'Texto acento en modo oscuro' },
  { step: '400', hex: '#47A3FF', name: 'Brand 400', textDark: true, role: 'Anillo de foco / Acentos interactivos' },
  { step: '500', hex: '#1479FF', name: 'Brand 500', textDark: false, role: 'Links activos / Interacción' },
  { step: '600', hex: '#005CE6', name: 'Brand 600', textDark: false, isPrimary: true, role: 'Acción Principal (Botón Primario / Isotipo)' },
  { step: '700', hex: '#0046B3', name: 'Brand 700', textDark: false, role: 'Hover de Acción Principal' },
  { step: '800', hex: '#00358A', name: 'Brand 800', textDark: false, role: 'Encabezados y elementos de marca' },
  { step: '900', hex: '#002966', name: 'Brand 900', textDark: false, role: 'Superficie Azul Oscuro (Tarjetas de Marca)' }
];

export const TOKEN_ROLES = [
  { role: 'Fondo de Aplicación (Background)', lightHex: '#F8FAFC', darkHex: '#0F172A', description: 'Superficie principal de fondo de pantalla.' },
  { role: 'Superficie de Tarjeta (Surface)', lightHex: '#FFFFFF', darkHex: '#1E293B', description: 'Contenedores, tarjetas de reclamos y modales.' },
  { role: 'Texto Principal (Text Primary)', lightHex: '#0F172A', darkHex: '#F8FAFC', description: 'Títulos, nombres de reclamos y texto destacado.' },
  { role: 'Texto Secundario (Text Muted)', lightHex: '#64748B', darkHex: '#94A3B8', description: 'Metadatos, fechas, ubicaciones y etiquetas.' },
  { role: 'Borde General (Border)', lightHex: '#E2E8F0', darkHex: '#334155', description: 'Líneas divisoras, bordes de tarjetas e inputs.' },
  { role: 'Acción Principal (Primary Action)', lightHex: '#005CE6', darkHex: '#005CE6', description: 'Botón principal de nuevo reclamo y CTA.' },
  { role: 'Hover de Acción (Action Hover)', lightHex: '#0046B3', darkHex: '#47A3FF', description: 'Estado al pasar el cursor sobre botones.' },
  { role: 'Anillo de Foco (Focus Ring)', lightHex: '#47A3FF', darkHex: '#85C8FF', description: 'Indicador visual para navegación por teclado.' }
];

export const SEMANTIC_COLORS = [
  {
    name: 'Success (Éxito / Resuelto)',
    bg: '#ECFDF5',
    border: 'rgba(16, 185, 129, 0.25)',
    text: '#059669',
    hex: '#059669',
    description: 'Reclamos resueltos e intervenciones concluidas.'
  },
  {
    name: 'Warning (Alerta / En revisión)',
    bg: '#FFFBEB',
    border: 'rgba(245, 158, 11, 0.25)',
    text: '#D97706',
    hex: '#D97706',
    description: 'Reportes en evaluación técnica o triaje.'
  },
  {
    name: 'Info (Proceso / Institucional)',
    bg: '#F0F9FF',
    border: 'rgba(2, 132, 199, 0.25)',
    text: '#0284C7',
    hex: '#0284C7',
    description: 'Gestión iniciada o comunicados oficiales.'
  },
  {
    name: 'Danger (Urgente / Alerta)',
    bg: '#FEF2F2',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#DC2626',
    hex: '#DC2626',
    description: 'Situaciones de emergencia o fallas críticas.'
  },
  {
    name: 'Neutral (Pendiente / Salida)',
    bg: '#F8FAFC',
    border: 'rgba(100, 116, 139, 0.25)',
    text: '#475569',
    hex: '#475569',
    description: 'Reclamos pendientes o cancelados.'
  }
];
