// Roles disponibles en el sistema
export const ROLES = {
  CIUDADANO: "ciudadano",
  INSTITUCION: "institucion",
  ADMIN: "admin",
};

// Permisos por funcionalidad
export const PERMISOS = {
  // Reclamos
  CREAR_RECLAMO: [ROLES.CIUDADANO, ROLES.ADMIN],
  VER_RECLAMOS_PROPIOS: [ROLES.CIUDADANO, ROLES.ADMIN],
  VER_RECLAMOS_AJENOS: [ROLES.ADMIN],
  GESTIONAR_RECLAMOS: [ROLES.INSTITUCION, ROLES.ADMIN],
  CAMBIAR_ESTADO_RECLAMO: [ROLES.INSTITUCION, ROLES.ADMIN],

  // Comunicados
  VER_COMUNICADOS: [ROLES.CIUDADANO, ROLES.INSTITUCION, ROLES.ADMIN],
  PUBLICAR_COMUNICADO: [ROLES.INSTITUCION, ROLES.ADMIN],
  EDITAR_COMUNICADO_PROPIO: [ROLES.INSTITUCION, ROLES.ADMIN],
  ELIMINAR_COMUNICADO_AJENO: [ROLES.ADMIN],

  // Eventos
  VER_EVENTOS: [ROLES.CIUDADANO, ROLES.INSTITUCION, ROLES.ADMIN],
  PUBLICAR_EVENTO: [ROLES.INSTITUCION, ROLES.ADMIN],
  EDITAR_EVENTO_PROPIO: [ROLES.INSTITUCION, ROLES.ADMIN],

  // Foro
  VER_FORO: [ROLES.CIUDADANO, ROLES.INSTITUCION, ROLES.ADMIN],
  PUBLICAR_EN_FORO: [ROLES.CIUDADANO, ROLES.INSTITUCION, ROLES.ADMIN],
  ELIMINAR_PUBLICACION_PROPIA: [ROLES.CIUDADANO, ROLES.INSTITUCION, ROLES.ADMIN],
  ELIMINAR_PUBLICACION_AJENA: [ROLES.ADMIN],

  // Panel admin
  VER_USUARIOS: [ROLES.ADMIN],
  APROBAR_INSTITUCIONES: [ROLES.ADMIN],
  ASIGNAR_ROLES: [ROLES.ADMIN],
  SUSPENDER_CUENTAS: [ROLES.ADMIN],
  CREAR_ADMIN: [ROLES.ADMIN],
  VER_ESTADISTICAS_GLOBALES: [ROLES.ADMIN],
};

// Rutas protegidas y qué rol necesitan
export const RUTAS_PROTEGIDAS = {
  "/dashboard/ciudadano": [ROLES.CIUDADANO],
  "/dashboard/institucion": [ROLES.INSTITUCION],
  "/dashboard/admin": [ROLES.ADMIN],
  "/reclamos/crear": [ROLES.CIUDADANO, ROLES.ADMIN],
  "/comunicados/crear": [ROLES.INSTITUCION, ROLES.ADMIN],
  "/eventos/crear": [ROLES.INSTITUCION, ROLES.ADMIN],
  "/admin": [ROLES.ADMIN],
};

// Función helper: verifica si un rol tiene un permiso
export function tienePermiso(rol, permiso) {
  if (!rol || !permiso) return false;
  return PERMISOS[permiso]?.includes(rol) ?? false;
}

// Función helper: verifica si un rol puede acceder a una ruta
export function puedeAccederRuta(rol, ruta) {
  const rolesPermitidos = RUTAS_PROTEGIDAS[ruta];
  if (!rolesPermitidos) return true; // ruta pública
  if (!rol) return false;
  return rolesPermitidos.includes(rol);
}