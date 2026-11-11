"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Crown,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  Power,
  PowerOff,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Combobox from "@/components/ui/Combobox";
import apiClient from "@/services/apiClient";
import { PROVINCIAS_AR } from "@/utils/constants";

const TABS_ESTADO = [
  { key: "todas", label: "Todas" },
  { key: "activa", label: "Activas" },
  { key: "inactiva", label: "Inactivas" },
  { key: "sin_principal", label: "Sin Institución Principal" },
];

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    inactivas: 0,
    sin_principal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroProvincia, setFiltroProvincia] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  // Modales de acción
  const [modalActivar, setModalActivar] = useState(null); // ciudad a activar
  const [instPrincipalSeleccionada, setInstPrincipalSeleccionada] = useState("");

  const [modalDesactivar, setModalDesactivar] = useState(null); // ciudad a desactivar
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  const [modalPrincipal, setModalPrincipal] = useState(null); // ciudad para designar/cambiar principal
  const [nuevaPrincipalId, setNuevaPrincipalId] = useState("");

  // Modal registrar nueva localidad del padrón oficial
  const [modalNuevaCiudad, setModalNuevaCiudad] = useState(false);
  const [nuevaProvincia, setNuevaProvincia] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [localidadesPadron, setLocalidadesPadron] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const [procesando, setProcesando] = useState(false);

  const cargarCiudades = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/ciudades");
      if (res.data?.ok) {
        const lista = Array.isArray(res.data.data) ? res.data.data : [];
        setCiudades(lista);
        if (res.data.stats) {
          setStats(res.data.stats);
        } else {
          setStats({
            total: lista.length,
            activas: lista.filter((c) => Number(c.activa ?? 1) === 1).length,
            inactivas: lista.filter((c) => Number(c.activa ?? 1) === 0).length,
            sin_principal: lista.filter((c) => !c.id_institucion_principal).length,
          });
        }
      } else {
        setError("No se pudieron cargar las ciudades registradas.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor para consultar las ciudades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCiudades();
  }, [cargarCiudades]);

  // Cargar localidades del padrón oficial cuando se selecciona provincia en el modal de alta
  useEffect(() => {
    if (!modalNuevaCiudad || !nuevaProvincia) {
      setLocalidadesPadron([]);
      return;
    }

    let activo = true;
    setLoadingLocalidades(true);
    apiClient
      .get(`/ciudades/localidades?provincia=${encodeURIComponent(nuevaProvincia)}&limit=300`)
      .then((res) => {
        if (!activo) return;
        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setLocalidadesPadron(
          items.map((loc) => ({
            value: loc.nombre,
            label: loc.nombre,
            activa: Boolean(loc.activa),
          }))
        );
      })
      .catch(() => {
        if (activo) setLocalidadesPadron([]);
      })
      .finally(() => {
        if (activo) setLoadingLocalidades(false);
      });

    return () => {
      activo = false;
    };
  }, [modalNuevaCiudad, nuevaProvincia]);

  const provinciasDisponibles = useMemo(() => {
    const setProv = new Set();
    ciudades.forEach((c) => {
      if (c.provincia) setProv.add(c.provincia);
    });
    return [
      { value: "todas", label: "Todas las provincias" },
      ...Array.from(setProv)
        .sort()
        .map((p) => ({ value: p, label: p })),
    ];
  }, [ciudades]);

  const ciudadesFiltradas = useMemo(() => {
    return ciudades.filter((c) => {
      const esActiva = Number(c.activa ?? 1) === 1;
      if (filtroEstado === "activa" && !esActiva) return false;
      if (filtroEstado === "inactiva" && esActiva) return false;
      if (filtroEstado === "sin_principal" && c.id_institucion_principal) return false;

      if (
        filtroProvincia !== "todas" &&
        String(c.provincia || "").toLowerCase() !== filtroProvincia.toLowerCase()
      ) {
        return false;
      }

      if (busqueda.trim()) {
        const q = busqueda.trim().toLowerCase();
        const matchNombre = String(c.nombre || "").toLowerCase().includes(q);
        const matchProv = String(c.provincia || "").toLowerCase().includes(q);
        const matchPrincipal = String(c.institucion_principal_nombre || "")
          .toLowerCase()
          .includes(q);
        if (!matchNombre && !matchProv && !matchPrincipal) return false;
      }

      return true;
    });
  }, [ciudades, filtroEstado, filtroProvincia, busqueda]);

  // Abrir modal de activación
  const abrirModalActivar = (ciudad) => {
    const elegibles = Array.isArray(ciudad.instituciones_elegibles)
      ? ciudad.instituciones_elegibles
      : [];
    const defaultInst =
      ciudad.id_institucion_principal ||
      (elegibles.length > 0 ? String(elegibles[0].id) : "");
    setInstPrincipalSeleccionada(defaultInst ? String(defaultInst) : "");
    setModalActivar(ciudad);
  };

  // Confirmar activación de ciudad
  const handleConfirmarActivar = async () => {
    if (!modalActivar) return;
    if (!instPrincipalSeleccionada) {
      toast.error(
        "Seleccioná una institución principal verificada y activa para activar la ciudad."
      );
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.patch(`/admin/ciudades/${modalActivar.id}/estado`, {
        activa: true,
        id_institucion_principal: Number(instPrincipalSeleccionada),
      });
      if (res.data?.ok) {
        toast.success(
          res.data.mensaje || `La ciudad ${modalActivar.nombre} fue activada correctamente.`
        );
        setModalActivar(null);
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.mensaje ||
          "No se pudo activar la ciudad. Verificá que posea una institución principal activa."
      );
    } finally {
      setProcesando(false);
    }
  };

  // Abrir modal de desactivación
  const abrirModalDesactivar = (ciudad) => {
    setMotivoDesactivacion("");
    setErrorMotivo("");
    setModalDesactivar(ciudad);
  };

  // Confirmar desactivación de ciudad
  const handleConfirmarDesactivar = async () => {
    if (!modalDesactivar) return;
    const motivoLimpio = motivoDesactivacion.trim();
    if (!motivoLimpio) {
      setErrorMotivo("El motivo de desactivación es obligatorio.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.patch(`/admin/ciudades/${modalDesactivar.id}/estado`, {
        activa: false,
        motivo: motivoLimpio,
      });
      if (res.data?.ok) {
        toast.success(
          res.data.mensaje || `La ciudad ${modalDesactivar.nombre} fue desactivada.`
        );
        setModalDesactivar(null);
        setMotivoDesactivacion("");
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.mensaje || "No se pudo desactivar la ciudad."
      );
    } finally {
      setProcesando(false);
    }
  };

  // Abrir modal para designar o cambiar institución principal
  const abrirModalPrincipal = (ciudad) => {
    const elegibles = Array.isArray(ciudad.instituciones_elegibles)
      ? ciudad.instituciones_elegibles
      : [];
    const actual =
      ciudad.id_institucion_principal ||
      (elegibles.length > 0 ? String(elegibles[0].id) : "");
    setNuevaPrincipalId(actual ? String(actual) : "");
    setModalPrincipal(ciudad);
  };

  // Confirmar designación de institución principal
  const handleConfirmarPrincipal = async () => {
    if (!modalPrincipal || !nuevaPrincipalId) return;

    setProcesando(true);
    try {
      const res = await apiClient.put(
        `/admin/ciudades/${modalPrincipal.id}/institucion-principal`,
        {
          id_institucion: Number(nuevaPrincipalId),
        }
      );
      if (res.data?.ok) {
        toast.success(
          res.data.mensaje || "Institución principal actualizada correctamente."
        );
        setModalPrincipal(null);
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.mensaje ||
          "No se pudo designar la institución principal."
      );
    } finally {
      setProcesando(false);
    }
  };

  // Registrar nueva localidad del padrón oficial
  const handleRegistrarCiudad = async () => {
    if (!nuevaProvincia || !nuevaLocalidad) {
      toast.error("Seleccioná la provincia y la localidad oficial.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.post("/admin/ciudades", {
        provincia: nuevaProvincia,
        nombre: nuevaLocalidad,
      });
      if (res.data?.ok) {
        toast.success(
          res.data.mensaje ||
            `Localidad ${nuevaLocalidad} registrada en estado inactivo.`
        );
        setModalNuevaCiudad(false);
        setNuevaProvincia("");
        setNuevaLocalidad("");
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.mensaje || "No se pudo registrar la localidad."
      );
    } finally {
      setProcesando(false);
    }
  };

  const statCards = [
    {
      label: "TOTAL REGISTRADAS",
      value: stats.total ?? ciudades.length,
      sub: "Localidades en padrón operativo",
      icon: <Globe2 size={20} className="text-primary" />,
      bgIcon: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "CIUDADES ACTIVAS",
      value: stats.activas ?? 0,
      sub: "Habilitadas para reclamos y comunicados",
      icon: <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />,
      bgIcon:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "CIUDADES INACTIVAS",
      value: stats.inactivas ?? 0,
      sub: "Sin operación activa habilitada",
      icon: <PowerOff size={20} className="text-amber-600 dark:text-amber-400" />,
      bgIcon:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: "SIN INSTITUCIÓN PRINCIPAL",
      value: stats.sin_principal ?? 0,
      sub: "Requieren designar responsable general",
      icon: <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Administración Territorial"
        description="Gestión de ciudades operativas, designación de institución principal y cobertura territorial."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setNuevaProvincia("");
                setNuevaLocalidad("");
                setModalNuevaCiudad(true);
              }}
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
            >
              Registrar localidad
            </Button>
            <Button
              onClick={cargarCiudades}
              variant="outline"
              size="sm"
              loading={loading}
              leftIcon={<RefreshCw size={14} />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Tarjetas de métricas territoriales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-surface rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                {card.label}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-surface-subtle animate-pulse rounded-md" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-text-muted m-0">{card.sub}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.bgIcon}`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de filtros */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Pestañas de estado */}
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border-subtle w-fit">
            {TABS_ESTADO.map((tab) => {
              const isActiva = filtroEstado === tab.key;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={isActiva ? "outline" : "ghost"}
                  onClick={() => setFiltroEstado(tab.key)}
                  className={
                    isActiva
                      ? "bg-surface text-primary font-bold shadow-2xs"
                      : "text-text-muted"
                  }
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Buscador y filtro de provincia */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="w-full sm:w-56">
              <Select
                value={filtroProvincia}
                onChange={(val) => setFiltroProvincia(val)}
                options={provinciasDisponibles}
                placeholder="Filtrar por provincia"
              />
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar ciudad o institución..."
                leftIcon={<Search size={15} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de ciudades */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary m-0">
              Padrón Territorial de Ciudades
            </h3>
            <p className="text-xs text-text-muted m-0 mt-0.5">
              {ciudadesFiltradas.length}{" "}
              {ciudadesFiltradas.length === 1
                ? "localidad encontrada"
                : "localidades encontradas"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando datos territoriales...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
            <Button onClick={cargarCiudades} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : ciudadesFiltradas.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-xs space-y-2 px-4">
            <p className="font-semibold text-text-primary m-0">
              No se encontraron localidades con los filtros seleccionados.
            </p>
            <p className="m-0">
              Podés limpiar los filtros de búsqueda o registrar una nueva localidad desde el botón superior.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ciudad y Provincia</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Institución Principal</th>
                  <th className="py-3 px-4">Comunidad y Actividad</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {ciudadesFiltradas.map((c) => {
                  const esActiva = Number(c.activa ?? 1) === 1;
                  const tienePrincipal = Boolean(c.id_institucion_principal);
                  const elegibles = Array.isArray(c.instituciones_elegibles)
                    ? c.instituciones_elegibles
                    : [];

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-subtle/50 transition-colors"
                    >
                      {/* Ciudad y Provincia */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                              esActiva
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-surface-subtle text-text-muted border-border-subtle"
                            }`}
                          >
                            <MapPin size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary m-0">
                              {c.nombre}
                            </p>
                            <p className="text-[11px] text-text-muted m-0">
                              {c.provincia}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Estado Operativo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {esActiva ? (
                          <Badge variant="success" size="sm">
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Inactiva
                          </Badge>
                        )}
                      </td>

                      {/* Institución Principal */}
                      <td className="py-3.5 px-4">
                        {tienePrincipal ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Crown
                                size={13}
                                className="text-amber-500 shrink-0"
                              />
                              <span className="font-bold text-text-primary">
                                {c.institucion_principal_nombre}
                              </span>
                            </div>
                            <span className="text-[11px] text-text-muted">
                              Responsable general de la ciudad
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge variant="danger" size="sm">
                              Sin institución principal
                            </Badge>
                            <span className="text-[11px] text-text-muted">
                              {elegibles.length > 0
                                ? `${elegibles.length} ${
                                    elegibles.length === 1
                                      ? "institución verificada disponible"
                                      : "instituciones verificadas disponibles"
                                  }`
                                : "Requiere verificar al menos una institución"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Comunidad y Actividad */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-3 text-text-secondary">
                          <span
                            className="inline-flex items-center gap-1"
                            title="Instituciones verificadas y activas"
                          >
                            <Building2 size={13} className="text-text-muted" />
                            <strong className="text-text-primary">
                              {c.instituciones_verificadas ?? 0}
                            </strong>{" "}
                            inst.
                            {Number(c.instituciones_pendientes) > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                                +{c.instituciones_pendientes} pend.
                              </span>
                            )}
                          </span>

                          <span
                            className="inline-flex items-center gap-1"
                            title="Ciudadanos registrados en la localidad"
                          >
                            <Users size={13} className="text-text-muted" />
                            <strong className="text-text-primary">
                              {c.ciudadanos_total ?? 0}
                            </strong>{" "}
                            vecinos
                          </span>

                          <span
                            className="inline-flex items-center gap-1"
                            title="Total de reclamos en la ciudad"
                          >
                            <FileText size={13} className="text-text-muted" />
                            <strong className="text-text-primary">
                              {c.reclamos_total ?? 0}
                            </strong>{" "}
                            reclamos
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            onClick={() => abrirModalPrincipal(c)}
                            variant="outline"
                            size="sm"
                            leftIcon={<Crown size={13} />}
                            title="Designar o cambiar la institución principal de la ciudad"
                          >
                            {tienePrincipal ? "Cambiar principal" : "Designar principal"}
                          </Button>

                          {esActiva ? (
                            <Button
                              onClick={() => abrirModalDesactivar(c)}
                              variant="danger-soft"
                              size="sm"
                              leftIcon={<PowerOff size={13} />}
                            >
                              Desactivar
                            </Button>
                          ) : (
                            <Button
                              onClick={() => abrirModalActivar(c)}
                              variant="success"
                              size="sm"
                              leftIcon={<Power size={13} />}
                            >
                              Activar
                            </Button>
                          )}
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

      {/* Modal: Activar Ciudad */}
      <ConfirmModal
        isOpen={Boolean(modalActivar)}
        onClose={() => setModalActivar(null)}
        onConfirm={handleConfirmarActivar}
        title={
          modalActivar
            ? `Activar ciudad: ${modalActivar.nombre}`
            : "Activar ciudad"
        }
        description={
          modalActivar
            ? `Para habilitar operativamente ${modalActivar.nombre} (${modalActivar.provincia}), debe contar con una institución principal verificada y activa que actúe como responsable general de la localidad.`
            : ""
        }
        variant="success"
        confirmText="Activar ciudad"
        loading={procesando}
        confirmDisabled={
          !instPrincipalSeleccionada ||
          (modalActivar?.instituciones_elegibles || []).length === 0
        }
      >
        {modalActivar && (
          <div className="space-y-3 pt-2">
            {(modalActivar.instituciones_elegibles || []).length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <p className="font-bold m-0">
                  No hay instituciones verificadas y activas en {modalActivar.nombre}
                </p>
                <p className="m-0 leading-relaxed">
                  Una ciudad no puede activarse sin una institución principal válida. Verificá primero la solicitud de la municipalidad o entidad principal de esta ciudad.
                </p>
                <div className="pt-1">
                  <Link href="/admin/solicitudes">
                    <Button variant="outline" size="sm">
                      Ir a Bandeja de Solicitudes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Select
                label="Institución Principal de la Ciudad"
                value={instPrincipalSeleccionada}
                onChange={(val) => setInstPrincipalSeleccionada(String(val))}
                options={(modalActivar.instituciones_elegibles || []).map(
                  (inst) => ({
                    value: String(inst.id),
                    label: `${inst.nombre}${inst.tipo ? ` (${inst.tipo})` : ""}`,
                  })
                )}
                placeholder="Seleccioná la institución principal..."
              />
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Modal: Desactivar Ciudad */}
      <ConfirmModal
        isOpen={Boolean(modalDesactivar)}
        onClose={() => setModalDesactivar(null)}
        onConfirm={handleConfirmarDesactivar}
        title={
          modalDesactivar
            ? `Desactivar ciudad: ${modalDesactivar.nombre}`
            : "Desactivar ciudad"
        }
        description={
          modalDesactivar
            ? `Al desactivar ${modalDesactivar.nombre}, los ciudadanos no podrán registrar nuevos reclamos en esta localidad hasta que vuelva a habilitarse.`
            : ""
        }
        variant="danger"
        confirmText="Desactivar ciudad"
        loading={procesando}
      >
        <div className="pt-2">
          <Textarea
            label="Motivo de desactivación *"
            value={motivoDesactivacion}
            onChange={(e) => {
              setMotivoDesactivacion(e.target.value);
              if (errorMotivo) setErrorMotivo("");
            }}
            placeholder="Explicá el motivo administrativo u operativo de la desactivación..."
            rows={3}
            error={errorMotivo}
          />
        </div>
      </ConfirmModal>

      {/* Modal: Designar / Cambiar Institución Principal */}
      <ConfirmModal
        isOpen={Boolean(modalPrincipal)}
        onClose={() => setModalPrincipal(null)}
        onConfirm={handleConfirmarPrincipal}
        title={
          modalPrincipal
            ? `Institución Principal de ${modalPrincipal.nombre}`
            : "Designar Institución Principal"
        }
        description="La institución principal actúa como responsable general de la comunidad y recibe los reclamos que no posean una institución especializada asignada."
        variant="primary"
        confirmText="Guardar institución principal"
        loading={procesando}
        confirmDisabled={
          !nuevaPrincipalId ||
          (modalPrincipal?.instituciones_elegibles || []).length === 0
        }
      >
        {modalPrincipal && (
          <div className="space-y-3 pt-2">
            {(modalPrincipal.instituciones_elegibles || []).length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <p className="font-bold m-0">
                  Sin instituciones verificadas elegibles en {modalPrincipal.nombre}
                </p>
                <p className="m-0 leading-relaxed">
                  Solo una institución verificada y activa perteneciente a esta localidad puede ser designada como institución principal.
                </p>
                <div className="pt-1">
                  <Link href="/admin/solicitudes">
                    <Button variant="outline" size="sm">
                      Revisar solicitudes pendientes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Select
                label="Seleccionar institución verificada y activa"
                value={nuevaPrincipalId}
                onChange={(val) => setNuevaPrincipalId(String(val))}
                options={(modalPrincipal.instituciones_elegibles || []).map(
                  (inst) => ({
                    value: String(inst.id),
                    label: `${inst.nombre}${
                      Number(inst.es_principal) === 1 ? " (Principal actual)" : ""
                    }`,
                  })
                )}
                placeholder="Seleccioná una institución..."
              />
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Modal: Registrar nueva localidad del padrón oficial */}
      <ConfirmModal
        isOpen={modalNuevaCiudad}
        onClose={() => setModalNuevaCiudad(false)}
        onConfirm={handleRegistrarCiudad}
        title="Registrar localidad en el padrón territorial"
        description="Incorporá una localidad oficial de Argentina al listado territorial. Se registrará inicialmente en estado Inactiva hasta que se verifique y asigne su institución principal."
        variant="primary"
        confirmText="Registrar localidad"
        loading={procesando}
        confirmDisabled={!nuevaProvincia || !nuevaLocalidad}
      >
        <div className="space-y-4 pt-2">
          <Select
            label="Provincia *"
            value={nuevaProvincia}
            onChange={(val) => {
              setNuevaProvincia(val);
              setNuevaLocalidad("");
            }}
            options={PROVINCIAS_AR.map((p) => ({ value: p, label: p }))}
            placeholder="Seleccioná una provincia..."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-secondary">
              Localidad oficial *
            </label>
            <Combobox
              id="nueva-localidad-admin"
              value={nuevaLocalidad}
              onChange={(val) => setNuevaLocalidad(val)}
              options={localidadesPadron}
              placeholder={
                nuevaProvincia
                  ? "Seleccionar o buscar localidad..."
                  : "Primero elegí una provincia"
              }
              searchPlaceholder="Escribí para buscar localidad..."
              disabled={!nuevaProvincia}
              loading={loadingLocalidades}
            />
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
