import {
  BuildingOffice2Icon,
  ChevronDownIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/20/solid';
import Link from 'next/link';

const institutionTypes = [
  { key: 'municipio', label: 'Municipio' },
  { key: 'hospital', label: 'Hospital / Centro de salud' },
  { key: 'escuela', label: 'Escuela / Institución educativa' },
  { key: 'ong', label: 'ONG / Fundación' },
  { key: 'seguridad', label: 'Fuerza de seguridad' },
  { key: 'otra', label: 'Otra institución' },
];

export default function InstitutionDataStep({
  register,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onNextStep,
}) {
  return (
    <div className="animate-fade-in">
      <div className="form-group">
        <label className="form-label" htmlFor="contactName">
          NOMBRE COMPLETO DEL RESPONSABLE
        </label>
        <div className="form-input-wrapper">
          <input
            type="text"
            id="contactName"
            className="form-input"
            placeholder="Ej. María Gómez"
            {...register('contactName')}
          />
          <div className="form-input-icon">
            <UserIcon aria-hidden />
          </div>
        </div>
        {errors.contactName && <p className="register-error">{errors.contactName.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          CORREO INSTITUCIONAL
        </label>
        <div className="form-input-wrapper">
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="institucion@ejemplo.gob.ar"
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
            >
              {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
            </button>
          </div>
          {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="institutionName">
          NOMBRE O RAZÓN SOCIAL DE LA INSTITUCIÓN
        </label>
        <div className="form-input-wrapper">
          <input
            type="text"
            id="institutionName"
            className="form-input"
            placeholder="Ej. Hospital Municipal San Martín"
            {...register('institutionName')}
          />
          <div className="form-input-icon">
            <BuildingOffice2Icon aria-hidden />
          </div>
        </div>
        {errors.institutionName && <p className="register-error">{errors.institutionName.message}</p>}
      </div>

      <div className="register-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="cuit">
            CUIT
          </label>
          <div className="form-input-wrapper">
            <input
              type="text"
              id="cuit"
              className="form-input"
              placeholder="30-12345678-9"
              {...register('cuit')}
            />
            <div className="form-input-icon">
              <IdentificationIcon aria-hidden />
            </div>
          </div>
          {errors.cuit && <p className="register-error">{errors.cuit.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="institutionType">
            TIPO DE INSTITUCIÓN
          </label>
          <div className="form-input-wrapper">
            <select
              id="institutionType"
              className="form-input form-select"
              {...register('institutionType')}
            >
              <option value="">Selecciona un tipo</option>
              {institutionTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="form-input-icon">
              <ChevronDownIcon aria-hidden />
            </div>
          </div>
          {errors.institutionType && <p className="register-error">{errors.institutionType.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phone">
          TELÉFONO DE CONTACTO
        </label>
        <div className="form-input-wrapper">
          <input
            type="tel"
            id="phone"
            className="form-input"
            placeholder="+54 9 11 1234-5678"
            {...register('phone')}
          />
          <div className="form-input-icon">
            <PhoneIcon aria-hidden />
          </div>
        </div>
        {errors.phone && <p className="register-error">{errors.phone.message}</p>}
      </div>

      <button type="button" className="btn-primary mt-4" onClick={onNextStep}>
        Continuar a Ubicación
      </button>

      <p className="login-footer mt-6">
        ¿Ya tienes una cuenta institucional? <Link href="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}
