"use client";

import { useState, useEffect, Suspense, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/ui/EmptyState";
import InstitucionReclamoTable from "@/components/reclamos/InstitucionReclamoTable";
import InstitucionReclamoFilterBar from "@/components/reclamos/InstitucionReclamoFilterBar";
import { Loader2, Filter, Inbox } from "lucide-react";
import { CLAIM_STATUSES } from "@/utils/reclamoStatus";
import useCategorias from "@/hooks/useCategorias";
import useDebounce from "@/hooks/useDebounce";
import PageHeader from "@/components/layout/PageHeader";

const ESTADOS_PERMITIDOS = ["Todos", ...CLAIM_STATUSES];
const VISIBILIDADES_PERMITIDAS = ["Todas", "publico", "privado"];
const ORDENES_VISIBLES = ["recientes", "antiguos", "impacto"];
const LIMITE_DEFAULT = 20;

function parseInitialParams(searchParams) {
  const rawEstado = searchParams.get("estado");
  const estado = CLAIM_STATUSES.includes(rawEstado) ? rawEstado : "Todos";

  const rawCategoria = searchParams.get("categoria");
  const categoria = rawCategoria && rawCategoria !== "Todas" ? rawCategoria : "Todas";

  const rawVisibilidad = searchParams.get("visibilidad");
  const visibilidad = VISIBILIDADES_PERMITIDAS.includes(rawVisibilidad)
    ? rawVisibilidad
    : "Todas";

  const fechaDesde = searchParams.get("fechaDesde") || "";
  const fechaHasta = searchParams.get("fechaHasta") || "";

  const rawDemorado = searchParams.get("demorado");
  const demorado = rawDemorado === "true" || rawDemorado === "1";

  const rawOrderBy = searchParams.get("orderBy");
  const orderBy = ORDENES_VISIBLES.includes(rawOrderBy) ? rawOrderBy : "recientes";

  const busqueda = searchParams.get("busqueda") || "";

  const rawPagina = Number(searchParams.get("pagina"));
  const pagina = Number.isInteger(rawPagina) && rawPagina >= 1 ? rawPagina : 1;

  const rawLimite = Number(searchParams.get("limite"));
  const limite =
    Number.isInteger(rawLimite) && rawLimite >= 1 && rawLimite <= 100
      ? rawLimite
      : LIMITE_DEFAULT;

  return {
    busqueda,
    estado,
    categoria,
    visibilidad,
    fechaDesde,
    fechaHasta,
    demorado,
    orderBy,
    pagina,
    limite,
  };
}

function BandejaReclamos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { categorias } = useCategorias("reclamo");

  const initial = useMemo(() => parseInitialParams(searchParams), [searchParams]);

  // Estado de criterios y paginación
  const [busqueda, setBusqueda] = useState(initial.busqueda);
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [estado, setEstado] = useState(initial.estado);
  const [categoria, setCategoria] = useState(initial.categoria);
  const [visibilidad, setVisibilidad] = useState(initial.visibilidad);
  const [fechaDesde, setFechaDesde] = useState(initial.fechaDesde);
  const [fechaHasta, setFechaHasta] = useState(initial.fechaHasta);
  const [demorado, setDemorado] = useState(initial.demorado);
  const [orderBy, setOrderBy] = useState(initial.orderBy);
  const [pagina, setPagina] = useState(initial.pagina);
  const [limite, setLimite] = useState(initial.limite);

  // Datos y estado de la petición
  const [reclamos, setReclamos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sincronizar cuando cambian los searchParams externamente (ej. navegación atrás/adelante o drill-down desde informes)
  const lastSyncedQueryRef = useRef(searchParams.toString());
  useEffect(() => {
    const currentQueryStr = searchParams.toString();
    if (currentQueryStr === lastSyncedQueryRef.current) return;
    lastSyncedQueryRef.current = currentQueryStr;

    const parsed = parseInitialParams(searchParams);
    setBusqueda(parsed.busqueda);
    setEstado(parsed.estado);
    setCategoria(parsed.categoria);
    setVisibilidad(parsed.visibilidad);
    setFechaDesde(parsed.fechaDesde);
    setFechaHasta(parsed.fechaHasta);
    setDemorado(parsed.demorado);
    setOrderBy(parsed.orderBy);
    setPagina(parsed.pagina);
    setLimite(parsed.limite);
  }, [searchParams]);

  // Construir y reflejar los parámetros de consulta activos en la URL
  const syncUrlParams = useCallback(
    (nextState) => {
      const qs = new URLSearchParams();
      if (nextState.busqueda?.trim()) qs.set("busqueda", nextState.busqueda.trim());
      if (nextState.estado && nextState.estado !== "Todos") qs.set("estado", nextState.estado);
      if (nextState.categoria && nextState.categoria !== "Todas") qs.set("categoria", nextState.categoria);
      if (nextState.visibilidad && nextState.visibilidad !== "Todas") qs.set("visibilidad", nextState.visibilidad);
      if (nextState.fechaDesde) qs.set("fechaDesde", nextState.fechaDesde);
      if (nextState.fechaHasta) qs.set("fechaHasta", nextState.fechaHasta);
      if (nextState.demorado) qs.set("demorado", "true");
      if (nextState.orderBy && nextState.orderBy !== "recientes") qs.set("orderBy", nextState.orderBy);
      if (nextState.pagina && nextState.pagina > 1) qs.set("pagina", String(nextState.pagina));
      if (nextState.limite && nextState.limite !== LIMITE_DEFAULT) qs.set("limite", String(nextState.limite));

      const nextQueryStr = qs.toString();
      if (nextQueryStr !== lastSyncedQueryRef.current) {
        lastSyncedQueryRef.current = nextQueryStr;
        const targetUrl = nextQueryStr ? `${pathname}?${nextQueryStr}` : pathname;
        router.replace(targetUrl, { scroll: false });
      }
    },
    [pathname, router]
  );

  // Actualizar URL cuando cambia la búsqueda debounced
  const prevDebouncedRef = useRef(initial.busqueda);
  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedBusqueda) {
      prevDebouncedRef.current = debouncedBusqueda;
      setPagina(1);
    }
  }, [debouncedBusqueda]);

  useEffect(() => {
    syncUrlParams({
      busqueda: debouncedBusqueda,
      estado,
      categoria,
      visibilidad,
      fechaDesde,
      fechaHasta,
      demorado,
      orderBy,
      pagina,
      limite,
    });
  }, [
    debouncedBusqueda,
    estado,
    categoria,
    visibilidad,
    fechaDesde,
    fechaHasta,
    demorado,
    orderBy,
    pagina,
    limite,
    syncUrlParams,
  ]);

  const hayFiltrosActivos = useMemo(() => {
    return (
      Boolean(debouncedBusqueda && debouncedBusqueda.trim()) ||
      estado !== "Todos" ||
      categoria !== "Todas" ||
      visibilidad !== "Todas" ||
      Boolean(fechaDesde) ||
      Boolean(fechaHasta) ||
      Boolean(demorado) ||
      orderBy !== "recientes"
    );
  }, [
    debouncedBusqueda,
    estado,
    categoria,
    visibilidad,
    fechaDesde,
    fechaHasta,
    demorado,
    orderBy,
  ]);

  // Consulta al backend con todos los criterios combinados y paginación
  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setError("");

    const params = {
      orderBy,
      pagina,
      limite,
    };
    if (debouncedBusqueda && debouncedBusqueda.trim()) {
      params.busqueda = debouncedBusqueda.trim();
    }
    if (estado !== "Todos") params.estado = estado;
    if (categoria !== "Todas") params.categoria = categoria;
    if (visibilidad !== "Todas") params.visibilidad = visibilidad;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    if (demorado) params.demorado = true;

    apiClient
      .get("/institucion/reclamos/bandeja", { params })
      .then((res) => {
        if (!res.data?.ok) throw new Error(res.data?.mensaje);
        if (!vigente) return;
        const payload = res.data.data;
        if (Array.isArray(payload)) {
          setReclamos(payload);
          setTotal(payload.length);
        } else {
          setReclamos(payload?.rows || []);
          setTotal(Number(payload?.total || 0));
        }
      })
      .catch((err) => {
        if (vigente) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar la bandeja. Intentá nuevamente."
          );
        }
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [
    debouncedBusqueda,
    estado,
    categoria,
    visibilidad,
    fechaDesde,
    fechaHasta,
    demorado,
    orderBy,
    pagina,
    limite,
  ]);

  function handleEstadoChange(val) {
    if (ESTADOS_PERMITIDOS.includes(val)) {
      setEstado(val);
      setPagina(1);
    }
  }

  function handleCategoriaChange(val) {
    setCategoria(val || "Todas");
    setPagina(1);
  }

  function handleVisibilidadChange(val) {
    if (VISIBILIDADES_PERMITIDAS.includes(val)) {
      setVisibilidad(val);
      setPagina(1);
    }
  }

  function handleFechaDesdeChange(val) {
    setFechaDesde(val);
    setPagina(1);
  }

  function handleFechaHastaChange(val) {
    setFechaHasta(val);
    setPagina(1);
  }

  function handleDemoradoChange(val) {
    setDemorado(Boolean(val));
    setPagina(1);
  }

  function handleOrderByChange(val) {
    if (ORDENES_VISIBLES.includes(val)) {
      setOrderBy(val);
      setPagina(1);
    }
  }

  function handleLimpiarFiltros() {
    setBusqueda("");
    prevDebouncedRef.current = "";
    setEstado("Todos");
    setCategoria("Todas");
    setVisibilidad("Todas");
    setFechaDesde("");
    setFechaHasta("");
    setDemorado(false);
    setOrderBy("recientes");
    setPagina(1);
  }

  return (
    <div className="w-full">
      {/* Header Unificado Bandeja de Reclamos */}
      <PageHeader
        title="Bandeja de reclamos"
        description="Gestioná y priorizá los reclamos asignados a tu institución."
      />

      <InstitucionReclamoFilterBar
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        estado={estado}
        onEstadoChange={handleEstadoChange}
        categoria={categoria}
        categorias={categorias}
        onCategoriaChange={handleCategoriaChange}
        visibilidad={visibilidad}
        onVisibilidadChange={handleVisibilidadChange}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={handleFechaDesdeChange}
        fechaHasta={fechaHasta}
        onFechaHastaChange={handleFechaHastaChange}
        demorado={demorado}
        onDemoradoChange={handleDemoradoChange}
        orderBy={orderBy}
        onOrderByChange={handleOrderByChange}
        onClear={handleLimpiarFiltros}
        total={total}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Loader2 className="animate-spin mb-2 text-primary" size={28} />
          <p className="text-xs font-medium">Cargando bandeja de reclamos...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          <p role="alert">{error}</p>
        </div>
      ) : reclamos.length === 0 ? (
        hayFiltrosActivos ? (
          <EmptyState
            icon={Filter}
            title="Sin resultados para estos filtros"
            description="No se encontraron reclamos asignados que coincidan con los criterios seleccionados."
            actionLabel="Limpiar filtros"
            onAction={handleLimpiarFiltros}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No hay reclamos asignados"
            description="Tu institución no tiene reclamos pendientes de gestión en este momento."
          />
        )
      ) : (
        <InstitucionReclamoTable
          reclamos={reclamos}
          pagina={pagina}
          limite={limite}
          total={total}
          onCambiarPagina={setPagina}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted text-xs">
          <Loader2 className="animate-spin mx-auto text-primary" size={24} />
        </div>
      }
    >
      <BandejaReclamos />
    </Suspense>
  );
}
