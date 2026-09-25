import { ShieldAlert, Eye } from "lucide-react";

export default function ClaimVisibilityBadge({ visibilidad = "publico", className = "" }) {
  const esPrivado = visibilidad === "privado";

  return (
    <span
      className={className}
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "12px",
        backgroundColor: esPrivado ? "#fee2e2" : "#e0f2fe",
        color: esPrivado ? "#991b1b" : "#0369a1",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {esPrivado ? <ShieldAlert size={10} /> : <Eye size={10} />}
      {esPrivado ? "Privado" : "Público"}
    </span>
  );
}
