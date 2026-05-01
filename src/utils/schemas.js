import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('Ingresá un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
const phoneRegex = /^\+?[\d\s-]{8,15}$/;
const cuitMultipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const addError = (errors, field, message) => {
  if (!errors[field]) {
    errors[field] = message;
  }
};

const validateEmail = (value, errors, field = 'email') => {
  if (!value?.trim()) {
    addError(errors, field, 'El correo electrónico es requerido.');
    return;
  }

  if (!emailRegex.test(value.trim())) {
    addError(errors, field, 'Ingresá un correo válido.');
  }
};

const validatePassword = (value, errors, field = 'password') => {
  if (!value) {
    addError(errors, field, 'La contraseña es requerida.');
    return;
  }

  if (value.length < 8) {
    addError(errors, field, 'La contraseña debe tener al menos 8 caracteres.');
  } else if (!/[A-Z]/.test(value)) {
    addError(errors, field, 'La contraseña debe contener al menos una mayúscula.');
  } else if (!/[0-9]/.test(value)) {
    addError(errors, field, 'La contraseña debe contener al menos un número.');
  }
};

const isValidCuit = (value) => {
  if (!value || !cuitRegex.test(value.trim())) {
    return false;
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) {
    return false;
  }

  const checkDigit = Number(digits[10]);
  const sum = cuitMultipliers.reduce((acc, multiplier, index) => {
    return acc + Number(digits[index]) * multiplier;
  }, 0);

  let expected = 11 - (sum % 11);
  if (expected === 11) expected = 0;
  if (expected === 10) expected = 9;

  return checkDigit === expected;
};

export const validateLoginData = (data) => {
  const errors = {};
  validateEmail(data.email, errors);

  if (!data.password) {
    addError(errors, 'password', 'La contraseña es requerida.');
  }

  return errors;
};

export const validateResetPasswordRequest = (data) => {
  const errors = {};
  validateEmail(data.email, errors);
  return errors;
};

export const validateNewPassword = (data) => {
  const errors = {};
  validatePassword(data.password, errors);

  if (!data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Confirmá tu contraseña.');
  } else if (data.password !== data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Las contraseñas no coinciden.');
  }

  return errors;
};

export const validateCitizenRegister = (data) => {
  const errors = {};

  if (!data.nombre?.trim()) {
    addError(errors, 'nombre', 'El nombre es requerido.');
  } else if (data.nombre.trim().length < 2) {
    addError(errors, 'nombre', 'El nombre debe tener al menos 2 caracteres.');
  }

  if (!data.apellido?.trim()) {
    addError(errors, 'apellido', 'El apellido es requerido.');
  } else if (data.apellido.trim().length < 2) {
    addError(errors, 'apellido', 'El apellido debe tener al menos 2 caracteres.');
  }

  validateEmail(data.email, errors);
  validatePassword(data.password, errors);

  if (!data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Confirmá tu contraseña.');
  } else if (data.password !== data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Las contraseñas no coinciden.');
  }

  if (!data.provincia?.trim()) {
    addError(errors, 'provincia', 'La provincia es requerida.');
  }

  if (!data.ciudad?.trim()) {
    addError(errors, 'ciudad', 'La ciudad es requerida.');
  }

  if (!data.zona?.trim()) {
    addError(errors, 'zona', 'La zona es requerida.');
  }

  if (!data.acceptTerms) {
    addError(errors, 'acceptTerms', 'Debés aceptar los términos para continuar.');
  }

  return errors;
};

export const validateInstitutionRegister = (data) => {
  const errors = {};

  if (!data.contactName?.trim()) {
    addError(errors, 'contactName', 'El nombre del responsable es requerido.');
  } else if (data.contactName.trim().length < 2) {
    addError(errors, 'contactName', 'El nombre debe tener al menos 2 caracteres.');
  }

  validateEmail(data.email, errors);
  validatePassword(data.password, errors);

  if (!data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Confirmá tu contraseña.');
  } else if (data.password !== data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Las contraseñas no coinciden.');
  }

  if (!data.institutionName?.trim()) {
    addError(errors, 'institutionName', 'El nombre o razón social es requerido.');
  } else if (data.institutionName.trim().length < 2) {
    addError(errors, 'institutionName', 'El nombre o razón social es requerido.');
  }

  if (!data.cuit?.trim()) {
    addError(errors, 'cuit', 'El CUIT es requerido.');
  } else if (!isValidCuit(data.cuit.trim())) {
    addError(errors, 'cuit', 'Ingresá un CUIT válido (ej: 20-12345678-9).');
  }

  if (!data.institutionType?.trim()) {
    addError(errors, 'institutionType', 'Debes seleccionar un tipo de institución.');
  }

  if (!data.phone?.trim()) {
    addError(errors, 'phone', 'El teléfono de contacto es requerido.');
  } else if (!phoneRegex.test(data.phone.trim())) {
    addError(errors, 'phone', 'Ingresá un teléfono válido.');
  }

  if (!data.provincia?.trim()) {
    addError(errors, 'provincia', 'La provincia es requerida.');
  }

  if (!data.ciudad?.trim()) {
    addError(errors, 'ciudad', 'La ciudad es requerida.');
  }

  if (!data.zona?.trim()) {
    addError(errors, 'zona', 'La zona es requerida.');
  }

  if (!data.address?.trim()) {
    addError(errors, 'address', 'La dirección es requerida.');
  } else if (data.address.trim().length < 5) {
    addError(errors, 'address', 'La dirección debe ser más detallada.');
  }

  if (!data.termsAccepted) {
    addError(errors, 'termsAccepted', 'Debés aceptar los términos para continuar.');
  }

  return errors;
};

export const validateVerifyEmail = (data) => {
  const errors = {};

  if (!data.code?.trim()) {
    addError(errors, 'code', 'El código es requerido.');
  } else if (data.code.trim().length !== 6) {
    addError(errors, 'code', 'El código debe tener exactamente 6 dígitos.');
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
