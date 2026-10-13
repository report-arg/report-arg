"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  X,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { tiempoRelativo } from "@/utils/dateFormatters";

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

function UserAvatar({ nombre, foto, email, rol }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre || email || "Avatar"}
        className="w-9 h-9 rounded-full object-cover border border-border-subtle shrink-0"
      />
    );
  }
  const label = nombre || email?.split("@")[0] || "?";
  const iniciales = label
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bgCls =
    rol === "admin"
      ? "bg-primary/15 text-primary"
      : rol === "institucion"
      ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
      : "bg-surface-subtle text-text-muted";

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-border-subtle/60 ${bgCls}`}
    >
      {iniciales}
    </div>
  );
}

export default function UserTable() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id || 0);

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(15);
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

  // Debounce para búsqueda
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda.trim());
      setPagina(1); // Volver a la primera página al cambiar búsqueda
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    fetchUsuarios();
  }, [debouncedBusqueda, filtroRol, filtroEstado, pagina]);

  async function fetchUsuarios() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedBusqueda) params.append("busqueda", debouncedBusqueda);
      if (filtroRol !== "Todos") params.append("rol", filtroRol);
      if (filtroEstado !== "Todos") params.append("estado", filtroEstado);
      params.append("pagina", pagina);
      params.append("limite", limite);

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
      console.error("Error al obtener usuarios:", err);
      setError("No se pudo conectar con el servidor para consultar usuarios.");
    } finally {
      setLoading(false);
    }
  }

  // Abrir modal de confirmación
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

  // Confirmar inhabilitación o rehabilitación atómica
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
        // Actualizar el estado en la lista local sin recargar forzosamente
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

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroRol("Todos");
    setFiltroEstado("Todos");
    setPagina(1);
  }

  return (
    <div className="space-y-4">
      {/* Modal Confirmación Inhabilitar / Rehabilitar */}
      <ConfirmModal
        isOpen={modalAccion.isOpen}
        onClose={() =>
          !modalAccion.loading &&
          setModalAccion({ isOpen: false, usuario: null, tipo: "inhabilitar", loading: false, error: "" })
        }
        onConfirm={confirmarCambioEstado}
        title={
          modalAccion.tipo === "inhabilitar"
            ? "¿Inhabilitar cuenta de usuario?"
            : "¿Rehabilitar cuenta de usuario?"
        }
        description={
          modalAccion.tipo === "inhabilitar" ? (
            <span>
              El usuario <strong>{modalAccion.usuario?.nombre || modalAccion.usuario?.email}</strong>{" "}
              quedará inactivo y <strong>no podrá iniciar sesión</strong> en ReportARG. Sus registros
              e historial permanecerán intactos y la cuenta podrá ser rehabilitada en cualquier
              momento.
            </span>
          ) : (
            <span>
              Se reactivará la cuenta de{" "}
              <strong>{modalAccion.usuario?.nombre || modalAccion.usuario?.email}</strong>. El usuario
              podrá iniciar sesión normalmente y volver a interactuar con la plataforma.
            </span>
          )
        }
        variant={modalAccion.tipo === "inhabilitar" ? "danger" : "success"}
        confirmText={
          modalAccion.tipo === "inhabilitar" ? "Inhabilitar cuenta" : "Rehabilitar cuenta"
        }
        loading={modalAccion.loading}
        loadingText="Procesando..."
      >
        {modalAccion.error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {modalAccion.error}
          </div>
        )}
      </ConfirmModal>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full text-xs py-2.5 pl-10 pr-8 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary placeholder:text-text-muted outline-hidden transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-1"
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro por Rol */}
          <div className="flex items-center gap-2">
            <select
              value={filtroRol}
              onChange={(e) => {
                setFiltroRol(e.target.value);
                setPagina(1);
              }}
              className="text-xs py-2.5 px-3 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary outline-hidden cursor-pointer transition-all"
            >
              <option value="Todos">Todos los roles</option>
              <option value="ciudadano">Ciudadano</option>
              <option value="institucion">Institución</option>
              <option value="admin">Administrador</option>
            </select>

            {/* Filtro por Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              className="text-xs py-2.5 px-3 rounded-xl bg-surface-subtle border border-border-subtle focus:bg-surface focus:border-primary text-text-primary outline-hidden cursor-pointer transition-all"
            >
              <option value="Todos">Todos los estados</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>

            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-xs px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary bg-surface-subtle hover:bg-border-subtle/60 transition-colors cursor-pointer shrink-0"
                title="Limpiar todos los filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>
            {loading ? (
              "Consultando usuarios..."
            ) : total === 0 ? (
              "No se encontraron resultados"
            ) : (
              <>
                Mostrando <strong className="text-text-primary">{usuarios.length}</strong> de{" "}
                <strong className="text-text-primary">{total}</strong> usuarios registrados
              </>
            )}
          </span>

          {totalPaginas > 1 && (
            <span>
              Página <strong className="text-text-primary">{pagina}</strong> de{" "}
              <strong className="text-text-primary">{totalPaginas}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchUsuarios}
            className="font-bold underline hover:text-rose-950 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla y Lista de Usuarios */}
      <div className="rounded-2xl bg-surface border border-border-subtle shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
            <Loader2 size={22} className="animate-spin text-primary" />
            <span>Cargando datos de usuarios...</span>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted space-y-2">
            <p className="text-sm font-semibold text-text-secondary m-0">
              No se encontraron usuarios
            </p>
            <p className="text-xs text-text-muted m-0">
              {hayFiltrosActivos
                ? "Probá modificando los filtros de búsqueda o rol."
                : "No hay usuarios registrados en el sistema."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Vista Desktop (Tabla) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary divide-y divide-border-subtle">
                <thead className="bg-surface-subtle/50 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Usuario
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Rol
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Localidad / Registro
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {usuarios.map((u) => {
                    const rolCfg = ROL_CONFIG[u.rol] || ROL_CONFIG.ciudadano;
                    const RolIcon = rolCfg.icon;
                    const esInactivo = u.estado === "inactivo";
                    const esMiCuenta = u.id === currentUserId;

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-surface-subtle/60 transition-colors ${
                          esInactivo ? "opacity-75 bg-surface-subtle/20" : ""
                        }`}
                      >
                        {/* Usuario (Avatar + Nombre + Email) */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              nombre={u.nombre}
                              foto={u.foto}
                              email={u.email}
                              rol={u.rol}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-text-primary m-0 truncate">
                                  {u.nombre || u.email?.split("@")[0] || "Usuario"}
                                </p>
                                {esMiCuenta && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-primary/20 text-primary">
                                    Vos
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-muted m-0 truncate mt-0.5">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${rolCfg.cls}`}
                          >
                            <RolIcon size={12} />
                            {rolCfg.label}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3.5">
                          {esInactivo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Inactivo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Activo
                            </span>
                          )}
                        </td>

                        {/* Localidad / Fecha */}
                        <td className="px-4 py-3.5">
                          <p className="m-0 text-text-primary font-medium truncate">
                            {u.ciudad_activa ? `${u.ciudad_activa}, ${u.provincia_activa || ""}` : "Sin ciudad activa"}
                          </p>
                          <p className="m-0 text-[11px] text-text-muted mt-0.5">
                            {u.fecha_creacion ? `Registrado ${tiempoRelativo(u.fecha_creacion)}` : "—"}
                          </p>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit2 size={13} />
                              <span>Editar</span>
                            </button>

                            {/* Botón Inhabilitar o Rehabilitar según estado */}
                            {esInactivo ? (
                              <button
                                onClick={() => abrirModalCambioEstado(u, "rehabilitar")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 hover:dark:bg-emerald-950/30 transition-colors cursor-pointer"
                                title="Rehabilitar cuenta"
                              >
                                <UserCheck size={13} />
                                <span>Rehabilitar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => abrirModalCambioEstado(u, "inhabilitar")}
                                disabled={esMiCuenta}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                  esMiCuenta
                                    ? "text-text-muted opacity-40 cursor-not-allowed"
                                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:dark:bg-rose-950/30 cursor-pointer"
                                }`}
                                title={
                                  esMiCuenta
                                    ? "No podés inhabilitar tu propia cuenta"
                                    : "Inhabilitar acceso a la cuenta"
                                }
                              >
                                <UserX size={13} />
                                <span>Inhabilitar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista Mobile (Tarjetas) */}
            <div className="md:hidden divide-y divide-border-subtle">
              {usuarios.map((u) => {
                const rolCfg = ROL_CONFIG[u.rol] || ROL_CONFIG.ciudadano;
                const RolIcon = rolCfg.icon;
                const esInactivo = u.estado === "inactivo";
                const esMiCuenta = u.id === currentUserId;

                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          nombre={u.nombre}
                          foto={u.foto}
                          email={u.email}
                          rol={u.rol}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary text-xs m-0 truncate">
                            {u.nombre || u.email?.split("@")[0] || "Usuario"}
                          </p>
                          <p className="text-[11px] text-text-muted m-0 truncate mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>

                      {esInactivo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          Inactivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Activo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${rolCfg.cls}`}
                      >
                        <RolIcon size={11} />
                        {rolCfg.label}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-subtle text-text-secondary hover:text-text-primary"
                        >
                          Editar
                        </button>

                        {esInactivo ? (
                          <button
                            onClick={() => abrirModalCambioEstado(u, "rehabilitar")}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                          >
                            Rehabilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => abrirModalCambioEstado(u, "inhabilitar")}
                            disabled={esMiCuenta}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              esMiCuenta
                                ? "text-text-muted opacity-40 cursor-not-allowed"
                                : "text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                            }`}
                          >
                            Inhabilitar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between gap-3 text-xs">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina <= 1 || loading}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle transition-colors ${
                pagina <= 1 || loading
                  ? "text-text-muted opacity-50 cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle cursor-pointer"
              }`}
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>

            <span className="text-text-muted text-xs">
              Página <strong className="text-text-primary">{pagina}</strong> de{" "}
              <strong className="text-text-primary">{totalPaginas}</strong>
            </span>

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas || loading}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle transition-colors ${
                pagina >= totalPaginas || loading
                  ? "text-text-muted opacity-50 cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle cursor-pointer"
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}