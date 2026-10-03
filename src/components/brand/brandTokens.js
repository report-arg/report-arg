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

export const TYPOGRAPHY_SCALE = [
  { level: 'Display / H1', size: '24px (1.5rem)', weight: '800', tracking: 'tracking-tight', use: 'Encabezados principales de página e inicio' },
  { level: 'H2', size: '20px (1.25rem)', weight: '700', tracking: 'tracking-tight', use: 'Títulos de sección y encabezados de vista' },
  { level: 'H3 / Sección', size: '16px (1rem)', weight: '700', tracking: 'normal', use: 'Títulos de tarjetas principales y bloques' },
  { level: 'Card Title', size: '15px (0.9375rem)', weight: '700', tracking: 'normal', use: 'Títulos de publicaciones y reclamos' },
  { level: 'Body', size: '14px (0.875rem)', weight: '400 / 500', tracking: 'normal', use: 'Cuerpo de texto principal y descripciones' },
  { level: 'Body Small', size: '13px (0.8125rem)', weight: '400 / 500', tracking: 'normal', use: 'Metadatos en tarjetas y textos secundarios' },
  { level: 'Meta / Caption', size: '12px (0.75rem)', weight: '500', tracking: 'normal', use: 'Fechas, ubicaciones y etiquetas de tiempo' },
  { level: 'Label', size: '12px (0.75rem)', weight: '600', tracking: 'normal', use: 'Etiquetas de formulario y badges' },
  { level: 'Button', size: '13px (0.8125rem)', weight: '600', tracking: 'normal', use: 'Botones y acciones interactivas' }
];

export const CTA_SPEC = {
  label: 'Reportar un problema',
  icon: 'MapPinPlus',
  bgHex: '#005CE6',
  hoverHex: '#0046B3',
  activeHex: '#00358A',
  radius: '12px (rounded-xl)',
  padding: '10px 18px',
  textSize: '13px font-bold',
  description: 'CTA Principal de la experiencia Ciudadano. Comunica ubicación + reporte en azul de marca refinado sin contenedor cuadrado encajonado.'
};

export const BUTTON_HIERARCHY = [
  { level: 'PRIMARY CTA', style: 'Solid Brand Blue (#005CE6)', text: 'Blanco font-bold', radius: '12px', use: 'Reportar un problema' },
  { level: 'PRIMARY', style: 'Solid Brand Blue (#005CE6)', text: 'Blanco font-semibold', radius: '12px', use: 'Publicar / Guardar' },
  { level: 'SECONDARY', style: 'Soft Neutral (#F1F5F9) + Border (#E2E8F0)', text: 'Slate-700 font-semibold', radius: '12px', use: 'Explorar / Mapa / Filtros' },
  { level: 'TERTIARY / GHOST', style: 'Transparente', text: 'Slate-600 hover:Slate-900', radius: '8px', use: 'Compartir / Cancelar en modales' },
  { level: 'ICON BUTTON', style: 'Transparente o Neutral-100', text: 'Slate-500 hover:Slate-800', radius: '12px', use: 'Geolocalización / Acciones compactas' },
  { level: 'DANGER', style: 'Soft Danger (#FEF2F2)', text: 'Danger-600 (#DC2626)', radius: '12px', use: 'Eliminar / Cancelar reporte' }
];

export const SURFACE_SPECS = [
  { name: 'App Background', bg: '#F8FAFC', border: 'Ninguno', shadow: 'Ninguna', description: 'Fondo principal de la aplicación.' },
  { name: 'Card Surface', bg: '#FFFFFF', border: '1px solid #E2E8F0', shadow: 'shadow-xs (0 1px 2px rgba(0,0,0,0.04))', description: 'Superficie de publicaciones y modales.' },
  { name: 'Comunicado Surface', bg: '#F0F7FF', border: '1px solid #BDE0FF', shadow: 'shadow-xs', description: 'Superficie destacada para comunicados oficiales.' },
  { name: 'Input Surface', bg: '#FFFFFF', border: '1px solid #CBD5E1', shadow: 'Ninguna', description: 'Entradas de texto con alto contraste de placeholder (#64748B).' }
];

