"use client";

export default function UsuarioAvatar({ nombre, foto, email, rol }) {
  if (foto) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={foto}
        alt={nombre || email || "Avatar"}
        className="w-9 h-9 rounded-full object-cover border border-border-subtle shrink-0"
      />
    );
  }
  const label = nombre || email?.split("@")[0] || "?";
  const iniciales = label
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bgCls =
    rol === "admin"
      ? "bg-primary/15 text-primary"
      : rol === "institucion"
      ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
      : "bg-surface-subtle text-text-muted";

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-border-subtle/60 ${bgCls}`}
    >
      {iniciales}
    </div>
  );
}
