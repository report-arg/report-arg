'use client';

import React, { useState } from 'react';
import ReportArgLogo from '@/components/brand/ReportArgLogo';
import {
  ALL_BRAND_ICONS,
  REAL_CATEGORIES,
  CategoryFallbackIcon,
  getCategoryIcon,
  PinReportArg,
  PinClaim,
  PinOfficial,
  WaterIcon,
  ElectricityIcon,
  StreetIcon,
  TrashIcon,
  PublicSpaceIcon,
  SecurityIcon,
  TransportIcon,
  LightingIcon,
  AlertCategoryIcon,
  InfoCategoryIcon,
  HealthIcon,
  ReportProblemIcon,
  MeTooIcon,
  OfficialCommIcon,
  StatusPending,
  StatusReview,
  StatusProcess,
  StatusResolved,
  StatusCanceled
} from '@/components/brand/icons';
import { BRAND_COLORS, TOKEN_ROLES, SEMANTIC_COLORS, TYPOGRAPHY_SCALE, CTA_SPEC, BUTTON_HIERARCHY, SURFACE_SPECS } from '@/components/brand/brandTokens';

const SECTIONS = [
  { id: 'logo', label: '1. Logo Candidato Aprobado' },
  { id: 'typography', label: '2. Tipografía Manrope & Jerarquía' },
  { id: 'palette', label: '3. Paleta & Roles de Color' },
  { id: 'cta-buttons', label: '4. CTA Principal & Botones' },
  { id: 'categories', label: '5. Categorías Reales & Fallback' },
  { id: 'icons', label: '6. Iconografía & Legibilidad' },
  { id: 'states', label: '7. Seguimiento de Estados' },
  { id: 'ui-cards', label: '8. Comparación Reclamo vs Comunicado' }
];

export default function BrandCatalogClient() {
  const [activeSection, setActiveSection] = useState('logo');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <ReportArgLogo variant="app-icon" size={38} />
            <div>
              <h1 className="font-bold text-base leading-none text-slate-900">
                Report<span className="text-[var(--color-brand-600)]">ARG</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                Catálogo de Identidad v3
              </span>
            </div>
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Secciones de Evaluación
          </p>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === sec.id
                  ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border border-[var(--color-brand-100)] shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        {/* Footer Informativo */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded block text-center mb-2">
            Herramienta Visual Interna
          </span>
          <p className="text-[11px] text-slate-500 leading-tight">
            Disponible únicamente en desarrollo para revisión de marca y componentes.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ==================================================== */}
          {/* SECCIÓN 1: LOGO CANDIDATO APROBADO                   */}
          {/* ==================================================== */}
          {activeSection === 'logo' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  1. Logo Candidato Aprobado
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Evolución pulida del isotipo principal de ReportARG con ondas superiores alineadas, pin continuo y símbolo en azul de marca sobre fondo claro.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Horizontal Principal */}
                <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">
                    Logo Horizontal Principal (Símbolo en Azul Marca)
                  </span>
                  <ReportArgLogo variant="horizontal" size={44} />
                </div>

                {/* Isotipo Standalone */}
                <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-700)] mb-4">
                    Símbolo Isotipo
                  </span>
                  <PinReportArg size={56} className="text-[var(--color-brand-600)]" />
                </div>

                {/* App Icon Badge */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                    App Icon / Badge de Aplicación
                  </span>
                  <ReportArgLogo variant="app-icon" size={64} />
                </div>

                {/* Fondo Claro */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Sobre Fondo Blanco
                  </span>
                  <ReportArgLogo variant="horizontal" size={30} darkMode={false} />
                </div>

                {/* Fondo Azul Oscuro */}
                <div className="bg-[var(--color-brand-900)] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-200)] mb-4">
                    Sobre Fondo Azul Oscuro (Brand 900)
                  </span>
                  <ReportArgLogo variant="horizontal" size={30} darkMode={true} />
                </div>
              </div>

              {/* Prueba de Legibilidad a Tamaños de Interfaz */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Prueba de Legibilidad a Tamaños Reales (16, 24, 32 y 64px)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[16, 24, 32, 64].map((size) => (
                    <div key={size} className="flex flex-col items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="h-16 flex items-center justify-center">
                        <PinReportArg size={size} className="text-[var(--color-brand-600)]" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 mt-2">{size} px</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {size === 16 ? 'Favicon / Badge' : size === 24 ? 'Navegación' : size === 32 ? 'Encabezados' : 'Destacado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 2: TIPOGRAFÍA MANROPE Y ESCALA TIPOGRÁFICA     */}
          {/* ==================================================== */}
          {activeSection === 'typography' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  2. Tipografía Manrope & Jerarquía Tipográfica
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Familia única consistente para toda la experiencia. Jerarquía construida mediante peso, tamaño y espacio (sin uso excesivo de MAYÚSCULAS).
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Escala de Jerarquía de Texto</h3>
                  <span className="text-xs font-semibold text-[var(--color-brand-600)] bg-[var(--color-brand-50)] px-2.5 py-1 rounded-full">
                    Fuente: Manrope
                  </span>
                </div>

                <div className="space-y-4 divide-y divide-slate-100">
                  {TYPOGRAPHY_SCALE.map((t) => (
                    <div key={t.level} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-600)] block mb-1">
                          {t.level} ({t.size})
                        </span>
                        <p className={`text-slate-900 ${
                          t.level.includes('Display') ? 'text-2xl font-800' :
                          t.level.includes('H2') ? 'text-xl font-bold' :
                          t.level.includes('H3') ? 'text-base font-bold' :
                          t.level.includes('Card') ? 'text-base font-bold' :
                          t.level.includes('Body Small') ? 'text-xs font-medium' :
                          t.level.includes('Meta') ? 'text-xs font-medium text-slate-500' :
                          t.level.includes('Label') ? 'text-xs font-semibold text-slate-700' :
                          'text-sm font-normal'
                        }`}>
                          El ciudadano reporta y le da seguimiento a su ciudad
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0 sm:text-right">
                        {t.use}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 3: PALETA DE COLORES Y ROLES REALES           */}
          {/* ==================================================== */}
          {activeSection === 'palette' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  2. Paleta de Colores & Roles del Sistema
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Definición formal de la escala de marca (Brand 50 a 900) y asignación explícita de roles para la interfaz.
                </p>
              </div>

              {/* Escala Cromática */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Escala Principal de Marca</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                  {BRAND_COLORS.map((c) => (
                    <div key={c.step} className="flex flex-col text-center">
                      <div
                        className="h-16 rounded-xl border border-slate-200/50 p-2 flex flex-col justify-between text-[10px] font-bold shadow-xs"
                        style={{ backgroundColor: c.hex, color: c.textDark ? '#0F172A' : '#FFFFFF' }}
                      >
                        <span>{c.step}</span>
                        {c.isPrimary && <span className="text-[8px] bg-white text-[var(--color-brand-600)] px-1 rounded uppercase">Base</span>}
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 uppercase font-semibold mt-1">{c.hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles de Tokens */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Tabla de Roles de Tokens en Interfaz</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                        <th className="p-3">Rol del Token</th>
                        <th className="p-3">Modo Claro</th>
                        <th className="p-3">Modo Oscuro</th>
                        <th className="p-3">Uso Principal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TOKEN_ROLES.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">{r.role}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded border border-slate-300 shadow-xs inline-block" style={{ backgroundColor: r.lightHex }} />
                              <span className="font-mono text-[11px]">{r.lightHex}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded border border-slate-300 shadow-xs inline-block" style={{ backgroundColor: r.darkHex }} />
                              <span className="font-mono text-[11px]">{r.darkHex}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">{r.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Colores Semánticos */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Colores Semánticos de Estado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {SEMANTIC_COLORS.map((sem) => (
                    <div
                      key={sem.name}
                      className="p-4 rounded-xl border flex flex-col justify-between"
                      style={{ backgroundColor: sem.bg, borderColor: sem.border, color: sem.text }}
                    >
                      <div>
                        <span className="font-bold text-xs">{sem.name}</span>
                        <span className="text-[10px] font-mono block uppercase opacity-80 mt-0.5">{sem.hex}</span>
                      </div>
                      <p className="text-[11px] mt-2 opacity-90 leading-tight">{sem.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 4: CTA PRINCIPAL & JERARQUÍA DE BOTONES       */}
          {/* ==================================================== */}
          {activeSection === 'cta-buttons' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  4. CTA Principal & Jerarquía de Botones
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Definición formal de la acción principal del ciudadano ("Reportar un problema") y la jerarquía de botones secundarios y ghost.
                </p>
              </div>

              {/* Muestra del CTA Principal */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">CTA Principal de la Experiencia Ciudadano</h3>
                  <span className="text-xs font-semibold text-[var(--color-brand-600)] bg-[var(--color-brand-50)] px-2.5 py-1 rounded-full">
                    Icono: MapPinPlus
                  </span>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-1">{CTA_SPEC.label}</span>
                    <p className="text-xs text-slate-500 max-w-md">{CTA_SPEC.description}</p>
                  </div>

                  <button className="btn-primary-report">
                    <ReportProblemIcon size={16} />
                    <span>{CTA_SPEC.label}</span>
                  </button>
                </div>
              </div>

              {/* Jerarquía de Botones */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Niveles de Jerarquía de Botones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUTTON_HIERARCHY.map((btn) => (
                    <div key={btn.level} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-600)] block mb-1">
                          {btn.level}
                        </span>
                        <p className="text-xs text-slate-600">{btn.use}</p>
                      </div>
                      <button className={
                        btn.level.includes('PRIMARY CTA') ? 'btn-primary-report' :
                        btn.level.includes('PRIMARY') ? 'btn-primary' :
                        btn.level.includes('SECONDARY') ? 'btn-secondary' :
                        btn.level.includes('DANGER') ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200' :
                        'btn-ghost'
                      }>
                        {btn.level.includes('PRIMARY CTA') && <ReportProblemIcon size={16} />}
                        <span>Acción</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 5: CATEGORÍAS REALES & FALLBACK               */}
          {/* ==================================================== */}
          {activeSection === 'categories' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  3. Catálogo de Categorías Reales (Base de Datos) & Fallback
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Mapeo directo de las 11 categorías existentes en el script de base de datos (<code>003_seed_catalogo_categorias.sql</code>) por su código único, más el icono por defecto para nuevas categorías creadas en el panel de administración.
                </p>
              </div>

              {/* 11 Categorías Reales */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">11 Categorías Oficiales del Sistema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {REAL_CATEGORIES.map((cat) => {
                    const CatIcon = cat.component;
                    return (
                      <div key={cat.code} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--color-brand-600)] shrink-0 shadow-xs">
                          <CatIcon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-200 px-1 py-0.2 rounded font-bold">
                              {cat.code}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                            {cat.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fallback de Categoría por Defecto */}
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                    <CategoryFallbackIcon size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">
                      Icono de Categoría por Defecto (Fallback)
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Si un administrador crea una nueva categoría desde el panel Admin sin asignarle un icono específico o un código reconocido, el sistema renderiza automáticamente <code>CategoryFallbackIcon</code> sin interrumpir el funcionamiento del frontend.
                    </p>
                  </div>
                </div>

                {/* Ejemplo de Renderizado con Mapeador getCategoryIcon() */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon('NUEVA_CATEGORIA_DESCONOCIDA'), { size: 20, className: 'text-slate-600' })}
                    <span className="font-semibold text-slate-800">Prueba: "Mantenimiento Urbano" (Código desconocido)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Retorna CategoryFallbackIcon
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 4: ICONOGRAFÍA & LEGIBILIDAD                 */}
          {/* ==================================================== */}
          {activeSection === 'icons' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  4. Iconografía Propia & Verificación a 16px y 24px
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Muestra de contraste sobre fondo claro y oscuro, junto a la prueba de legibilidad a 16px y 24px para los recursos propios de ReportARG.
                </p>
              </div>

              {/* Vista Fondo Claro vs Fondo Oscuro */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fondo Claro */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                    Sobre Fondo Claro (text-slate-700 / text-brand-600)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: PinReportArg, name: 'Isotipo' },
                      { icon: PinClaim, name: 'Pin Reclamo' },
                      { icon: PinOfficial, name: 'Pin Oficial' },
                      { icon: ReportProblemIcon, name: 'Reportar' },
                      { icon: MeTooIcon, name: 'A mí también' },
                      { icon: OfficialCommIcon, name: 'Comunicado' }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center text-center">
                        <item.icon size={26} className="text-slate-700" />
                        <span className="text-xs font-semibold text-slate-800 mt-2">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fondo Azul Oscuro */}
                <div className="bg-[var(--color-brand-900)] border border-[var(--color-brand-800)] rounded-2xl p-5 shadow-md space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-200)] block border-b border-[var(--color-brand-800)] pb-2">
                    Sobre Fondo Azul Oscuro (text-white)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: PinReportArg, name: 'Isotipo' },
                      { icon: PinClaim, name: 'Pin Reclamo' },
                      { icon: PinOfficial, name: 'Pin Oficial' },
                      { icon: ReportProblemIcon, name: 'Reportar' },
                      { icon: MeTooIcon, name: 'A mí también' },
                      { icon: OfficialCommIcon, name: 'Comunicado' }
                    ].map((item, i) => (
                      <div key={i} className="bg-[var(--color-brand-800)]/60 border border-[var(--color-brand-700)]/50 p-3 rounded-xl flex flex-col items-center text-center">
                        <item.icon size={26} className="text-white" />
                        <span className="text-xs font-semibold text-white mt-2">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prueba de Escala a 16px y 24px */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Escala Lado a Lado a 16px y 24px</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: PinReportArg, name: 'Isotipo' },
                    { icon: WaterIcon, name: 'Agua' },
                    { icon: ElectricityIcon, name: 'Luz' },
                    { icon: StreetIcon, name: 'Calles' },
                    { icon: TrashIcon, name: 'Residuos' },
                    { icon: StatusProcess, name: 'En proceso' },
                    { icon: StatusResolved, name: 'Resuelto' },
                    { icon: CategoryFallbackIcon, name: 'Fallback' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex flex-col items-center">
                      <span className="text-xs font-semibold text-slate-800 mb-2">{item.name}</span>
                      <div className="flex items-center justify-around w-full bg-white p-2 rounded-lg border border-slate-200">
                        <div className="flex flex-col items-center">
                          <item.icon size={16} className="text-[var(--color-brand-600)]" />
                          <span className="text-[9px] font-mono text-slate-400 mt-1">16px</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <item.icon size={24} className="text-[var(--color-brand-600)]" />
                          <span className="text-[9px] font-mono text-slate-400 mt-1">24px</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Uso de Lucide para Acciones Universales</span>
                Los iconos estándar de interfaz (como Inicio, Buscar, Cerrar o Mapa) continúan utilizando la librería <code>lucide-react</code>. Los componentes de este catálogo representan únicamente la identidad exclusiva de ReportARG.
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 5: SEGUIMIENTO DE ESTADOS                    */}
          {/* ==================================================== */}
          {activeSection === 'states' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  5. Sistema de Seguimiento de Estados (Sprint 4)
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Flujo secuencial previsto (Pendiente → En revisión → En proceso → Resuelto) y salida alternativa de cancelación por parte del autor.
                </p>
              </div>

              {/* Diagrama del Flujo */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-slate-900">Flujo Secuencial Previsto</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { step: '1', name: 'Pendiente', icon: StatusPending, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', desc: 'Reclamo registrado a la espera de evaluación inicial.' },
                    { step: '2', name: 'En revisión', icon: StatusReview, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', desc: 'Evaluado por el equipo de gestión para su análisis técnico.' },
                    { step: '3', name: 'En proceso', icon: StatusProcess, bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', desc: 'Gestión iniciada por la entidad responsable.' },
                    { step: '4', name: 'Resuelto', icon: StatusResolved, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', desc: 'Reclamo marcado como finalizado por la entidad responsable.' }
                  ].map((st) => (
                    <div key={st.step} className={`p-4 rounded-xl border ${st.bg} ${st.border} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 ${st.text}`}>
                          Paso {st.step}
                        </span>
                        <st.icon size={22} className={st.text} />
                      </div>
                      <h4 className={`font-bold text-sm ${st.text}`}>{st.name}</h4>
                      <p className="text-xs text-slate-600 leading-tight">{st.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Salida Alternativa: Cancelado */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                    <StatusCanceled size={24} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Salida Alternativa: Cancelado por el autor
                      </span>
                      <p className="text-xs text-slate-600 leading-tight mt-1">
                        En Sprint 4, el propio autor del reclamo puede anular su publicación mientras permanezca en estado Pendiente. No constituye un paso secuencial de resolución.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista compacta de progreso para móvil */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Ejemplo de Progreso Compacto para Vista Móvil</h3>
                <div className="max-w-md bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">Estado del Reclamo #1024</span>
                    <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded text-[10px]">3. En proceso</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-2">
                    <div className="bg-emerald-500 rounded-full" />
                    <div className="bg-emerald-500 rounded-full" />
                    <div className="bg-sky-500 rounded-full" />
                    <div className="bg-slate-200 rounded-full" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gestión iniciada por el área correspondiente.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ==================================================== */}
          {/* SECCIÓN 6: COMPARACIÓN RECLAMO VS COMUNICADO         */}
          {/* ==================================================== */}
          {activeSection === 'ui-cards' && (
            <section className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  6. Comparación Visual: Reclamo Ciudadano vs Comunicado Institucional
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Diferenciación sutil pero inmediata entre publicaciones reportadas por vecinos y comunicados emitidos por entidades oficiales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* (a) Tarjeta de Reclamo Ciudadano */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Muestra: Reclamo Ciudadano
                    </span>
                    <span className="text-xs text-slate-400">Hace 3 horas</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] border border-[var(--color-brand-100)] flex items-center justify-center shrink-0">
                      <WaterIcon size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Agua y Cloacas • Zona Centro
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                        Pérdida de agua sobre la calzada
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fuga constante observada en la vía pública que afecta el tránsito de peatones.
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1.5">
                      <StatusProcess size={14} /> En proceso
                    </span>
                    <button className="flex items-center gap-1 text-[var(--color-brand-600)] font-semibold text-[11px]">
                      <MeTooIcon size={14} /> 12 vecinos adheridos
                    </button>
                  </div>
                </div>

                {/* (b) Tarjeta de Comunicado Institucional */}
                <div className="bg-[var(--color-brand-50)]/30 border border-[var(--color-brand-100)] rounded-2xl p-6 shadow-xs space-y-4 relative">
                  <div className="flex justify-between items-center border-b border-[var(--color-brand-100)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-700)] bg-[var(--color-brand-100)] px-2 py-0.5 rounded">
                      Muestra: Comunicado Oficial
                    </span>
                    <span className="text-xs text-slate-500">25/09/2026</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-600)] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <PinOfficial size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[var(--color-brand-700)] block uppercase tracking-wider">
                        Emisor: Entidad Municipal
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                        Mantenimiento programado de alumbrado público
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aviso preventivo sobre trabajos de sustitución de luminarias en el sector norte.
                  </p>

                  <div className="pt-3 border-t border-[var(--color-brand-100)] flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--color-brand-700)]">
                      <OfficialCommIcon size={14} /> Publicación verificada de la institución
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Criterio de Diferenciación</span>
                El reclamo ciudadano mantiene superficie blanca neutra con badge de estado. El comunicado institucional utiliza una superficie con matiz azul suave (<code>Brand 50</code>), icono oficial y emisor destacado. Se mantiene separada la fuente de la publicación respecto de su estado de gestión.
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
