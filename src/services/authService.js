/**
 * authService.js
 * 
 * Este archivo centraliza todas las llamadas a la API relacionadas
 * con la autenticación (Login, Registro, Recuperación de contraseña).
 * 
 * Aquí es donde integrarás JWT más adelante.
 */

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

export const authService = {
  /**
   * Inicia sesión con email y contraseña
   */
  login: async (email, password) => {
    // Ejemplo de cómo será la llamada a tu backend:
    /*
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error('Error de credenciales');
    return await response.json(); // Retorna el token JWT
    */
    
    // Simulación temporal
    return new Promise((resolve) => 
      setTimeout(() => resolve({ token: 'jwt-token-simulado', user: { email } }), 1000)
    );
  },

  /**
   * Registra un nuevo ciudadano
   */
  registerCitizen: async (data) => {
    // Aquí harás el POST a tu endpoint de registro
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  /**
   * Registra una nueva institución
   */
  registerInstitution: async (data) => {
    // Aquí harás el POST a tu endpoint de registro institucional
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  /**
   * Verifica el correo con el código OTP
   */
  verifyEmail: async (code, email) => {
    // Aquí harás el POST a tu endpoint de verificación
    // ej: await apiClient.post('/auth/verify', { code, email });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') resolve({ success: true });
        else reject(new Error('Código inválido'));
      }, 1000);
    });
  },

  /**
   * Reenvía el código de verificación
   */
  resendVerificationCode: async (email) => {
    // Aquí harás el POST para reenviar
    // ej: await apiClient.post('/auth/resend-code', { email });
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }
};
