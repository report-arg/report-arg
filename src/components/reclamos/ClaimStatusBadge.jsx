import { getEstadoConfig } from "@/utils/claimStatus";

export default function ClaimStatusBadge({ estado, className = "" }) {
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
