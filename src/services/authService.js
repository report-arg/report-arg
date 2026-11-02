import apiClient from './apiClient';

export const authService = {
  /**
   * Registra un nuevo ciudadano
   * @param {Object} data - Datos del ciudadano
   */
  registerCitizen: async (data) => {
    const response = await apiClient.post('/auth/register-citizen', data);
    return response.data;
  },

  /**
   * Registra una nueva institución
   * @param {Object} data - Datos de la institución
   */
  registerInstitution: async (data) => {
    const response = await apiClient.post('/auth/register-institution', data);
    return response.data;
  },

  /**
   * Verifica el correo electrónico usando un código OTP
   * @param {string} email - Correo a verificar
   * @param {string} code - Código de 6 dígitos
   */
  verifyEmail: async (email, code) => {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data;
  },

  /**
   * Reenvía el código de verificación al correo
   * @param {string} email - Correo destino
   */
  resendVerificationCode: async (email) => {
    const response = await apiClient.post('/auth/resend-code', { email });
    return response.data;
  },

  /**
   * Solicita el restablecimiento de contraseña (envía email con link)
   * @param {string} email - Correo del usuario
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Restablece la contraseña usando el token del email
   * @param {string} token - Token recibido por email
   * @param {string} newPassword - Nueva contraseña
   */
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  /**
   * Obtiene el listado de ciudades activas en ReportARG
   */
  getCiudadesActivas: async () => {
    const response = await apiClient.get('/ciudades');
    return response.data;
  },

  /**
   * Obtiene las provincias oficiales de Argentina
   */
  getProvincias: async () => {
    const response = await apiClient.get('/ciudades/provincias');
    return response.data;
  },

  /**
   * Obtiene localidades oficiales por provincia con estado de activación en ReportARG
   * @param {Object} params
   * @param {string} params.provincia
   * @param {string} [params.q]
   * @param {number} [params.limit=150]
   */
  getLocalidades: async ({ provincia, q, limit = 150 }) => {
    const paramsQuery = new URLSearchParams();
    if (provincia) paramsQuery.set('provincia', provincia);
    if (q) paramsQuery.set('q', q);
    if (limit) paramsQuery.set('limit', String(limit));
    const response = await apiClient.get(`/ciudades/localidades?${paramsQuery.toString()}`);
    return response.data;
  },

  /**
   * Obtiene las ciudades adicionales de interés del ciudadano autenticado
   */
  getCiudadesInteres: async () => {
    const response = await apiClient.get('/auth/me/ciudades-interes');
    return response.data;
  },

  /**
   * Agrega una ciudad de interés (máximo 3)
   * @param {number} idCiudad
   */
  addCiudadInteres: async (idCiudad) => {
    const response = await apiClient.post('/auth/me/ciudades-interes', { id_ciudad: Number(idCiudad) });
    return response.data;
  },

  /**
   * Elimina una ciudad de interés guardada
   * @param {number} idCiudad
   */
  removeCiudadInteres: async (idCiudad) => {
    const response = await apiClient.delete(`/auth/me/ciudades-interes/${Number(idCiudad)}`);
    return response.data;
  },

  /**
   * Valida y cambia el contexto de ciudad consultada sin alterar la residencia ni permisos
   * @param {number} idCiudad
   */
  cambiarContextoCiudad: async (idCiudad) => {
    const response = await apiClient.post('/auth/me/contexto-ciudad', { id_ciudad: Number(idCiudad) });
    return response.data;
  },
};
