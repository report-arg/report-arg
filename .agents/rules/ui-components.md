# Reglas de Componentes Reutilizables de Interfaz (UI)

En todo el frontend de ReportARG (`report-arg`), la consistencia visual y la accesibilidad son estrictas y obligatorias.

## Reglas mandatorias:
1. **Dropdowns y selectores:**
   - **Prohibición estricta de `<select>` nativo de HTML.**
   - Usar siempre `Select` desde `@/components/ui` (`src/components/ui/Select.jsx`) o los dropdowns especializados (`CategoriaDropdown`, `StatusDropdown`, `SortDropdown`).

2. **Botones e interacción:**
   - **Prohibición de botones `<button>` planos con clases Tailwind aisladas.**
   - Usar siempre `Button` desde `@/components/ui` (`src/components/ui/Button.jsx`) con sus variantes semánticas (`primary`, `secondary`, `outline`, etc.), íconos (`leftIcon`, `rightIcon`) y control de estado `loading`.

3. **Modales y Diálogos:**
   - **Prohibición de modales inline creados con divs ad-hoc (`fixed inset-0 ...`).**
   - Para confirmaciones o flujos de guardado/cancelación/eliminación: usar siempre `ConfirmModal` desde `@/components/ui` (`src/components/ui/ConfirmModal.jsx`).
   - Para ventanas emergentes de contenido general: usar siempre `Modal` desde `@/components/ui` (`src/components/ui/Modal.jsx`).

4. **Entradas y Formularios:**
   - Utilizar `Input` y `Textarea` desde `@/components/ui` para garantizar consistencia de bordes, sombras, foco y accesibilidad (`aria-invalid`, `aria-describedby`).

5. **Estados de Datos y Badges:**
   - Utilizar `StatusBadge` y `Badge` para estados, visibilidad y categorías.
   - Utilizar `EmptyState` cuando no existan resultados o registros a mostrar.
