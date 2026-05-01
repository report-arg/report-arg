import { z } from 'zod';

/**
 * Esquema de validación para el inicio de sesión.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es requerido.').email('Ingresá un correo válido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es requerido.').email('Ingresá un correo válido.'),
});

/**
 * Esquema de validación para el registro de ciudadanos.
 * Verifica la fuerza de la contraseña y la selección estricta de campos geográficos.
 */
export const citizenRegisterSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  email: z.string().min(1, 'El correo electrónico es requerido.').email('Ingresá un correo válido.'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),
  confirmPassword: z.string().min(1, 'Confirmá tu contraseña.'),
  provincia: z.string().min(1, 'La provincia es requerida.'),
  ciudad: z.string().min(1, 'La ciudad es requerida.'),
  zona: z.string().min(1, 'La zona es requerida.'), // Modificado: Ahora es obligatorio
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debés aceptar los términos para continuar.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

/**
 * Esquema de validación para el registro de instituciones.
 * Incluye validaciones específicas corporativas como formato CUIT y Tipo de Institución.
 */
export const institutionRegisterSchema = z.object({
  contactName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().min(1, 'El correo electrónico es requerido.').email('Ingresá un correo válido.'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),
  confirmPassword: z.string().min(1, 'Confirmá tu contraseña.'),
  institutionName: z.string().min(2, 'El nombre o razón social es requerido.'),
  cuit: z.string()
    .min(1, 'El CUIT es requerido.')
    .regex(/^\d{2}-\d{8}-\d{1}$/, 'Ingresá un CUIT válido (ej: 20-12345678-9).'),
  institutionType: z.string().min(1, 'Debes seleccionar un tipo de institución.'),
  phone: z.string()
    .min(1, 'El teléfono de contacto es requerido.')
    .regex(/^\+?[\d\s-]{8,15}$/, 'Ingresá un teléfono válido.'),
  provincia: z.string().min(1, 'La provincia es requerida.'),
  ciudad: z.string().min(1, 'La ciudad es requerida.'),
  zona: z.string().min(1, 'La zona es requerida.'), // Modificado: Ahora es obligatorio
  address: z.string().min(5, 'La dirección debe ser más detallada.'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debés aceptar los términos para continuar.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

/**
 * Esquema para validar el código OTP en la verificación de correos.
 */
export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'El código debe tener exactamente 6 dígitos.'),
});
