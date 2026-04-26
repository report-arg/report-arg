export function validateRegistration({ fullName, email, password, confirmPassword, acceptTerms }) {
    const errors = {};
  
    if (!fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido.';
    }
  
    if (!email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ingresá un correo válido.';
    }
  
    if (!password) {
      errors.password = 'La contraseña es requerida.';
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
  
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmá tu contraseña.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
  
    if (!acceptTerms) {
      errors.acceptTerms = 'Debés aceptar los términos para continuar.';
    }
  
    return errors;
  }