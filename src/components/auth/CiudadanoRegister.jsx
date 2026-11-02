'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MapPinIcon,
  UserIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';

import { PROVINCIAS_AR } from '@/utils/constants';
import { citizenRegisterSchema } from '@/utils/schemas';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import Image from 'next/image';
import Combobox from '@/components/ui/Combobox';

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  provincia: '',
  ciudad: '',
  zona: '',
  acceptTerms: false,
};

export default function CiudadanoRegister() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localidadesOptions, setLocalidadesOptions] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(citizenRegisterSchema),
    mode: 'onTouched',
    defaultValues: initialForm,
  });

  const provinciaSeleccionada = watch('provincia');
  const ciudadSeleccionada = watch('ciudad');

  // Cargar localidades oficiales del backend al cambiar la provincia
  useEffect(() => {
    if (!provinciaSeleccionada) {
      setLocalidadesOptions([]);
      return;
    }

    let isMounted = true;
    setLoadingLocalidades(true);

    authService
      .getLocalidades({ provincia: provinciaSeleccionada, limit: 300 })
      .then((res) => {
        if (!isMounted) return;
        const lista = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const formatted = lista.map((loc) => ({
          value: loc.nombre,
          label: loc.nombre,
          activa: Boolean(loc.activa),
        }));
        setLocalidadesOptions(formatted);
      })
      .catch((err) => {
        console.error('Error al cargar localidades:', err);
        if (isMounted) setLocalidadesOptions([]);
      })
      .finally(() => {
        if (isMounted) setLoadingLocalidades(false);
      });

    return () => {
      isMounted = false;
    };
  }, [provinciaSeleccionada]);

  const localidadElegidaObj = localidadesOptions.find(
    (l) => l.value.trim().toLowerCase() === String(ciudadSeleccionada || '').trim().toLowerCase()
  );

  const onSubmit = async (data) => {
    setServerError('');

    try {
      const res = await authService.registerCitizen(data);
      const ciudadActivaParam = res?.ciudad_activa === false ? '0' : '1';

      if (res?.ciudad_activa === false) {
        toast.info(
          `Tu cuenta fue registrada con residencia en ${data.ciudad}, pero esa localidad aún no está activa. Verificá tu correo para solicitar su activación o continuar como visitante.`
        );
      } else {
        toast.success('Registro exitoso. Te enviamos un código de verificación.');
      }

      setTimeout(() => {
        const params = new URLSearchParams({
          email: data.email,
          type: 'citizen',
          ciudadActiva: ciudadActivaParam,
          ciudad: data.ciudad,
          provincia: data.provincia,
        });
        router.push(`/verify?${params.toString()}`);
      }, 1500);
    } catch (error) {
      setServerError(error.response?.data?.error || error.message || 'Ocurrió un error al registrar ciudadano');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <Image src="/logo.png" alt="logo-reportarg" className="login-logo-img" width={250} height={60} unoptimized />
        <div className="login-left-content">
          <h1 className="login-title">
            Construyendo una
            <br />
            comunidad más
            <br />
            segura.
          </h1>
          <p className="login-description">
            Registrate como ciudadano para reportar incidentes y dar seguimiento a tus alertas.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <Image src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" width={180} height={40} unoptimized />
            <p className="login-logo-mobile-subtitle">Registro ciudadano</p>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Crear cuenta ciudadana</h2>
            <p className="login-form-subtitle">Completa tus datos personales y ubicación.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">NOMBRE <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="nombre" className="form-input" placeholder="Ej. Ana" {...register('nombre')} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.nombre && <p className="register-error">{errors.nombre.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="apellido">APELLIDO <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="apellido" className="form-input" placeholder="Ej. García" {...register('apellido')} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.apellido && <p className="register-error">{errors.apellido.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="ejemplo@correo.com" {...register('email')} />
                <div className="form-input-icon"><EnvelopeIcon aria-hidden /></div>
              </div>
              {errors.email && <p className="register-error">{errors.email.message}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="password">CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" className="form-input has-left-icon" placeholder="••••••••" {...register('password')} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.password && <p className="register-error">{errors.password.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-input has-left-icon" placeholder="••••••••" {...register('confirmPassword')} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="provincia">PROVINCIA <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select
                    id="provincia"
                    className="form-input form-select"
                    {...register('provincia', {
                      onChange: () => setValue('ciudad', '', { shouldValidate: true }),
                    })}
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.provincia && <p className="register-error">{errors.provincia.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">CIUDAD DE RESIDENCIA <span className="form-required">*</span></label>
                <Combobox
                  id="ciudad"
                  value={ciudadSeleccionada}
                  onChange={(val) => setValue('ciudad', val, { shouldValidate: true, shouldDirty: true })}
                  options={localidadesOptions}
                  placeholder={provinciaSeleccionada ? 'Seleccionar o buscar localidad...' : 'Primero elegí provincia'}
                  searchPlaceholder="Escribí para buscar localidad..."
                  disabled={!provinciaSeleccionada}
                  loading={loadingLocalidades}
                  error={errors.ciudad?.message}
                />
              </div>
            </div>

            {ciudadSeleccionada && localidadElegidaObj && localidadElegidaObj.activa === false && (
              <div className="mb-4 p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs leading-relaxed">
                <strong>{ciudadSeleccionada}</strong> aún no se encuentra activa en ReportARG. Podés registrarte con tu residencia real y luego <strong>solicitar su activación</strong> o explorar otra ciudad activa como visitante.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="zona">ZONA <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="text" id="zona" className="form-input" placeholder="Centro" {...register('zona')} />
                <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
              </div>
              {errors.zona && <p className="register-error">{errors.zona.message}</p>}
            </div>

            <label className="register-checkbox">
              <input type="checkbox" {...register('acceptTerms')} />
              <span>Acepto los términos y condiciones <span className="form-required">*</span></span>
            </label>
            {errors.acceptTerms && <p className="register-error">{errors.acceptTerms.message}</p>}

            {serverError && <p className="register-error">{serverError}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>

            <p className="login-footer">
              ¿Representás una organización? <Link href="/register/institution">Registrate como institución</Link>
            </p>
            <p className="login-footer">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}