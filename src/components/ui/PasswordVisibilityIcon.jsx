'use client';

// Icono reutilizable para alternar mostrar/ocultar contraseñas en formularios.
export default function PasswordVisibilityIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.58 10.58a2 2 0 102.83 2.83" />
          <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-1 2.23-2.73 4.12-4.92 5.3" />
          <path d="M6.61 6.61C4.62 8 3.18 9.89 2 12c.72 1.62 1.79 3.08 3.11 4.24" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
