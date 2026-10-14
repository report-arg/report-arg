"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  UserCheck,
  UserX,
  Shield,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  User as UserIcon,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import UserAvatar from "./UserAvatar";
import UserFilterBar from "./UserFilterBar";
import UserStatusModal from "./UserStatusModal";

const ROL_CONFIG = {
  admin: {
    label: "Administrador",
    cls: "bg-primary/10 text-primary border-primary/20",
    icon: Shield,
  },
  institucion: {
    label: "Institución",
    cls: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
    icon: Building2,
  },
  ciudadano: {
    label: "Ciudadano",
    cls: "bg-surface-subtle text-text-secondary border-border-subtle",
    icon: UserIcon,
  },
};

export default function UserTable() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id || 0);

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const limite = 15;
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Modal de confirmación para inhabilitar / rehabilitar
  const [modalAccion, setModalAccion] = useState({
    isOpen: false,
    usuario: null,
    tipo: "inhabilitar", // 'inhabilitar' | 'rehabilitar'
    loading: false,
    error: "",
  });

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedBusqueda) params.append("busqueda", debouncedBusqueda);
      if (filtroRol !== "Todos") params.append("rol", filtroRol);
      if (filtroEstado !== "Todos") params.append("estado", filtroEstado);
      params.append("pagina", String(pagina));
      params.append("limite", String(limite));

      const res = await apiClient.get(`/admin/usuarios?${params.toString()}`);
      const data = res.data;
      if (data?.ok) {
        setUsuarios(data.data || []);
        setTotal(Number(data.total || 0));
        setTotalPaginas(Number(data.totalPaginas || 1));
      } else {
        setError(data?.mensaje || "Error al cargar la lista de usuarios.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor para consultar usuarios.");
    } finally {
      setLoading(false);
    }
  }, [debouncedBusqueda, filtroRol, filtroEstado, pagina, limite]);

  // Efecto cuando cambian los filtros
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchUsuarios();
      return;
    }
    fetchUsuarios();
  }, [debouncedBusqueda, filtroRol, filtroEstado, pagina, fetchUsuarios]);

  // Manejar búsqueda y filtros reseteando página
  const handleBusquedaChange = (val) => {
    setBusqueda(val);
    setPagina(1);
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
    setPagina(1);
  };

  const handleFiltroRolChange = (val) => {
    setFiltroRol(val);
    setPagina(1);
  };

  const handleFiltroEstadoChange = (val) => {
    setFiltroEstado(val);
    setPagina(1);
  };

  const handleLimpiarTodo = () => {
    setBusqueda("");
    setFiltroRol("Todos");
    setFiltroEstado("Todos");
    setPagina(1);
  };

  // Abrir modal de confirmación con salvaguarda de auto-inhabilitación
  function abrirModalCambioEstado(usuario, tipo) {
    if (usuario.id === currentUserId && tipo === "inhabilitar") {
      alert("No podés inhabilitar tu propia cuenta administradora.");
      return;
    }
    setModalAccion({
      isOpen: true,
      usuario,
      tipo,
      loading: false,
      error: "",
    });
  }

  // Confirmar inhabilitación o rehabilitación
  async function confirmarCambioEstado() {
    if (!modalAccion.usuario) return;
    const { usuario, tipo } = modalAccion;
    const nuevoEstado = tipo === "inhabilitar" ? "inactivo" : "activo";

    setModalAccion((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const res = await apiClient.patch(`/admin/usuarios/${usuario.id}/estado`, {
        estado: nuevoEstado,
      });

      if (res.data?.ok) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === usuario.id ? { ...u, estado: nuevoEstado } : u))
        );
        setModalAccion({ isOpen: false, usuario: null, tipo: "inhabilitar", loading: false, error: "" });
      } else {
        setModalAccion((prev) => ({
          ...prev,
          loading: false,
          error: res.data?.mensaje || "Error al actualizar el estado del usuario.",
        }));
      }
    } catch (err) {
      setModalAccion((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.mensaje || "Ocurrió un error al procesar la solicitud.",
      }));
    }
  }

  const hayFiltrosActivos =
    busqueda.trim() !== "" || filtroRol !== "Todos" || filtroEstado !== "Todos";

  return (
    <div className="space-y-4">
      {/* 1. Barra de Filtros y Búsqueda */}
      <UserFilterBar
        busqueda={busqueda}
        onBusquedaChange={handleBusquedaChange}
        onLimpiarBusqueda={handleLimpiarBusqueda}
        filtroRol={filtroRol}
        onFiltroRolChange={handleFiltroRolChange}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={handleFiltroEstadoChange}
        onLimpiarTodo={handleLimpiarTodo}
        hayFiltrosActivos={hayFiltrosActivos}
      />

      {/* 2. Contenedor de la Tabla */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {/* Error */}
        {error && (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-rose-600 font-semibold m-0">{error}</p>
            <Button onClick={() => fetchUsuarios()} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando usuarios del sistema...</span>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && usuarios.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <UserIcon size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary m-0">No se encontraron usuarios</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              {hayFiltrosActivos
                ? "No hay resultados para los filtros seleccionados."
                : "No hay usuarios registrados en el sistema."}
            </p>
            {hayFiltrosActivos && (
              <Button
                onClick={handleLimpiarTodo}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Listado de Usuarios */}
        {!loading && !error && usuarios.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Estado de Cuenta</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {usuarios.map((u) => {
                    const rolCfg = ROL_CONFIG[u.rol] || ROL_CONFIG.ciudadano;
                    const RolIcon = rolCfg.icon;
                    const esActivo = u.estado === "activo";
                    const esMiCuenta = u.id === currentUserId;

                    return (
                      <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                        {/* Usuario */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              nombre={u.nombre}
                              foto={u.foto}
                              email={u.email}
                              rol={u.rol}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary m-0 truncate">
                                {u.nombre || "Usuario sin nombre"}
                                {esMiCuenta && (
                                  <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-semibold">
                                    Tú
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-text-muted m-0 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${rolCfg.cls}`}
                          >
                            <RolIcon size={12} />
                            {rolCfg.label}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4">
                          {esActivo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Inactivo
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link href={`/admin/users/${u.id}/edit`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Edit2 size={12} />}
                                title="Editar datos del usuario"
                              >
                                Editar
                              </Button>
                            </Link>

                            {esActivo ? (
                              <Button
                                onClick={() => abrirModalCambioEstado(u, "inhabilitar")}
                                variant="danger-soft"
                                size="sm"
                                leftIcon={<UserX size={12} />}
                                disabled={esMiCuenta}
                                title={
                                  esMiCuenta
                                    ? "No podés inhabilitar tu propia cuenta"
                                    : "Inhabilitar acceso"
                                }
                              >
                                Inhabilitar
                              </Button>
                            ) : (
                              <Button
                                onClick={() => abrirModalCambioEstado(u, "rehabilitar")}
                                variant="success"
                                size="sm"
                                leftIcon={<UserCheck size={12} />}
                                title="Reactivar cuenta de usuario"
                              >
                                Habilitar
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border-subtle">
              {usuarios.map((u) => {
                const rolCfg = ROL_CONFIG[u.rol] || ROL_CONFIG.ciudadano;
                const RolIcon = rolCfg.icon;
                const esActivo = u.estado === "activo";
                const esMiCuenta = u.id === currentUserId;

                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          nombre={u.nombre}
                          foto={u.foto}
                          email={u.email}
                          rol={u.rol}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary m-0 truncate">
                            {u.nombre || "Sin nombre"}
                            {esMiCuenta && (
                              <span className="ml-1 text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded-sm">
                                Tú
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-text-muted m-0 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${rolCfg.cls}`}
                      >
                        <RolIcon size={10} />
                        {rolCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {esActivo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Inactivo
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/users/${u.id}/edit`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit2 size={12} />}>
                            Editar
                          </Button>
                        </Link>
                        {esActivo ? (
                          <Button
                            onClick={() => abrirModalCambioEstado(u, "inhabilitar")}
                            variant="danger-soft"
                            size="sm"
                            disabled={esMiCuenta}
                            leftIcon={<UserX size={12} />}
                          >
                            Inhabilitar
                          </Button>
                        ) : (
                          <Button
                            onClick={() => abrirModalCambioEstado(u, "rehabilitar")}
                            variant="success"
                            size="sm"
                            leftIcon={<UserCheck size={12} />}
                          >
                            Habilitar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span>
                  Total: <strong className="text-text-primary">{total}</strong> usuarios (página {pagina} de {totalPaginas})
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                    disabled={pagina <= 1}
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                    disabled={pagina >= totalPaginas}
                    variant="outline"
                    size="sm"
                    rightIcon={<ChevronRight size={14} />}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Modal de Inhabilitación / Rehabilitación */}
      <UserStatusModal
        isOpen={modalAccion.isOpen}
        onClose={() => setModalAccion((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmarCambioEstado}
        usuario={modalAccion.usuario}
        tipo={modalAccion.tipo}
        loading={modalAccion.loading}
        error={modalAccion.error}
      />
    </div>
  );
}
