'use client';

// Aviso inline reutilizable para mostrar mensajes de advertencia o validación.
export default function InlineNotice({ show, message, className = '' }) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className={`mx-auto mt-6 flex w-full max-w-[560px] items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm ${className}`.trim()}
    >
      <span className="text-base leading-none" aria-hidden="true">
        ⚠️
      </span>
      <p className="text-sm sm:text-[0.95rem] leading-snug text-left">{message}</p>
    </div>
  );
}
