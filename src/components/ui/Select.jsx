"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Componente Select desplegable estilizado y reutilizable para ReportARG.
 * Reemplaza el selector nativo del sistema operativo por un menú redondeado,
 * accesible y coherente con el sistema de diseño (Light/Dark mode).
 *
 * @param {Object} props
 * @param {string} [props.label] - Etiqueta superior opcional
 * @param {string|number} props.value - Valor seleccionado actual
 * @param {function} props.onChange - Callback cuando cambia el valor: (value) => void
 * @param {Array<string|number|{value: string|number, label: string}>} props.options - Lista de opciones
 * @param {string} [props.placeholder] - Texto por defecto cuando no hay valor seleccionado
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className] - Clases para el botón trigger
 * @param {string} [props.containerClassName] - Clases para el contenedor exterior
 * @param {string} [props.id] - ID accesible opcional
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
  containerClassName = "",
  id: externalId,
}) {
  const generatedId = useId();
  const selectId = externalId || generatedId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  // Normalizar opciones a objetos { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label || opt.nombre || String(opt.value),
      };
    }
    return { value: opt, label: String(opt) };
  });

  // Encontrar opción seleccionada
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Cerrar al hacer clic fuera del contenedor
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Manejar navegación por teclado
  function handleKeyDown(e) {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? normalizedOptions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  }

  // Scroll automático a la opción resaltada
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  function handleSelect(val) {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${containerClassName}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className="block text-[11px] font-semibold text-text-muted mb-1"
        >
          {label}
        </label>
      )}

      {/* Botón Trigger Desplegable */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={label ? `${selectId}-label ${selectId}` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full h-9 rounded-xl border bg-surface px-3 py-1.5 text-xs text-left transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs select-none ${
          disabled
            ? "border-border-subtle/50 text-text-muted/50 cursor-not-allowed bg-surface-subtle/40"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 text-text-primary"
            : "border-border-subtle text-text-primary hover:border-border hover:bg-surface-subtle/30 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        } ${className}`}
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Flechita estilizada que rota suavemente */}
        <ChevronDown
          size={14}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menú Desplegable Flotante Redondeado */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          ref={listRef}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-border-subtle bg-surface p-1 shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={`${opt.value}-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center justify-between gap-2 select-none ${
                  isSelected
                    ? "bg-primary-subtle text-primary font-semibold"
                    : isHighlighted
                    ? "bg-surface-subtle text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={13} className="text-primary shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
