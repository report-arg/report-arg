import { PASOS_PROGRESO, getEstadoConfig } from "@/utils/claimStatus";

export default function ClaimProgress({ estado }) {
  const config = getEstadoConfig(estado);
  const estadoNormalizado = config.label;

  if (estadoNormalizado === "Cancelado") {
    return (
      <div className="reclamo-progress-row" style={{ marginTop: '12px' }}>
        <span className="mis-reclamos-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          Reclamo cancelado
        </span>

      </div>
    );
  }

  const idx = PASOS_PROGRESO.indexOf(estadoNormalizado);
  return (
    <div className="reclamo-progress-track" style={{ marginTop: '14px' }}>
      {PASOS_PROGRESO.map((paso, i) => (
        <div
          key={paso}
          className={[
            "reclamo-step-item",
            i <= idx ? "done" : "",
            i === idx ? "current" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="reclamo-step-dot" />
          <span className="reclamo-step-label">{paso}</span>
        </div>
      ))}
    </div>
  );
}
