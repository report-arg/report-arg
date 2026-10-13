"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tag,
  Search,
  X,
  Filter,
  Plus,
  Pencil,
  PowerOff,
  Power,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Layers,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { toast } from "sonner";

const TIPO_CONFIG = {
  reclamo: {
    label: "Reclamo",
    badgeCls: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
  },
  comunicado: {
    label: "Comunicado",
    badgeCls: "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40",
  },
  ambos: {
    label: "Reclamo y Comunicado",
    badgeCls: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
  },
};

export default function CategoriesPanel() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Modales de acción
  const [modalBaja, setModalBaja] = useState(null);
  const [modalReactivar, setModalReactivar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Ref para debounce de búsqueda
  const searchTimeoutRef = useRef(null);

  const fetchCategorias = async (search = busqueda, tipo = filtroTipo, estado = filtroEstado) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("busqueda", search.trim());
      if (tipo) params.append("tipo", tipo);
      if (estado) params.append("estado", estado);

      const res = await apiClient.get(`/admin/categorias?${params.toString()}`);
      if (res.data?.ok) {
        setCategorias(res.data.data || []);
      } else {
        setError(res.data?.mensaje || "Error al cargar categorías");
      }
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo conectar con el servidor para consultar categorías."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias(busqueda, filtroTipo, filtroEstado);
  }, [filtroTipo, filtroEstado]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchCategorias(val, filtroTipo, filtroEstado);
    }, 350);
  };

  const handleClearSearch = () => {
    setBusqueda("");
    fetchCategorias("", filtroTipo, filtroEstado);
  };

  // Métricas
  const totalCategorias = categorias.length;
  const activasCount = categorias.filter((c) => c.estado === "activo").length;
  const inactivasCount = categorias.filter((c) => c.estado === "inactivo").length;

  // Acciones
  async function handleConfirmBaja() {
    if (!modalBaja) return;
    setProcesando(true);
    try {
      const res = await apiClient.patch(`/admin/categorias/${modalBaja.id}/baja`);
      if (res.data?.ok) {
        toast.success(`Categoría "${modalBaja.nombre}" desactivada correctamente.`);
        setModalBaja(null);
        await fetchCategorias();
      } else {
        toast.error(res.data?.mensaje || "Error al desactivar categoría.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al desactivar categoría.");
    } finally {
      setProcesando(false);
    }
  }

  async function handleConfirmReactivar() {
    if (!modalReactivar) return;
    setProcesando(true);
    try {
      const res = await apiClient.patch(`/admin/categorias/${modalReactivar.id}/reactivar`);
      if (res.data?.ok) {
        toast.success(`Categoría "${modalReactivar.nombre}" activada correctamente.`);
        setModalReactivar(null);
        await fetchCategorias();
      } else {
        toast.error(res.data?.mensaje || "Error al activar categoría.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al activar categoría.");
    } finally {
      setProcesando(false);
    }
  }

  async function handleConfirmEliminar() {
    if (!modalEliminar) return;
    setProcesando(true);
    try {
      const res = await apiClient.delete(`/admin/categorias/${modalEliminar.id}`);
      if (res.data?.ok) {
        toast.success(`Categoría "${modalEliminar.nombre}" eliminada correctamente.`);
        setModalEliminar(null);
        await fetchCategorias();
      } else {
        toast.error(res.data?.mensaje || "Error al eliminar categoría.");
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al eliminar categoría.";
      toast.error(msg, { duration: 5000 });
      setModalEliminar(null);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted m-0">Total Categorías</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 m-0">
              {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : totalCategorias}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">Clasificaciones del sistema</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
        </div>

        <div
          onClick={() => setFiltroEstado(filtroEstado === "activo" ? "" : "activo")}
          className={`p-4 sm:p-5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-emerald-400 ${
            filtroEstado === "activo" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar solo activas"
        >
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 m-0">Activas</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 m-0">
              {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : activasCount}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">Disponibles para reportes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div
          onClick={() => setFiltroEstado(filtroEstado === "inactivo" ? "" : "inactivo")}
          className={`p-4 sm:p-5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-amber-400 ${
            filtroEstado === "inactivo" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border-subtle"
          }`}
          title="Click para filtrar solo inactivas"
        >
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 m-0">Inactivas</p>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 m-0">
              {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : inactivasCount}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 m-0">Dadas de baja lógica</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <PowerOff size={24} />
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, código o descripción..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:bg-surface focus:border-primary outline-hidden transition-all"
          />
          {busqueda && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros Dropdowns y Botón Actualizar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo */}
          <div className="relative">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
            >
              <option value="">Tipo: Todos</option>
              <option value="reclamo">Reclamos</option>
              <option value="comunicado">Comunicados</option>
              <option value="ambos">Ambos</option>
            </select>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          {/* Estado */}
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
            >
              <option value="">Estado: Todos</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          <Button
            onClick={() => fetchCategorias(busqueda, filtroTipo, filtroEstado)}
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw size={13} />}
            title="Actualizar listado"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* 3. Tabla de Categorías */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {error && (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-rose-600 font-semibold m-0">{error}</p>
            <Button
              onClick={() => fetchCategorias(busqueda, filtroTipo, filtroEstado)}
              variant="outline"
              size="sm"
            >
              Reintentar
            </Button>
          </div>
        )}

        {loading && !error && (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando categorías...</span>
          </div>
        )}

        {!loading && !error && categorias.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <Tag size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary m-0">No se encontraron categorías</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              {busqueda || filtroTipo || filtroEstado
                ? "No hay resultados para los criterios seleccionados."
                : "Aún no hay categorías creadas en el sistema."}
            </p>
            <Button
              onClick={() => router.push("/admin/categories/crear")}
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              className="mt-4"
            >
              Crear primera categoría
            </Button>
          </div>
        )}

        {!loading && !error && categorias.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4">Ámbito</th>
                  <th className="py-3 px-4 text-center">Orden</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {categorias.map((cat) => {
                  const CategoryIcon = getCategoryIcon(cat.codigo || cat.nombre, cat.nombre);
                  const esActiva = cat.estado === "activo";
                  const tipoInfo = TIPO_CONFIG[cat.tipo] || {
                    label: cat.tipo,
                    badgeCls: "bg-surface-subtle text-text-secondary border-border-subtle",
                  };

                  return (
                    <tr key={cat.id} className="hover:bg-surface-subtle/50 transition-colors">
                      {/* Código e Icono y Nombre */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <CategoryIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-text-primary m-0">
                                {cat.nombre}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-surface-subtle text-text-muted border border-border-subtle">
                                {cat.codigo || `CAT-${cat.id}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 text-text-secondary max-w-xs truncate">
                        {cat.descripcion || <span className="text-text-muted italic">Sin descripción</span>}
                      </td>

                      {/* Ámbito / Tipo */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${tipoInfo.badgeCls}`}>
                          {tipoInfo.label}
                        </span>
                      </td>

                      {/* Orden */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-text-secondary">
                        {cat.orden ?? 0}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={esActiva ? "Activo" : "Inactivo"}
                          label={esActiva ? "Activa" : "Inactiva"}
                        />
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            onClick={() => router.push(`/admin/categories/editar/${cat.id}`)}
                            variant="outline"
                            size="sm"
                            leftIcon={<Pencil size={13} />}
                            title="Editar categoría"
                          >
                            Editar
                          </Button>

                          {esActiva ? (
                            <Button
                              onClick={() => setModalBaja(cat)}
                              variant="danger-soft"
                              size="sm"
                              leftIcon={<PowerOff size={13} />}
                              title="Desactivar (Baja lógica)"
                            >
                              Desactivar
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setModalReactivar(cat)}
                              variant="success"
                              size="sm"
                              leftIcon={<Power size={13} />}
                              title="Reactivar categoría"
                            >
                              Activar
                            </Button>
                          )}

                          <Button
                            onClick={() => setModalEliminar(cat)}
                            variant="outline"
                            size="sm"
                            leftIcon={<Trash2 size={13} className="text-rose-600" />}
                            title="Eliminar categoría física (si no tiene reclamos asociados)"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Modal Baja Lógica */}
      {modalBaja && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalBaja(null)}
          onConfirm={handleConfirmBaja}
          title="¿Desactivar categoría?"
          description={`Estás por dar de baja lógica a "${modalBaja.nombre}". La categoría ya no podrá seleccionarse para nuevos reportes, pero se preservarán intactos los reclamos y comunicados existentes asociados.`}
          variant="warning"
          confirmText="Desactivar Categoría"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Desactivando..."
          icon={<PowerOff size={20} />}
        />
      )}

      {/* 5. Modal Reactivar */}
      {modalReactivar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalReactivar(null)}
          onConfirm={handleConfirmReactivar}
          title="¿Reactivar categoría?"
          description={`Al reactivar "${modalReactivar.nombre}", volverá a estar disponible inmediatamente en el selector para ciudadanos e instituciones.`}
          variant="success"
          confirmText="Reactivar Categoría"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Reactivando..."
          icon={<Power size={20} />}
        />
      )}

      {/* 6. Modal Eliminar */}
      {modalEliminar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalEliminar(null)}
          onConfirm={handleConfirmEliminar}
          title="¿Eliminar categoría definitivamente?"
          description={`Esta acción intentará borrar permanentemente la categoría "${modalEliminar.nombre}". Si la categoría tiene reclamos, comunicados o asignaciones asociadas, el sistema rechazará la eliminación para preservar la integridad referencial.`}
          variant="danger"
          confirmText="Intentar Eliminación"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Verificando..."
          icon={<Trash2 size={20} />}
        />
      )}
    </div>
  );
}