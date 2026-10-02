# Instrucciones para agentes — ReportARG Frontend

Este archivo se aplica a todo el repositorio. Antes de trabajar, leé la solicitud, inspeccioná los archivos afectados y comprobá el estado de la rama. No supongas que el README refleja todas las rutas actuales: el código es la referencia para la implementación vigente.

## Contexto y fuentes

ReportARG es una plataforma de participación ciudadana con experiencias separadas para ciudadanos, instituciones y administración. El frontend usa Next.js App Router, React, JavaScript/JSX y Tailwind CSS.

- Las rutas están en `src/app/`. Las experiencias actuales se organizan principalmente en `/ciudadano`, `/institucion` y `/admin`.
- Los componentes compartidos están en `src/components/`; las composiciones de navegación están en `src/components/layout/`.
- Las llamadas a la API usan `src/services/apiClient.js`, que agrega `/api` a `NEXT_PUBLIC_API_URL` e incorpora el token de sesión en el cliente.
- La autenticación usa NextAuth. Revisá `src/app/api/auth/[...nextauth]/route.js` y `src/middleware.js` antes de cambiar acceso o redirecciones.
- La identidad visual está en `src/components/brand/`, `src/styles/brand.css` y la página interna `/identidad-visual`. Los iconos de categorías se resuelven con un fallback para códigos desconocidos.
- Las decisiones de dominio y base de datos se documentan en el repositorio backend, especialmente `docs/arquitectura_y_reglas.md` y `docs/sprint4_reclamos.md`. Contrastá esas decisiones con los endpoints implementados antes de usar un dato.

## Cómo trabajar

1. Partí de la rama indicada en la tarea. Si no se especifica una, verificá primero la rama y los cambios locales; no sobrescribas trabajo ajeno ni hagas merge por tu cuenta.
2. Identificá si el componente es compartido entre roles. Si el cambio corresponde a un solo rol, evitá alterar las otras experiencias.
3. Seguí las convenciones del área que editás. Preferí componentes y utilidades reutilizables cuando exista repetición real; evitá refactorizaciones amplias ajenas a la tarea.
4. Usá endpoints y campos confirmados en el backend. No inventes respuestas, cifras ni permisos. Los ejemplos de la página de catálogo deben quedar señalados como muestras.
5. Mantené separados los reclamos ciudadanos y los comunicados institucionales. No presentes acciones o estados de uno como si pertenecieran al otro.
6. Para reclamos, respetá los estados actuales (`Pendiente`, `En revisión`, `En proceso`, `Resuelto`, `Cancelado`) y el control de visibilidad público/privado. Revisá `src/utils/claimStatus.js` y el backend antes de modificar transiciones o textos de negocio.
7. No tomes IDs de usuario o ciudad enviados desde el navegador como autoridad para operaciones protegidas. El backend debe derivarlos de la autenticación.
8. Las categorías son datos administrables. Resolvé su icono por código estable cuando esté disponible y usá el icono general para códigos nuevos o desconocidos; no dependas exclusivamente del nombre visible.
9. Conservá los tokens visuales y el contraste. Usá los iconos propios para elementos distintivos de ReportARG y Lucide para acciones universales. No introduzcas emojis como iconografía de la interfaz.
10. Cuidá estados de carga, error y vacío, navegación por teclado, nombres accesibles y presentación mobile. No ocultes un error de API mostrándolo como una lista vacía.
11. **Layout y Consistencia:** Confiá en el componente `AppShell` o los layouts principales para los márgenes y restricciones de ancho (`max-w`). Evitá aplicar anchos fijos o restricciones locales en las vistas internas para asegurar que la app escale de forma consistente.
12. **Optimistic UI:** Para interacciones rápidas (ej. botones de acciones rápidas o toggles como "A mí también me pasa"), implementá "Optimistic UI" (actualizar el estado visual inmediatamente y revertirlo si la llamada a la API falla) para dar una sensación de mayor velocidad.

## Verificación

Ejecutá las comprobaciones pertinentes al cambio:

```bash
npm run lint
npm test -- --runInBand
npm run build
```

Si una comprobación falla por un problema previo o por falta de configuración externa, distinguí ese fallo de los cambios realizados. Al entregar, resumí archivos modificados, decisiones, pruebas ejecutadas y dependencias pendientes del backend. No afirmes que una funcionalidad está integrada si solo preparaste su interfaz.

## Idioma y comunicación

- Escribí siempre en español los comentarios de código, mensajes de commit, descripciones de PR, respuestas, documentación y cualquier otra redacción.
- Conservá en inglés los nombres técnicos, APIs, comandos, archivos e identificadores cuando lo requiera la tecnología o sea la convención existente del proyecto. No renombres elementos solo para traducirlos.
- Explicá las decisiones relevantes y las limitaciones con lenguaje claro. Distinguí lo implementado, lo verificado y lo pendiente.

## Documentación

- Revisá si los cambios requieren actualizar el `README.md` y hacelo cuando cambien la instalación, configuración, comandos, rutas principales o funcionamiento descrito.
- Actualizá `docs/arquitectura_y_reglas.md` del backend cuando cambien decisiones de arquitectura, reglas generales, permisos o contratos entre frontend y backend.
- Actualizá `docs/sprint4_reclamos.md` cuando el cambio afecte reglas o comportamientos del módulo de reclamos.
- Evitá duplicar explicaciones en varios documentos: mantené una fuente principal y enlazala desde los demás.
- Si la documentación contradice el código, identificá la diferencia y resolvela según la tarea y las decisiones confirmadas. No cambies una regla de negocio solo para hacerla coincidir con una implementación.
- No describas como implementada una funcionalidad que todavía sea una propuesta.

## Calidad y mantenimiento

- Reutilizá componentes, servicios, constantes y utilidades existentes antes de crear otros equivalentes.
- Separá responsabilidades y extraé código compartido cuando exista repetición real. Evitá abstracciones innecesarias.
- Conservá las convenciones del proyecto y evitá cambios masivos de formato o nombres ajenos a la tarea.
- Agregá dependencias únicamente cuando aporten una solución necesaria y no exista una alternativa adecuada en el proyecto.
- Revisá el diff final: eliminá imports sin uso, código temporal, logs de depuración y archivos generados que no deban versionarse.
- No incluyas secretos, credenciales ni contenido de archivos `.env` en commits, documentación o respuestas.
- Antes de entregar, comprobá que los cambios no rompan otros roles, consumidores de la API o flujos relacionados.

## Diseño responsive y accesibilidad

- Toda pantalla o componente visual nuevo o modificado debe tener diseño responsive.
- Verificá mobile, tablet y escritorio, incluyendo pantallas angostas, textos largos y contenido variable. Evitá desbordamientos horizontales.
- Comprobá formularios, navegación, tarjetas, tablas y modales. Las acciones deben seguir siendo accesibles y utilizables en cada tamaño.
- Usá elementos semánticos, etiquetas de formulario, nombres accesibles para botones con iconos y foco visible. No dependas exclusivamente del color o del hover para comunicar información.
- Respetá los temas claro y oscuro cuando el componente participe de ambos.
- Diferenciá carga, error y ausencia de resultados. Una petición fallida no debe mostrarse como “no hay datos”.
- No permitas envíos duplicados mientras una operación esté en curso y conservá los datos del formulario cuando una solicitud falle.

## Componentes UI Reutilizables (`src/components/ui/`)

Toda la interfaz debe mantener consistencia visual, accesible y responsive. Antes de crear diálogos o etiquetas inline, usá obligatoriamente los componentes del catálogo base:

1. **`Button` (`src/components/ui/Button.jsx`)**:
   - **Uso prioritario** para acciones interactivas y botones de navegación.
   - Respeta `BUTTON_HIERARCHY`:
     - `variant`: `'primary'`, `'secondary'`, `'outline'`, `'ghost'`, `'danger'`, `'danger-soft'`, `'success'`, `'success-soft'`.
     - `size`: `'sm'`, `'md'`, `'lg'`, `'icon'`.
     - `loading`: boolean (muestra spinner animado y deshabilita clics duplicados).
     - `href`: si se especifica, renderiza un `Link` de Next.js con los mismos estilos de botón.
     - `leftIcon` y `rightIcon`.

2. **`Input` (`src/components/ui/Input.jsx`)** y **`Textarea` (`src/components/ui/Textarea.jsx`)**:
   - Campos de formulario con labels accesibles, iconografía izquierda/derecha, estados de error (`aria-invalid`) y textos de ayuda.
   - `Textarea` incluye opción de `showCount` y `maxLength`.

3. **`ConfirmModal` (`src/components/ui/ConfirmModal.jsx`)**:
   - **Uso obligatorio** para diálogos de confirmación o acciones críticas (cambios de estado, bajas/eliminaciones, cancelaciones, resoluciones institucionales y formularios modales de confirmación).
   - **NO crear modales inline** con `fixed inset-0` y divs ad-hoc.
   - **Props clave**:
     - `isOpen`: boolean
     - `onClose`: () => void (se deshabilita automáticamente mientras `loading` está activo)
     - `onConfirm`: (e) => void | Promise<void>
     - `title`: string
     - `description`: string | ReactNode
     - `variant`: `'primary'` | `'danger'` | `'success'` | `'warning'` (configura la paleta del botón de confirmación e ícono del encabezado)
     - `confirmText`: string (default `"Confirmar"`)
     - `cancelText`: string (default `"Cancelar"`)
     - `loading`: boolean (muestra spinner `<Loader2 className="animate-spin" />` y deshabilita botones)
     - `loadingText`: string opcional
     - `confirmDisabled`: boolean (para validación de formulario/campos vacíos)
     - `children`: ReactNode opcional (para textareas, campos de texto o alertas)
   - **Accesibilidad y UX**: Cierre con tecla Escape, bloqueo de scroll en el fondo, cierre por click en backdrop y atributos WAI-ARIA (`role="dialog"`, `aria-modal="true"`).

4. **`Modal` (`src/components/ui/Modal.jsx`)**:
   - Componente contenedor base para diálogos modales generales con soporte de portal a `document.body`, responsive maxWidth (`sm`, `md`, `lg`, `xl`) y encabezado flexible.

5. **`Badge` (`src/components/ui/Badge.jsx`)** y **`StatusBadge` (`src/components/ui/StatusBadge.jsx`)**:
   - Componentes base universales para etiquetas, roles, categorías y estados (con indicador dot).
   - Variantes semánticas: `'default'`, `'neutral'`, `'primary'`, `'success'`, `'danger'`, `'warning'`, `'info'`, `'outline'`.
   - Tamaños: `'sm'`, `'md'`, `'lg'`.
   - Los componentes de dominio `ClaimStatusBadge` y `ClaimVisibilityBadge` implementan este estándar para los reclamos.

6. **`ImageViewer` (`src/components/ui/ImageViewer.jsx`)**:
   - Visor lightbox modal para evidencias fotográficas y adjuntos sin recorte de imagen, con zoom natural y control por teclado.

7. **`Select` (`src/components/ui/Select.jsx`)**:
   - Selector desplegable accesible que sustituye los selectores rígidos nativos por menús flotantes estilizados con bordes redondeados (`rounded-2xl`), soporte para tema claro/oscuro, ícono indicador `ChevronDown` animado, navegación completa por teclado (Escape, Flechas, Enter, Espacio) y cierre por click exterior.