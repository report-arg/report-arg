"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check, Clock, AlertCircle, History, Users } from "lucide-react";

export const DEFAULT_SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes", icon: Clock },
  { value: "atencion", label: "Requieren atención", icon: AlertCircle },
  { value: "antiguos", label: "Más tiempo esperando", icon: History },
  { value: "impacto", label: "Mayor impacto", icon: Users },
];

/**
 * Dropdown accesible y visualmente consistente con CategoryDropdown y StatusDropdown
 * para la selección de ordenamiento de reclamos y publicaciones.
 */
const SortDropdown = forwardRef(function SortDropdown(
  {
    value = "recientes",
    onChange,
    options = DEFAULT_SORT_OPTIONS,
    placeholder = "Ordenar por",
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
  const SelectedIcon = selectedOption?.icon || Clock;

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
          <SelectedIcon size={14} className="text-primary shrink-0" />
          <span className="font-semibold text-text-primary truncate">
            {selectedOption?.label || placeholder}
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
          aria-label="Opciones de ordenamiento"
          className={`absolute top-full mt-1.5 bg-surface rounded-xl shadow-lg border border-border-subtle z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            menuClassName || "right-0 w-[220px]"
          }`}
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-border-subtle">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const OptionIcon = opt.icon || Clock;

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
                  <div className="flex items-center gap-2.5 min-w-0">
                    <OptionIcon
                      size={14}
                      className={`shrink-0 ${
                        isSelected
                          ? "text-primary"
                          : "text-text-muted group-hover:text-text-secondary"
                      }`}
                    />
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

export default SortDropdown;
