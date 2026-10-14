"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Pencil,
  PowerOff,
  Power,
  Trash2,
  Loader2,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

import CategoryStatsCards from "./CategoryStatsCards";
import CategoryFilterBar from "./CategoryFilterBar";
import CategoryModals from "./CategoryModals";

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
  const debouncedBusqueda = useDebounce(busqueda, 350);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Modales de acción
  const [modalBaja, setModalBaja] = useState(null);
  const [modalReactivar, setModalReactivar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const fetchCategorias = useCallback(
    async (search = debouncedBusqueda, tipo = filtroTipo, estado = filtroEstado) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search && search.trim()) params.append("busqueda", search.trim());
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
    },
    [debouncedBusqueda, filtroTipo, filtroEstado]
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchCategorias(debouncedBusqueda, filtroTipo, filtroEstado);
      return;
    }
    fetchCategorias(debouncedBusqueda, filtroTipo, filtroEstado);
  }, [debouncedBusqueda, filtroTipo, filtroEstado, fetchCategorias]);

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
      <CategoryStatsCards
        total={totalCategorias}
        activas={activasCount}
        inactivas={inactivasCount}
        loading={loading}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
      />

      {/* 2. Barra de Búsqueda y Filtros */}
      <CategoryFilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onLimpiarBusqueda={() => setBusqueda("")}
        filtroTipo={filtroTipo}
        onFiltroTipoChange={setFiltroTipo}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        onRefresh={() => fetchCategorias()}
        loading={loading}
      />

      {/* 3. Tabla de Categorías */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {error && (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-rose-600 font-semibold m-0">{error}</p>
            <Button
              onClick={() => fetchCategorias()}
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

      {/* 4. Modales */}
      <CategoryModals
        modalBaja={modalBaja}
        onCloseBaja={() => setModalBaja(null)}
        onConfirmBaja={handleConfirmBaja}
        modalReactivar={modalReactivar}
        onCloseReactivar={() => setModalReactivar(null)}
        onConfirmReactivar={handleConfirmReactivar}
        modalEliminar={modalEliminar}
        onCloseEliminar={() => setModalEliminar(null)}
        onConfirmEliminar={handleConfirmEliminar}
        procesando={procesando}
      />
    </div>
  );
}
