"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { getCategoryIcon } from "@/components/brand/icons";

/**
 * Componente modular y reutilizable para selección de categorías en ReportARG.
 * Diseñado con soporte de iconos oficiales dinámicos, light/dark mode,
 * opciones para filtros ("Todas las categorías") y formularios de creación/edición.
 *
 * @param {Object} props
 * @param {Array} props.categorias - Lista de categorías [{ id, nombre, codigo, ... }]
 * @param {string|number|null} props.value - ID de la categoría seleccionada (null si no hay o si es "todas")
 * @param {function} props.onChange - Callback al seleccionar: (catId, catObject) => void
 * @param {string} [props.placeholder="Seleccioná una categoría..."] - Texto cuando no hay selección
 * @param {boolean} [props.showAllOption=false] - Si es true, añade "Todas las categorías" (id: null)
 * @param {string} [props.allOptionLabel="Todas las categorías"] - Etiqueta para la opción general
 * @param {string|boolean} [props.error] - Mensaje o flag de error de validación
 * @param {boolean} [props.loading=false] - Indicador de carga
 * @param {boolean} [props.disabled=false] - Deshabilitar interacción
 * @param {string} [props.className=""] - Clases adicionales para el contenedor exterior
 * @param {string} [props.triggerClassName=""] - Clases para el botón disparador
 * @param {string} [props.menuClassName=""] - Clases para el menú desplegable (por ej. 'right-0' o 'left-0')
 * @param {string} [props.id] - ID accesible para el botón disparador
 */
const CategoryDropdown = forwardRef(function CategoryDropdown(
  {
    categorias = [],
    value = null,
    onChange,
    placeholder = "Seleccioná una categoría...",
    showAllOption = false,
    allOptionLabel = "Todas las categorías",
    error = null,
    loading = false,
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

  // Cerrar al hacer clic fuera del contenedor
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar categoría seleccionada
  const selectedCat =
    value !== null && value !== undefined
      ? categorias.find((c) => String(c.id) === String(value))
      : null;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 p-3 text-xs text-text-muted bg-surface border border-border-subtle rounded-xl ${className}`}>
        <Loader2 size={14} className="animate-spin text-primary" />
        <span>Cargando categorías...</span>
      </div>
    );
  }

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
          error
            ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 text-text-primary"
            : "border-border-subtle hover:border-border-strong text-text-secondary"
        } ${triggerClassName}`}
      >
        {selectedCat ? (
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const SelectedIcon = getCategoryIcon(
                selectedCat.codigo || selectedCat.nombre,
                selectedCat.nombre
              );
              return <SelectedIcon size={14} className="text-primary shrink-0" />;
            })()}
            <span className="font-semibold text-text-primary truncate">
              {selectedCat.nombre}
            </span>
          </div>
        ) : (
          <span className="font-semibold text-text-primary truncate">
            {placeholder}
          </span>
        )}

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
          aria-label="Lista de categorías"
          className={`absolute top-full mt-1.5 bg-surface rounded-xl shadow-lg border border-border-subtle z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            menuClassName || "left-0 w-full"
          }`}
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain divide-y divide-border-subtle">
            {showAllOption && (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => {
                  onChange?.(null, null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors cursor-pointer ${
                  value === null
                    ? "bg-surface-subtle font-bold text-text-primary"
                    : "font-medium text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                <span>{allOptionLabel}</span>
                {value === null && <Check size={14} className="text-primary" />}
              </button>
            )}

            {categorias.map((cat) => {
              const CategoryIcon = getCategoryIcon(
                cat.codigo || cat.nombre,
                cat.nombre
              );
              const isSelected =
                value !== null &&
                value !== undefined &&
                String(value) === String(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.(cat.id, cat);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-primary-subtle font-bold text-text-primary"
                      : "font-medium text-text-secondary hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon
                      size={15}
                      className={`shrink-0 ${
                        isSelected
                          ? "text-primary"
                          : "text-text-muted group-hover:text-text-secondary"
                      }`}
                    />
                    <span className="truncate">{cat.nombre}</span>
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

export default CategoryDropdown;
