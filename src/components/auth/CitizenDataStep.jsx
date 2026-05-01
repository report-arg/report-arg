import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

/**
 * Sub-componente (Paso 2) del registro de Ciudadanos.
 * Encapsula la interfaz gráfica de los datos personales.
 * Recibe por props las funciones de `react-hook-form` desde el componente padre.
 */
export default function CitizenDataStep({
  register, // Función para registrar campos en el formulario padre
  errors, // Objeto con errores de validación de Zod
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onNextStep, // Función que el padre provee para validar y avanzar al Paso 3
}) {
  return (
    <div className="animate-fade-in">
      <div className="register-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">
            NOMBRE
          </label>
          <div className="form-input-wrapper">
            <input
              type="text"
              id="nombre"
              className="form-input"
              placeholder="Ej. Juan"
              {...register('nombre')}
            />
            <div className="form-input-icon">
              <UserIcon aria-hidden />
            </div>
          </div>
          {errors.nombre && <p className="register-error">{errors.nombre.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="apellido">
            APELLIDO
          </label>
          <div className="form-input-wrapper">
            <input
              type="text"
              id="apellido"
              className="form-input"
              placeholder="Ej. Perez"
              {...register('apellido')}
            />
            <div className="form-input-icon">
              <UserIcon aria-hidden />
            </div>
          </div>
          {errors.apellido && <p className="register-error">{errors.apellido.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          CORREO ELECTRÓNICO
        </label>
        <div className="form-input-wrapper">
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="nombre@ejemplo.com"
            {...register('email')}
          />
          <div className="form-input-icon">
            <EnvelopeIcon aria-hidden />
          </div>
        </div>
        {errors.email && <p className="register-error">{errors.email.message}</p>}
      </div>

      <div className="register-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            CONTRASEÑA
          </label>
          <div className="form-input-wrapper">
            <div className="form-input-icon form-input-icon-left">
              <LockClosedIcon aria-hidden />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input has-left-icon"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
            </button>
          </div>
          {errors.password && <p className="register-error">{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            CONFIRMAR CONTRASEÑA
          </label>
          <div className="form-input-wrapper">
            <div className="form-input-icon form-input-icon-left">
              <LockClosedIcon aria-hidden />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-input has-left-icon"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
            >
              {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
            </button>
          </div>
          {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button type="button" className="btn-primary mt-4" onClick={onNextStep}>
        Continuar a Ubicación
      </button>

      <p className="login-footer mt-6">
        ¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>

      <div className="login-divider">O continuar con</div>

      <div className="social-buttons">
        <button className="btn-social" type="button">
          <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button className="btn-social" type="button">
          <svg viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );
}
