import { ShieldAlert, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";

/**
 * Badge de visibilidad para reclamos (Público / Privado).
 * Utiliza el componente base Badge para consistencia tipográfica,
 * de padding y de radios en toda la aplicación.
 */
export default function ClaimVisibilityBadge({ visibilidad = "publico", size = "sm", className = "" }) {
  const esPrivado = visibilidad === "privado";

  return (
    <Badge
      variant={esPrivado ? "danger" : "info"}
      size={size}
      className={className}
      icon={
        esPrivado ? (
          <ShieldAlert size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
        ) : (
          <Eye size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
        )
      }
    >
      {esPrivado ? "Privado" : "Público"}
    </Badge>
  );
}
