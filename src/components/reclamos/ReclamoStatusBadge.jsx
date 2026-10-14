import { getEstadoConfig } from "@/utils/reclamoStatus";

export default function ReclamoStatusBadge({ estado, className = "" }) {
  const config = getEstadoConfig(estado);

  return (
    <span
      className={`feed-card-badge ${config.cls} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}
