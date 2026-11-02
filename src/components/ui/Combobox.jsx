"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import Badge from "./Badge";

/**
 * Componente Combobox con buscador accesible y estilizado para ReportARG.
 * Permite seleccionar o buscar opciones con filtrado rápido en vivo, soporte
 * para badges informativos (ej. Activa / Próximamente) y navegación por teclado.
 *
 * @param {Object} props
 * @param {string} [props.label] - Etiqueta superior
 * @param {string} props.value - Valor seleccionado
 * @param {function} props.onChange - Callback al seleccionar valor: (value, option) => void
 * @param {Array<{value: string, label: string, activa?: boolean, badgeText?: string}>} props.options - Lista de opciones
 * @param {string} [props.placeholder='Seleccionar...'] - Placeholder
 * @param {string} [props.searchPlaceholder='Buscar...'] - Placeholder del campo de búsqueda
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.loading=false]
 * @param {string} [props.error] - Mensaje de error accesible
 * @param {string} [props.className] - Clases para el trigger
 * @param {string} [props.containerClassName] - Clases para el contenedor exterior
 * @param {string} [props.id] - ID accesible opcional
 */
export default function Combobox({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  searchPlaceholder = "Escribí para buscar...",
  disabled = false,
  loading = false,
  error,
  className = "",
  containerClassName = "",
  id: externalId,
}) {
  const generatedId = useId();
  const comboboxId = externalId || generatedId;
  const listboxId = `${comboboxId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalizar opciones
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value !== undefined ? String(opt.value) : String(opt.id || opt.nombre),
        label: opt.label || opt.nombre || String(opt.value),
        activa: opt.activa,
        badgeText: opt.badgeText,
      };
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value).trim().toLowerCase() === String(value || "").trim().toLowerCase()
  );

  // Filtrado local según searchTerm
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm.trim()) return true;
    return opt.label.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Enfocar el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Manejo de teclado
  function handleKeyDown(e) {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      triggerRef.current?.focus();
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setSearchTerm("");
    }
  }

  // Scroll a la opción resaltada
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  function handleSelect(option) {
    onChange?.(option.value, option);
    setIsOpen(false);
    setSearchTerm("");
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
          id={`${comboboxId}-label`}
          htmlFor={comboboxId}
          className="block text-[11px] font-semibold text-text-muted mb-1"
        >
          {label}
        </label>
      )}

      {/* Botón Trigger idéntico a los inputs del formulario */}
      <button
        ref={triggerRef}
        id={comboboxId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={label ? `${comboboxId}-label ${comboboxId}` : undefined}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          minHeight: "46px",
          padding: "0.875rem 1rem",
          borderRadius: "0.5rem",
          fontSize: "1rem",
        }}
        className={`w-full border bg-white text-left transition-all flex items-center justify-between gap-2 select-none ${
          disabled
            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
            : isOpen
            ? "border-blue-600 ring-2 ring-blue-600/20 text-gray-900 cursor-pointer"
            : error
            ? "border-red-500 text-gray-900 cursor-pointer"
            : "border-gray-200 text-gray-900 hover:border-gray-300 cursor-pointer"
        } ${className}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              <span className="truncate font-normal">{selectedOption.label}</span>
              {selectedOption.activa !== undefined && (
                <Badge
                  variant={selectedOption.activa ? "success" : "neutral"}
                  size="sm"
                >
                  {selectedOption.activa ? "Activa" : "Próximamente"}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-[#aab] font-normal">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menú Desplegable con Campo de Búsqueda */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? `${comboboxId}-label` : undefined}
          className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-border-subtle bg-surface p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col gap-1.5"
          style={{ minWidth: "260px" }}
        >
          {/* Input de Búsqueda Integrado */}
          <div className="relative flex items-center px-2 py-1 bg-surface-subtle/70 rounded-xl border border-border-subtle">
            <Search size={14} className="text-text-muted shrink-0 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-text-muted hover:text-text-primary p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Lista de Resultados */}
          <div ref={listRef} className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
            {loading ? (
              <div className="p-4 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>Cargando localidades…</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-text-muted">
                {searchTerm
                  ? `No se encontraron localidades con "${searchTerm}"`
                  : "No hay localidades disponibles"}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  String(opt.value).trim().toLowerCase() ===
                  String(value || "").trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.activa !== undefined && (
                        <Badge
                          variant={opt.activa ? "success" : "neutral"}
                          size="sm"
                        >
                          {opt.activa ? "Activa" : "Próximamente"}
                        </Badge>
                      )}
                      {isSelected && (
                        <Check size={13} className="text-primary" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
