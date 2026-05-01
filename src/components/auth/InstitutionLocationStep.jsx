import { MapPinIcon } from '@heroicons/react/20/solid';

export default function InstitutionLocationStep({
  register,
  errors,
  isSubmitting,
  setStep,
}) {
  return (
    <div className="animate-fade-in">
      <div className="register-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="provincia">
            PROVINCIA
          </label>
          <div className="form-input-wrapper">
            <select id="provincia" className="form-input form-select" {...register('provincia')}>
              <option value="">Selecciona...</option>
              <option value="Entre Rios">Entre Ríos</option>
            </select>
            <div className="form-input-icon">
              <MapPinIcon aria-hidden />
            </div>
          </div>
          {errors.provincia && <p className="register-error">{errors.provincia.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ciudad">
            CIUDAD
          </label>
          <div className="form-input-wrapper">
            <select id="ciudad" className="form-input form-select" {...register('ciudad')}>
              <option value="">Selecciona...</option>
              <option value="Viale">Viale</option>
            </select>
            <div className="form-input-icon">
              <MapPinIcon aria-hidden />
            </div>
          </div>
          {errors.ciudad && <p className="register-error">{errors.ciudad.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="zona">
          ZONA / BARRIO
        </label>
        <div className="form-input-wrapper">
          <select id="zona" className="form-input form-select" {...register('zona')}>
            <option value="">Selecciona zona...</option>
            <option value="No Aplica">No Aplica</option>
          </select>
          <div className="form-input-icon">
            <MapPinIcon aria-hidden />
          </div>
        </div>
        {errors.zona && <p className="register-error">{errors.zona.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="address">
          DIRECCIÓN EXACTA
        </label>
        <div className="form-input-wrapper">
          <input
            type="text"
            id="address"
            className="form-input"
            placeholder="Ej. Av. San Martín 123, Piso 2"
            {...register('address')}
          />
          <div className="form-input-icon">
            <MapPinIcon aria-hidden />
          </div>
        </div>
        {errors.address && <p className="register-error">{errors.address.message}</p>}
      </div>

      <div className="form-group register-checkbox mt-6">
        <label className="register-checkbox-label">
          <input
            type="checkbox"
            {...register('termsAccepted')}
          />
          <span>Acepto los términos de servicio y la política de privacidad.</span>
        </label>
        {errors.termsAccepted && <p className="register-error">{errors.termsAccepted.message}</p>}
      </div>

      <div className="flex gap-4 mt-6">
        <button type="button" className="btn-secondary mt-0" style={{ width: '35%' }} onClick={() => setStep(2)}>
          Atrás
        </button>
        <button type="submit" className="btn-primary mt-0" style={{ width: '65%' }} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : 'Continuar a verificar correo'}
        </button>
      </div>
    </div>
  );
}
