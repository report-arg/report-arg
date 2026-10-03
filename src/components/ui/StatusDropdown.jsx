"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check } from "lucide-react";

const DEFAULT_STATUS_OPTIONS = [
  { value: "Todos", label: "Todos los estados", dotColor: "bg-slate-400" },
  { value: "Pendiente", label: "Pendiente", dotColor: "bg-amber-500" },
  { value: "En revisión", label: "En revisión", dotColor: "bg-sky-500" },
  { value: "En proceso", label: "En proceso", dotColor: "bg-indigo-500" },
  { value: "Resuelto", label: "Resuelto", dotColor: "bg-emerald-500" },
  { value: "Cancelado", label: "Cancelado", dotColor: "bg-rose-500" },
];

/**
 * Dropdown accesible y visualmente consistente con CategoryDropdown
 * para la selección y filtrado por estado de reclamos.
 */
const StatusDropdown = forwardRef(function StatusDropdown(
  {
    value = "Todos",
    onChange,
    options = DEFAULT_STATUS_OPTIONS,
    placeholder = "Todos los estados",
    disabled = false,
    className = "",
    triggerClassName = "",
    menuClassName = "",
    id,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera del menú
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botón Disparador */}
      <button
        ref={ref}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-9 flex items-center justify-between gap-2.5 bg-surface border text-xs px-3.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 text-text-primary"
            : "border-border-subtle hover:border-border-strong text-text-secondary"
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption.dotColor && value !== "Todos" && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotColor}`} />
          )}
          <span className="font-semibold text-text-primary truncate">
            {selectedOption.label || placeholder}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Lista de estados"
          className={`absolute top-full mt-1.5 bg-surface rounded-xl shadow-lg border border-border-subtle z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            menuClassName || "right-0 w-[200px]"
          }`}
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-border-subtle">
            {options.map((opt) => {
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-primary-subtle font-bold text-text-primary"
                      : "font-medium text-text-secondary hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {opt.dotColor && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default StatusDropdown;
