import { Check, ArrowRight, Lock } from "lucide-react";
import { PASOS_SECUENCIA } from "@/utils/claimTimelineUtils";

function getSegmentClass(segIdx, currentIdx, isTerminalResolved) {
  if (isTerminalResolved) return "bg-emerald-500";
  if (segIdx < currentIdx - 1) return "bg-emerald-500";
  if (segIdx === currentIdx - 1) return "bg-primary";
  return "bg-border-subtle";
}

export default function ClaimTimeline({ 
  estadoActual, 
  tiempoEnEstado = "",
  variant = "citizen", // "citizen" o "institution"
  onStepClick = () => {} 
}) {
  const currentStepIdx = PASOS_SECUENCIA.findIndex(p => p.key === estadoActual);
  const isTerminalResolved = estadoActual === 'Resuelto';
  const isInteractive = variant === "institution";

  return (
    <>
      {/* Desktop Stepper */}
      <div className={`hidden sm:block ${isInteractive ? 'py-4' : 'py-1.5'}`}>
        <div className={`relative ${isInteractive ? 'grid grid-cols-4 gap-2 sm:gap-6' : 'flex items-center justify-between'}`}>
          
          {/* Línea conectora */}
          <div className={`absolute z-0 pointer-events-none ${isInteractive ? 'top-[18px] -translate-y-1/2 left-0 right-0 h-0.5' : 'left-6 right-6 top-4 -translate-y-1/2 flex items-center'}`}>
            {isInteractive ? (
              [0, 1, 2].map((segIdx) => {
                const leftPositions = ["12.5%", "37.5%", "62.5%"];
                const segColor = getSegmentClass(segIdx, currentStepIdx, isTerminalResolved);
                return (
                  <div
                    key={segIdx}
                    className={`absolute top-0 h-0.5 transition-colors duration-300 ${segColor}`}
                    style={{ left: leftPositions[segIdx], width: "25%" }}
                  />
                );
              })
            ) : (
              PASOS_SECUENCIA.slice(0, -1).map((_, segIdx) => {
                const isCompletedSeg = isTerminalResolved || segIdx < currentStepIdx;
                return (
                  <div
                    key={segIdx}
                    className={`flex-1 h-0.5 transition-colors ${
                      isCompletedSeg ? 'bg-emerald-500' : 'bg-border-subtle'
                    }`}
                  />
                );
              })
            )}
          </div>

          {/* Pasos */}
          {PASOS_SECUENCIA.map((paso, idx) => {
            const isCompleted = isTerminalResolved || (currentStepIdx >= 0 && idx < currentStepIdx);
            const isCurrent = !isTerminalResolved && idx === currentStepIdx;
            const isFuture = currentStepIdx === -1 || idx > currentStepIdx;
            
            // Para institution:
            const isNext = !isTerminalResolved && idx === currentStepIdx + 1;
            const isLocked = !isTerminalResolved && idx > currentStepIdx + 1;

            if (isInteractive) {
              return (
                <div
                  key={paso.key}
                  role={isNext ? "button" : undefined}
                  tabIndex={isNext ? 0 : undefined}
                  aria-label={isNext ? `Avanzar reclamo a estado ${paso.label}` : undefined}
                  onClick={() => isNext && onStepClick(paso.key)}
                  onKeyDown={(e) => {
                    if (isNext && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onStepClick(paso.key);
                    }
                  }}
                  className={`flex flex-col items-center text-center transition-all z-10 ${
                    isNext
                      ? 'cursor-pointer group hover:bg-primary-subtle/25 rounded-xl px-2 pb-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary'
                      : 'px-2 pb-2'
                  }`}
                >
                  <div className="relative z-10">
                    {isCompleted && (
                      <span className="w-9 h-9 rounded-full bg-surface border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xs">
                        <Check size={16} strokeWidth={2.5} />
                      </span>
                    )}
                    {isCurrent && (
                      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-primary/20">
                        <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                        <span className="relative w-3 h-3 rounded-full bg-white" />
                      </span>
                    )}
                    {isNext && (
                      <span className="w-9 h-9 rounded-full bg-surface border-2 border-primary/40 group-hover:border-primary group-hover:bg-primary-subtle text-primary/70 group-hover:text-primary flex items-center justify-center shadow-xs transition-all">
                        <ArrowRight size={15} strokeWidth={2.2} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                    {isLocked && (
                      <span className="w-9 h-9 rounded-full bg-surface border border-border-subtle text-text-muted/60 flex items-center justify-center">
                        <Lock size={13} />
                      </span>
                    )}
                  </div>
                  <h4 className={`mt-2.5 text-sm leading-tight ${
                    isCurrent ? 'font-bold text-primary' : isNext ? 'font-semibold text-text-primary group-hover:text-primary transition-colors' : isCompleted ? 'font-medium text-text-secondary' : 'font-normal text-text-muted'
                  }`}>
                    {paso.label}
                  </h4>
                  <div className="mt-1">
                    {isCompleted && <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">Completado</span>}
                    {isCurrent && <span className="text-[11px] font-bold text-primary bg-primary-subtle px-2.5 py-0.5 rounded-full border border-primary/30 shadow-2xs">Actual</span>}
                    {isNext && (
                      <span className="text-[11px] font-semibold text-primary bg-primary-subtle/60 group-hover:bg-primary group-hover:text-white px-2.5 py-0.5 rounded-full border border-primary/30 transition-all inline-flex items-center gap-1 shadow-2xs">
                        <span>Siguiente</span>
                        <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                    {isLocked && <span className="text-[11px] text-text-muted">Bloqueado</span>}
                  </div>
                </div>
              );
            }

            return (
              <div key={paso.key} className="flex flex-col items-center text-center z-10 w-28">
                <div className="relative">
                  {isCompleted && (
                    <span className="w-8 h-8 rounded-full bg-surface border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xs">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                  )}
                  {isCurrent && (
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-primary/20">
                      <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                      <span className="relative w-2.5 h-2.5 rounded-full bg-white" />
                    </span>
                  )}
                  {isFuture && (
                    <span className="w-8 h-8 rounded-full bg-surface border border-border-subtle text-text-muted/40 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-border-subtle" />
                    </span>
                  )}
                </div>
                <span className={`mt-1.5 text-xs leading-tight ${
                  isCurrent ? 'font-bold text-primary' : isCompleted ? 'font-semibold text-text-primary' : 'font-normal text-text-muted'
                }`}>
                  {paso.label}
                </span>
                <span className={`mt-0.5 text-[10px] ${isCurrent ? 'text-primary font-medium' : 'text-text-muted'}`}>
                  {isCurrent ? (tiempoEnEstado ? `Actual · ${tiempoEnEstado}` : 'Actual') : isCompleted ? 'Completado' : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden space-y-1 py-1">
        {PASOS_SECUENCIA.map((paso, idx, arr) => {
          const isCompleted = isTerminalResolved || (currentStepIdx >= 0 && idx < currentStepIdx);
          const isCurrent = !isTerminalResolved && idx === currentStepIdx;
          const isFuture = currentStepIdx === -1 || idx > currentStepIdx;
          const isLast = idx === arr.length - 1;
          
          const isNext = !isTerminalResolved && idx === currentStepIdx + 1;
          const isLocked = !isTerminalResolved && idx > currentStepIdx + 1;
          const segColorInteractive = !isLast ? getSegmentClass(idx, currentStepIdx, isTerminalResolved) : '';
          const segColorCitizen = isCompleted ? 'bg-emerald-500' : 'bg-border-subtle';

          if (isInteractive) {
            return (
              <div
                key={paso.key}
                role={isNext ? "button" : undefined}
                tabIndex={isNext ? 0 : undefined}
                aria-label={isNext ? `Avanzar reclamo a estado ${paso.label}` : undefined}
                onClick={() => isNext && onStepClick(paso.key)}
                onKeyDown={(e) => {
                  if (isNext && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onStepClick(paso.key);
                  }
                }}
                className={`flex items-center gap-3.5 py-1.5 px-2 rounded-xl transition-all ${
                  isNext ? 'cursor-pointer hover:bg-primary-subtle/25 active:bg-primary-subtle/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary' : ''
                }`}
              >
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div className="relative z-10">
                    {isCompleted && (
                      <span className="w-8 h-8 rounded-full bg-surface border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xs">
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                    )}
                    {isCurrent && (
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-primary/20">
                        <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                        <span className="relative w-2.5 h-2.5 rounded-full bg-white" />
                      </span>
                    )}
                    {isNext && (
                      <span className="w-8 h-8 rounded-full bg-surface border-2 border-primary/40 text-primary flex items-center justify-center shadow-xs">
                        <ArrowRight size={14} strokeWidth={2.2} />
                      </span>
                    )}
                    {isLocked && (
                      <span className="w-8 h-8 rounded-full bg-surface border border-border-subtle text-text-muted/60 flex items-center justify-center">
                        <Lock size={12} />
                      </span>
                    )}
                  </div>
                  {!isLast && <div className={`w-0.5 h-6 my-1 transition-colors ${segColorInteractive}`} />}
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className={`text-sm ${
                    isCurrent ? 'font-bold text-primary' : isCompleted ? 'font-medium text-text-secondary' : isNext ? 'font-semibold text-text-primary' : 'font-normal text-text-muted'
                  }`}>
                    {paso.label}
                  </span>
                  <div>
                    {isCompleted && <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">Completado</span>}
                    {isCurrent && <span className="text-[11px] font-bold text-primary bg-primary-subtle px-2.5 py-0.5 rounded-full border border-primary/30 shadow-2xs">Actual</span>}
                    {isNext && (
                      <span className="text-[11px] font-semibold text-primary bg-primary-subtle/60 px-2.5 py-0.5 rounded-full border border-primary/30 inline-flex items-center gap-1 shadow-2xs">
                        <span>Siguiente</span>
                        <ArrowRight size={10} />
                      </span>
                    )}
                    {isLocked && <span className="text-[11px] text-text-muted">Bloqueado</span>}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={paso.key} className="flex items-center gap-3.5 py-1 px-1">
              <div className="flex flex-col items-center w-8 shrink-0">
                <div className="relative z-10">
                  {isCompleted && (
                    <span className="w-7 h-7 rounded-full bg-surface border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xs">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                  )}
                  {isCurrent && (
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-4 ring-primary/20">
                      <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                      <span className="relative w-2 h-2 rounded-full bg-white" />
                    </span>
                  )}
                  {isFuture && (
                    <span className="w-7 h-7 rounded-full bg-surface border border-border-subtle text-text-muted/40 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                    </span>
                  )}
                </div>
                {!isLast && <div className={`w-0.5 h-4 my-1 transition-colors ${segColorCitizen}`} />}
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`text-xs ${
                  isCurrent ? 'font-bold text-primary' : isCompleted ? 'font-medium text-text-secondary' : 'font-normal text-text-muted'
                }`}>
                  {paso.label}
                </span>
                <span className={`text-[10px] ${
                  isCompleted ? 'text-emerald-700 dark:text-emerald-400' : isCurrent ? 'font-bold text-primary' : 'text-text-muted'
                }`}>
                  {isCurrent ? (tiempoEnEstado ? `Actual · ${tiempoEnEstado}` : 'Actual') : isCompleted ? 'Completado' : 'Pendiente'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
