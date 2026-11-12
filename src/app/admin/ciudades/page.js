"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import apiClient from "@/services/apiClient";

import CiudadStatsCards from "@/components/admin/ciudades/CiudadStatsCards";
import CiudadFilterBar from "@/components/admin/ciudades/CiudadFilterBar";
import CiudadTable from "@/components/admin/ciudades/CiudadTable";
import CiudadModals from "@/components/admin/ciudades/CiudadModals";

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState([]);
  const [stats, setStats] = useState({ total: 0, activas: 0, inactivas: 0, sin_principal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroProvincia, setFiltroProvincia] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  // Modales de acción
  const [modalActivar, setModalActivar] = useState(null);
  const [instPrincipalSeleccionada, setInstPrincipalSeleccionada] = useState("");

  const [modalDesactivar, setModalDesactivar] = useState(null);
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  const [modalPrincipal, setModalPrincipal] = useState(null);
  const [nuevaPrincipalId, setNuevaPrincipalId] = useState("");

  const [modalNuevaCiudad, setModalNuevaCiudad] = useState(false);
  const [nuevaProvincia, setNuevaProvincia] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [localidadesPadron, setLocalidadesPadron] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const [procesando, setProcesando] = useState(false);

  // Cargar ciudades desde la API
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
    } catch {
      setError("Error al conectar con el servidor para consultar las ciudades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCiudades();
  }, [cargarCiudades]);

  // Cargar localidades del padrón oficial al seleccionar provincia
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
      ...Array.from(setProv).sort().map((p) => ({ value: p, label: p })),
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
        const matchPrincipal = String(c.institucion_principal_nombre || "").toLowerCase().includes(q);
        if (!matchNombre && !matchProv && !matchPrincipal) return false;
      }

      return true;
    });
  }, [ciudades, filtroEstado, filtroProvincia, busqueda]);

  // Handlers para abrir modales
  const abrirModalActivar = (ciudad) => {
    const elegibles = Array.isArray(ciudad.instituciones_elegibles) ? ciudad.instituciones_elegibles : [];
    const defaultInst = ciudad.id_institucion_principal || (elegibles.length > 0 ? String(elegibles[0].id) : "");
    setInstPrincipalSeleccionada(defaultInst ? String(defaultInst) : "");
    setModalActivar(ciudad);
  };

  const abrirModalDesactivar = (ciudad) => {
    setMotivoDesactivacion("");
    setErrorMotivo("");
    setModalDesactivar(ciudad);
  };

  const abrirModalPrincipal = (ciudad) => {
    const elegibles = Array.isArray(ciudad.instituciones_elegibles) ? ciudad.instituciones_elegibles : [];
    const actual = ciudad.id_institucion_principal || (elegibles.length > 0 ? String(elegibles[0].id) : "");
    setNuevaPrincipalId(actual ? String(actual) : "");
    setModalPrincipal(ciudad);
  };

  // Handlers de confirmación en la API
  const handleConfirmarActivar = async () => {
    if (!modalActivar) return;
    if (!instPrincipalSeleccionada) {
      toast.error("Seleccioná una institución principal verificada y activa para activar la ciudad.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.patch(`/admin/ciudades/${modalActivar.id}/estado`, {
        activa: true,
        id_institucion_principal: Number(instPrincipalSeleccionada),
      });
      if (res.data?.ok) {
        toast.success(res.data.mensaje || `La ciudad ${modalActivar.nombre} fue activada correctamente.`);
        setModalActivar(null);
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.mensaje || "No se pudo activar la ciudad. Verificá que posea una institución principal activa."
      );
    } finally {
      setProcesando(false);
    }
  };

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
        toast.success(res.data.mensaje || `La ciudad ${modalDesactivar.nombre} fue desactivada.`);
        setModalDesactivar(null);
        setMotivoDesactivacion("");
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "No se pudo desactivar la ciudad.");
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarPrincipal = async () => {
    if (!modalPrincipal || !nuevaPrincipalId) return;

    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/ciudades/${modalPrincipal.id}/institucion-principal`, {
        id_institucion: Number(nuevaPrincipalId),
      });
      if (res.data?.ok) {
        toast.success(res.data.mensaje || "Institución principal actualizada correctamente.");
        setModalPrincipal(null);
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "No se pudo designar la institución principal.");
    } finally {
      setProcesando(false);
    }
  };

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
        toast.success(res.data.mensaje || `Localidad ${nuevaLocalidad} registrada en estado inactivo.`);
        setModalNuevaCiudad(false);
        setNuevaProvincia("");
        setNuevaLocalidad("");
        await cargarCiudades();
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "No se pudo registrar la localidad.");
    } finally {
      setProcesando(false);
    }
  };

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

      {/* 1. Tarjetas de métricas territoriales */}
      <CiudadStatsCards stats={stats} loading={loading} />

      {/* 2. Barra de filtros */}
      <CiudadFilterBar
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroProvincia={filtroProvincia}
        onFiltroProvinciaChange={setFiltroProvincia}
        provinciasDisponibles={provinciasDisponibles}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      {/* 3. Tabla de ciudades */}
      <CiudadTable
        ciudades={ciudadesFiltradas}
        loading={loading}
        error={error}
        onReintentar={cargarCiudades}
        onAbrirPrincipal={abrirModalPrincipal}
        onAbrirActivar={abrirModalActivar}
        onAbrirDesactivar={abrirModalDesactivar}
      />

      {/* 4. Modales de acción territorial */}
      <CiudadModals
        modalActivar={modalActivar}
        onCloseActivar={() => setModalActivar(null)}
        onConfirmActivar={handleConfirmarActivar}
        instPrincipalSeleccionada={instPrincipalSeleccionada}
        setInstPrincipalSeleccionada={setInstPrincipalSeleccionada}
        modalDesactivar={modalDesactivar}
        onCloseDesactivar={() => setModalDesactivar(null)}
        onConfirmDesactivar={handleConfirmarDesactivar}
        motivoDesactivacion={motivoDesactivacion}
        setMotivoDesactivacion={setMotivoDesactivacion}
        errorMotivo={errorMotivo}
        setErrorMotivo={setErrorMotivo}
        modalPrincipal={modalPrincipal}
        onClosePrincipal={() => setModalPrincipal(null)}
        onConfirmPrincipal={handleConfirmarPrincipal}
        nuevaPrincipalId={nuevaPrincipalId}
        setNuevaPrincipalId={setNuevaPrincipalId}
        modalNuevaCiudad={modalNuevaCiudad}
        onCloseNuevaCiudad={() => setModalNuevaCiudad(false)}
        onConfirmNuevaCiudad={handleRegistrarCiudad}
        nuevaProvincia={nuevaProvincia}
        setNuevaProvincia={setNuevaProvincia}
        nuevaLocalidad={nuevaLocalidad}
        setNuevaLocalidad={setNuevaLocalidad}
        localidadesPadron={localidadesPadron}
        loadingLocalidades={loadingLocalidades}
        procesando={procesando}
      />
    </div>
  );
}
