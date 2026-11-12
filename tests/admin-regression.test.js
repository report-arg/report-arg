import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

// Componentes y páginas
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import InstitucionTable from "@/components/admin/instituciones/InstitucionTable";
import SolicitudesPage from "@/app/admin/solicitudes/page";
import UsuarioTable from "@/components/admin/usuarios/UsuarioTable";
import AdminReclamosPage from "@/app/admin/reclamos/page";
import CategoriaPanel from "@/components/admin/categorias/CategoriaPanel";
import InstitucionStatusModal from "@/components/admin/instituciones/InstitucionStatusModal";
import InstitucionDetailModal from "@/components/admin/instituciones/InstitucionDetailModal";
import InstitucionEstadoSolicitudView from "@/components/institucion/InstitucionEstadoSolicitudView";
import CiudadesPage from "@/app/admin/ciudades/page";
import CiudadanoCiudadPanel from "@/components/ciudadano/CiudadanoCiudadPanel";
import { CiudadanoCiudadProvider } from "@/context/CiudadanoCiudadContext";
import EditUserPage from "@/app/admin/users/[id]/edit/page";
import AdminNavbar from "@/components/admin/layout/AdminNavbar";
import CrearCategoriaPage from "@/app/admin/categories/crear/page";

// Mock de apiClient y toast
jest.mock("@/services/apiClient");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de next-auth
const mockUpdateSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "1", name: "Admin Global", role: "admin", email: "admin@test.gob.ar" } },
    status: "authenticated",
    update: mockUpdateSession,
  }),
  signOut: jest.fn(),
}));

// Mock de next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), refresh: mockRefresh }),
  usePathname: () => "/admin",
  useParams: () => ({}),
}));

describe("ADMIN-01 - Pruebas de Regresión y Flujos Funcionales (Etapa 3)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("1. Flujo de Instituciones y Solicitudes", () => {
    const mockInstituciones = [
      {
        id: 10,
        nombre: "Hospital Central",
        email: "hospital@mendoza.gob.ar",
        tipo: "Salud",
        verificada: 0,
        motivo_rechazo: null,
        ciudad_nombre: "Mendoza",
        provincia: "Mendoza",
      },
      {
        id: 20,
        nombre: "Defensa Civil",
        email: "defensa@mendoza.gob.ar",
        tipo: "Emergencias",
        verificada: 1,
        motivo_rechazo: null,
        ciudad_nombre: "Mendoza",
        provincia: "Mendoza",
      },
    ];

    it("InstitucionTable: debe listar instituciones y permitir aprobar una entidad pendiente", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/instituciones/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 2, verificadas: 1, pendientes: 1 } } });
        }
        if (url.includes("/admin/instituciones")) {
          return Promise.resolve({ data: { ok: true, data: mockInstituciones, total: 2, totalPaginas: 1 } });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.put.mockResolvedValueOnce({ data: { ok: true } });

      render(<InstitucionTable />);

      // Verificar carga inicial de tarjetas y listado
      const itemsHospital = await screen.findAllByText("Hospital Central");
      expect(itemsHospital[0]).toBeInTheDocument();
      expect(screen.getAllByText("Defensa Civil")[0]).toBeInTheDocument();

      // Abrir modal de aprobación para Hospital Central (que está pendiente)
      const btnVerificar = screen.getAllByRole("button", { name: "Verificar" })[0];
      fireEvent.click(btnVerificar);

      // Confirmar en el modal
      expect(screen.getByText(/¿Verificar institución\?/i)).toBeInTheDocument();
      const btnConfirmar = screen.getByRole("button", { name: "Verificar institución" });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith("/admin/instituciones/10/verificar");
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Hospital Central"));
      });
    });

    it("SolicitudesPage: debe listar solo pendientes y permitir rechazo con motivo", async () => {
      const mockPendientes = [mockInstituciones[0]]; // Solo Hospital Central

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/instituciones")) {
          return Promise.resolve({ data: { ok: true, data: mockPendientes, total: 1, totalPaginas: 1 } });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.put.mockResolvedValueOnce({ data: { ok: true } });

      render(<SolicitudesPage />);

      expect(await screen.findByText("Hospital Central")).toBeInTheDocument();
      expect(screen.queryByText("Defensa Civil")).not.toBeInTheDocument();

      // Abrir modal de rechazo
      const btnRechazar = screen.getByRole("button", { name: "Rechazar" });
      fireEvent.click(btnRechazar);

      expect(screen.getByText(/Rechazar solicitud institucional/i)).toBeInTheDocument();

      // Intentar confirmar sin motivo -> muestra validación
      const btnConfirmar = screen.getByRole("button", { name: "Confirmar rechazo" });
      fireEvent.click(btnConfirmar);
      expect(screen.getByText(/El motivo de rechazo es obligatorio/i)).toBeInTheDocument();
      expect(apiClient.put).not.toHaveBeenCalled();

      // Ingresar motivo y confirmar
      const textarea = screen.getByPlaceholderText(/Ej\. La documentación adjunta/i);
      fireEvent.change(textarea, { target: { value: "Falta personería jurídica" } });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith("/admin/instituciones/10/rechazar", {
          motivo: "Falta personería jurídica",
        });
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("rechazada"));
      });
    });

    it("InstitucionDetailModal: consulta y muestra el historial de auditoría con nombre de administrador y motivo", async () => {
      const mockAuditoria = [
        {
          id: 1,
          accion: "SUSPENDER_INSTITUCION",
          actor_nombre: "María López",
          actor_email: "mlopez@reportarg.gob.ar",
          motivo: "Reiterado incumplimiento en plazos de respuesta",
          fecha_creacion: "2026-11-12T10:00:00.000Z",
        },
      ];

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/auditoria/institucion/10")) {
          return Promise.resolve({ data: { ok: true, data: mockAuditoria } });
        }
        return Promise.resolve({ data: { ok: true, data: [] } });
      });

      render(
        <InstitucionDetailModal
          isOpen={true}
          onClose={jest.fn()}
          institucion={{
            id: 10,
            nombre: "Hospital Central",
            tipo: "Salud",
            verificada: 1,
            activo: 0,
            email: "hospital@mendoza.gob.ar",
          }}
        />
      );

      expect(screen.getByText("Hospital Central")).toBeInTheDocument();
      expect(
        screen.getByText("Historial de Auditoría y Decisiones Administrativas")
      ).toBeInTheDocument();

      // Esperar a que se muestre el evento de auditoría
      expect(await screen.findByText("María López")).toBeInTheDocument();
      expect(screen.getByText("Institución Suspendida")).toBeInTheDocument();
      expect(
        screen.getByText("Reiterado incumplimiento en plazos de respuesta")
      ).toBeInTheDocument();
    });
  });

  describe("2. Flujo de Gestión de Usuarios", () => {
    const mockUsers = [
      { id: 1, nombre: "Admin Global", email: "admin@test.gob.ar", rol: "admin", estado: "activo" },
      { id: 2, nombre: "Juan Pérez", email: "juan@test.com", rol: "ciudadano", estado: "activo" },
    ];

    it("UsuarioTable: debe listar usuarios, impedir auto-inhabilitación y permitir inhabilitar a otro usuario", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/usuarios")) {
          return Promise.resolve({ data: { ok: true, data: mockUsers, total: 2, totalPaginas: 1 } });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.patch.mockResolvedValueOnce({ data: { ok: true } });

      window.alert = jest.fn();

      render(<UsuarioTable />);

      const usersJuan = await screen.findAllByText("Juan Pérez");
      expect(usersJuan[0]).toBeInTheDocument();

      // Encontrar botones de inhabilitar
      const btnsInhabilitar = screen.getAllByRole("button", { name: "Inhabilitar" });
      // El primer botón corresponde al admin logueado (disabled)
      expect(btnsInhabilitar[0]).toBeDisabled();

      // El segundo botón corresponde a Juan Pérez
      fireEvent.click(btnsInhabilitar[1]);

      expect(screen.getByText(/Inhabilitar Usuario/i)).toBeInTheDocument();

      // Confirmar cambio de estado
      const btnConfirmar = screen.getByRole("button", { name: "Inhabilitar usuario" });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/usuarios/2/estado", {
          estado: "inactivo",
        });
      });
    });

    it("UsuarioTable: debe mostrar ciudad, conteo de reclamos y permitir cambiar rol con modal", async () => {
      const mockUsersConCiudad = [
        { id: 1, nombre: "Admin Global", email: "admin@test.gob.ar", rol: "admin", estado: "activo", ciudad_nombre: "Viale", provincia_nombre: "Entre Ríos", reclamos_total: 0 },
        { id: 2, nombre: "Juan Pérez", email: "juan@test.com", rol: "ciudadano", estado: "activo", ciudad_nombre: "Viale", provincia_nombre: "Entre Ríos", reclamos_total: 4 },
      ];

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/usuarios")) {
          return Promise.resolve({ data: { ok: true, data: mockUsersConCiudad, total: 2, totalPaginas: 1 } });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.put.mockResolvedValueOnce({ data: { ok: true, mensaje: "Rol actualizado" } });

      render(<UsuarioTable />);

      // Verificar visualización de ciudad y reclamos
      const ciudadesViale = await screen.findAllByText(/Viale, Entre Ríos/i);
      expect(ciudadesViale[0]).toBeInTheDocument();

      // Abrir modal de cambio de rol para Juan Pérez
      const btnsRol = screen.getAllByRole("button", { name: "Cambiar rol" });
      fireEvent.click(btnsRol[1]);

      expect(screen.getByText("Cambiar rol de usuario")).toBeInTheDocument();

      // Cambiar selector a admin dentro del modal
      const comboboxes = screen.getAllByRole("combobox");
      const modalCombobox = comboboxes[comboboxes.length - 1];
      fireEvent.click(modalCombobox);
      const opcionAdmin = screen.getByRole("option", { name: "Administrador" });
      fireEvent.click(opcionAdmin);

      // Confirmar cambio
      const btnConfirmar = screen.getByRole("button", { name: "Confirmar cambio de rol" });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith("/admin/usuarios/2/rol", {
          rol: "admin",
        });
      });
    });

    it("EditUserPage: debe mostrar vista informativa de simplificación y canalizar hacia /admin/users", () => {
      render(<EditUserPage />);

      expect(screen.getByText("Gestión de Cuentas de Usuario")).toBeInTheDocument();
      expect(screen.getByText("La edición directa de perfiles ha sido simplificada")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Ir al Padrón de Usuarios" })).toBeInTheDocument();
    });
  });

  describe("3. Flujo de Supervisión de Reclamos", () => {
    const mockReclamos = [
      {
        id: 101,
        id_ciudad: 1,
        id_institucion: null,
        titulo: "Bache profundo en calle San Martín",
        estado: "Pendiente",
        fecha_creacion: new Date().toISOString(),
        categoriaNombre: "Vialidad",
        institucionNombre: null,
      },
    ];

    const mockDetalle = {
      ...mockReclamos[0],
      descripcion: "El bache mide más de 40 cm y rompe cubiertas",
      ciudad: "Mendoza",
      autor: { nombre: "Carlos Gómez", email: "carlos@test.com" },
      historial: [],
    };

    it("AdminReclamosPage: debe cargar métricas, listado, abrir detalle y permitir reasignación auditada", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/ciudades")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [
                {
                  id_ciudad: 1,
                  nombre: "Mendoza",
                  provincia: "Mendoza",
                  activa: true,
                  institucion_principal_nombre: "Municipalidad de Mendoza",
                  reclamos_total: 1,
                  reclamos_abiertos: 1,
                },
              ],
            },
          });
        }
        if (url.includes("/admin/reclamos/stats")) {
          return Promise.resolve({
            data: { ok: true, data: { total: 1, pendientes: 1, enRevision: 0, enProceso: 0, resueltos: 0 } },
          });
        }
        if (url.includes("/admin/reclamos/lista")) {
          return Promise.resolve({ data: { ok: true, data: mockReclamos, total: 1, totalPaginas: 1 } });
        }
        if (url.includes("/admin/reclamos/101")) {
          return Promise.resolve({ data: { ok: true, data: mockDetalle } });
        }
        if (url.includes("/admin/instituciones?estado=verificada")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [
                {
                  id: 50,
                  id_ciudad: 1,
                  nombre: "Vialidad Provincial",
                  ciudad_nombre: "Mendoza",
                },
              ],
            },
          });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.patch.mockResolvedValueOnce({ data: { ok: true } });

      render(<AdminReclamosPage />);

      expect(await screen.findByText("Supervisión Territorial de Reclamos")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Mendoza" })).toBeInTheDocument();

      // Seleccionar localidad para supervisar
      const btnSupervisar = screen.getByRole("button", { name: /Supervisar reclamos/i });
      fireEvent.click(btnSupervisar);

      const itemsReclamo = await screen.findAllByText("Bache profundo en calle San Martín");
      expect(itemsReclamo[0]).toBeInTheDocument();

      // Abrir detalle
      const btnDetalle = screen.getAllByRole("button", { name: "Detalle" })[0];
      fireEvent.click(btnDetalle);

      expect(await screen.findByText("El bache mide más de 40 cm y rompe cubiertas")).toBeInTheDocument();

      // Abrir reasignación desde el detalle
      const btnsReasignar = screen.getAllByRole("button", { name: "Reasignar" });
      fireEvent.click(btnsReasignar[btnsReasignar.length - 1]);

      expect(await screen.findByText("Reasignar Institución Responsable")).toBeInTheDocument();

      // Seleccionar entidad destino y cargar motivo
      const selectDestino = screen.getByRole("combobox", { name: /Nueva Institución Responsable/i });
      fireEvent.click(selectDestino);
      const opcionDestino = await screen.findByText("Vialidad Provincial");
      fireEvent.click(opcionDestino);

      const textareaMotivo = screen.getByPlaceholderText(/Explicá el motivo técnico o administrativo/i);
      fireEvent.change(textareaMotivo, { target: { value: "Competencia de red vial primaria provincial" } });

      // Confirmar reasignación
      const btnConfirmar = screen.getByRole("button", { name: "Confirmar reasignación" });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/reclamos/101/institucion", {
          id_institucion: 50,
          motivo: "Competencia de red vial primaria provincial",
        });
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("exitosamente"));
      });
    });
  });

  describe("4. Flujo de Categorías", () => {
    const mockCategorias = [
      { id: 1, codigo: "ALUM", nombre: "Alumbrado", tipo: "reclamo", estado: "activo", orden: 1 },
      { id: 2, codigo: "AGUA", nombre: "Agua Corriente", tipo: "reclamo", estado: "inactivo", orden: 2 },
    ];

    it("CategoriaPanel: debe permitir dar de baja lógica y reactivar categorías", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/categorias")) {
          return Promise.resolve({ data: { ok: true, data: mockCategorias } });
        }
        return Promise.resolve({ data: { ok: true } });
      });
      apiClient.patch.mockResolvedValue({ data: { ok: true } });

      render(<CategoriaPanel />);

      expect(await screen.findByText("Alumbrado")).toBeInTheDocument();
      expect(screen.getByText("Agua Corriente")).toBeInTheDocument();

      // Desactivar categoría activa
      const btnDesactivar = screen.getByRole("button", { name: "Desactivar" });
      fireEvent.click(btnDesactivar);

      expect(screen.getByText(/¿Desactivar categoría\?/i)).toBeInTheDocument();
      const btnConfirmarBaja = screen.getByRole("button", { name: "Desactivar Categoría" });
      fireEvent.click(btnConfirmarBaja);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/categorias/1/baja");
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Alumbrado"));
      });

      // Reactivar categoría inactiva
      const btnActivar = screen.getByRole("button", { name: "Activar" });
      fireEvent.click(btnActivar);

      expect(screen.getByText(/¿Reactivar categoría\?/i)).toBeInTheDocument();
      const btnConfirmarReactivar = screen.getByRole("button", { name: "Reactivar Categoría" });
      fireEvent.click(btnConfirmarReactivar);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/categorias/2/reactivar");
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Agua Corriente"));
      });
    });
  });

  describe("5. Flujo de Dashboard General", () => {
    it("DashboardStats: debe consultar métricas en paralelo y mostrar alertas operativas si hay pendientes", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/usuarios/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 100, activos: 95, inactivos: 5, admins: 2 } } });
        }
        if (url.includes("/admin/reclamos/stats")) {
          return Promise.resolve({
            data: { ok: true, data: { total: 50, pendientes: 5, enRevision: 10, enProceso: 15, resueltos: 20 } },
          });
        }
        if (url.includes("/admin/instituciones/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 10, verificadas: 8, pendientes: 2 } } });
        }
        if (url.includes("/admin/reclamos/ultimos")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [
                {
                  id: 99,
                  titulo: "Luminaria rota en Plaza España",
                  estado: "Pendiente",
                  fecha_creacion: new Date().toISOString(),
                },
              ],
            },
          });
        }
        if (url.includes("/admin/reclamos/por-categoria")) {
          return Promise.resolve({
            data: { ok: true, data: [{ categoria: "Alumbrado", cantidad: 30 }] },
          });
        }
        if (url.includes("/admin/reclamos/actividad-mensual")) {
          return Promise.resolve({
            data: { ok: true, data: [{ mes: 1, total: 12 }, { mes: 2, total: 18 }] },
          });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      render(<DashboardStats />);

      // Verificar que se renderizan los KPIs principales
      expect(await screen.findByText("Reclamos Totales")).toBeInTheDocument();
      expect(screen.getByText("Usuarios Activos")).toBeInTheDocument();
      expect(screen.getByText("Instituciones")).toBeInTheDocument();
      expect(screen.getByText("Pendientes Aprobación")).toBeInTheDocument();

      // Verificar el banner de atención administrativa debido a pendientes
      expect(screen.getByText("Requiere Atención Administrativa")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Revisar solicitudes/i })).toHaveAttribute("href", "/admin/solicitudes");

      // Verificar el último reclamo listado
      expect(screen.getByText("Luminaria rota en Plaza España")).toBeInTheDocument();
    });

    it("DashboardStats: debe destacar alertas de ciudades sin principal y reclamos huérfanos", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/usuarios/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 100, activos: 95, inactivos: 5, admins: 2 } } });
        }
        if (url.includes("/admin/reclamos/stats")) {
          return Promise.resolve({
            data: { ok: true, data: { total: 50, pendientes: 0, resueltos: 30, sinAsignar: 3, pendienteMasAntiguoDias: 12 } },
          });
        }
        if (url.includes("/admin/instituciones/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 10, verificadas: 8, pendientes: 0 } } });
        }
        if (url.includes("/admin/ciudades/stats")) {
          return Promise.resolve({ data: { ok: true, data: { total: 5, activas: 3, inactivas: 2, sinPrincipal: 1 } } });
        }
        return Promise.resolve({ data: { ok: true, data: [] } });
      });

      render(<DashboardStats />);

      // Verificar alerta crítica en banner
      expect(await screen.findByText("Requiere Atención Administrativa")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Configurar institución principal/i })).toHaveAttribute("href", "/admin/ciudades");
      expect(screen.getByRole("link", { name: /Asignar reclamos/i })).toHaveAttribute("href", "/admin/reclamos?institucion=sin_asignar");

      // Verificar KPIs territoriales y de reclamos
      expect(screen.getByText("Ciudades Operativas")).toBeInTheDocument();
      const sinPrincipalElems = screen.getAllByText(/sin institución principal/i);
      expect(sinPrincipalElems.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/3 sin asignar/i)).toBeInTheDocument();
    });
  });

  describe("6. Etapa 2: Ciclo de Vida Institucional y Solicitud Rechazada", () => {
    it("InstitucionStatusModal: bloquea la suspensión si es institución principal de una ciudad activa", () => {
      const onConfirm = jest.fn();
      render(
        <InstitucionStatusModal
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={onConfirm}
          institucion={{
            id: 1,
            nombre: "Municipalidad de Viale",
            ciudad_nombre: "Viale",
            activo: 1,
            es_principal: 1,
            ciudad_activa: 1,
          }}
        />
      );

      expect(
        screen.getByText(/Acción protegida: Institución Principal de ciudad activa/i)
      ).toBeInTheDocument();
      const btnSuspender = screen.getByRole("button", { name: /Suspender institución/i });
      expect(btnSuspender).toBeDisabled();
    });

    it("InstitucionEstadoSolicitudView: muestra motivo de rechazo, alerta de 7 días y permite convertir a ciudadano", async () => {
      apiClient.post.mockResolvedValueOnce({
        data: {
          ok: true,
          user: { id: 33, role: "ciudadano", nombre: "Carlos Gómez" },
          accessToken: "new-token",
          refreshToken: "new-refresh",
        },
      });

      render(
        <InstitucionEstadoSolicitudView
          perfil={{
            id: 33,
            nombre: "Cooperativa Mal Cargada",
            email: "carlos@test.com",
            tipo: "Cooperativa",
            ciudad: "Viale",
            provincia: "Entre Ríos",
            institucion_verificada: false,
            institucion_status: "rejected",
            motivo_rechazo: "No figura en el padrón oficial de cooperativas.",
            fecha_rechazo: new Date().toISOString(),
          }}
        />
      );

      expect(screen.getByText(/Solicitud institucional rechazada/i)).toBeInTheDocument();
      expect(
        screen.getByText(/No figura en el padrón oficial de cooperativas/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/esta cuenta se cerrará automáticamente en/i)
      ).toBeInTheDocument();

      // Abrir modal para convertir a ciudadano
      const btnConvertir = screen.getByRole("button", {
        name: /Crear cuenta como Ciudadano/i,
      });
      fireEvent.click(btnConvertir);

      const inputNombre = screen.getByPlaceholderText("Ej. María");
      const inputApellido = screen.getByPlaceholderText("Ej. González");
      fireEvent.change(inputNombre, { target: { value: "Carlos" } });
      fireEvent.change(inputApellido, { target: { value: "Gómez" } });

      const btnConfirmarConversion = screen.getByRole("button", {
        name: /Confirmar y pasar a Ciudadano/i,
      });
      fireEvent.click(btnConfirmarConversion);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          "/auth/me/convertir-a-ciudadano",
          expect.objectContaining({ nombre: "Carlos", apellido: "Gómez" })
        );
        expect(mockUpdateSession).toHaveBeenCalledWith(
          expect.objectContaining({ role: "ciudadano" })
        );
        expect(mockPush).toHaveBeenCalledWith("/ciudadano");
      });
    });
  });

  describe("6. Etapa 3 — Administración Territorial de Ciudades", () => {
    const mockCiudadesAdmin = [
      {
        id: 1,
        id_ciudad: 1,
        nombre: "Viale",
        provincia: "Entre Ríos",
        activa: 1,
        estado: "activa",
        id_institucion_principal: 10,
        institucion_principal_nombre: "Municipalidad de Viale",
        instituciones_verificadas: 3,
        instituciones_pendientes: 0,
        ciudadanos_total: 85,
        reclamos_total: 32,
        instituciones_elegibles: [
          { id: 10, nombre: "Municipalidad de Viale", tipo: "municipio", es_principal: 1 },
          { id: 12, nombre: "Obras Sanitarias Viale", tipo: "servicios", es_principal: 0 },
        ],
      },
      {
        id: 2,
        id_ciudad: 2,
        nombre: "Crespo",
        provincia: "Entre Ríos",
        activa: 0,
        estado: "inactiva",
        id_institucion_principal: null,
        institucion_principal_nombre: null,
        instituciones_verificadas: 1,
        instituciones_pendientes: 1,
        ciudadanos_total: 14,
        reclamos_total: 0,
        instituciones_elegibles: [
          { id: 25, nombre: "Municipalidad de Crespo", tipo: "municipio", es_principal: 0 },
        ],
      },
    ];

    it("CiudadesPage: lista ciudades activas e inactivas y permite activar una ciudad con institución principal o desactivar con motivo", async () => {
      apiClient.get.mockResolvedValue({
        data: {
          ok: true,
          data: mockCiudadesAdmin,
          stats: { total: 2, activas: 1, inactivas: 1, sin_principal: 1 },
        },
      });
      apiClient.patch.mockResolvedValue({
        data: {
          ok: true,
          mensaje: "Estado territorial actualizado correctamente.",
        },
      });

      render(<CiudadesPage />);

      expect(await screen.findByText("Viale")).toBeInTheDocument();
      expect(screen.getByText("Crespo")).toBeInTheDocument();
      expect(screen.getByText("Municipalidad de Viale")).toBeInTheDocument();

      // Activar Crespo (inactiva, selecciona automáticamente su primera institución elegible)
      const btnActivar = screen.getByRole("button", { name: "Activar" });
      fireEvent.click(btnActivar);

      expect(screen.getByText(/Activar ciudad: Crespo/i)).toBeInTheDocument();
      const btnConfirmarActivar = screen.getByRole("button", { name: "Activar ciudad" });
      fireEvent.click(btnConfirmarActivar);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/ciudades/2/estado", {
          activa: true,
          id_institucion_principal: 25,
        });
      });

      // Desactivar Viale (exige motivo obligatorio)
      const btnDesactivar = screen.getByRole("button", { name: "Desactivar" });
      fireEvent.click(btnDesactivar);

      expect(screen.getByText(/Desactivar ciudad: Viale/i)).toBeInTheDocument();
      const btnConfirmarDesactivar = screen.getByRole("button", { name: "Desactivar ciudad" });
      fireEvent.click(btnConfirmarDesactivar);

      expect(screen.getByText(/El motivo de desactivación es obligatorio/i)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/Explicá el motivo administrativo/i);
      fireEvent.change(textarea, {
        target: { value: "Mantenimiento programado de jurisdicción" },
      });
      fireEvent.click(btnConfirmarDesactivar);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith("/admin/ciudades/1/estado", {
          activa: false,
          motivo: "Mantenimiento programado de jurisdicción",
        });
      });
    });
  });

  describe("7. Etapa 4 — Supervisión con anomalías y Administrador en Comunidad", () => {
    it("AdminReclamosPage: permite activar el filtro de anomalías y visualiza tarjeta 'Sin Asignar'", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/ciudades")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [
                {
                  id_ciudad: 1,
                  nombre: "Viale",
                  provincia: "Entre Ríos",
                  activa: true,
                  reclamos_total: 2,
                  reclamos_abiertos: 1,
                },
              ],
            },
          });
        }
        if (url.includes("/admin/reclamos/stats")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: {
                total: 2,
                pendientes: 1,
                enRevision: 0,
                enProceso: 0,
                resueltos: 1,
                sinAsignar: 1,
                pendienteMasAntiguoDias: 4,
              },
            },
          });
        }
        if (url.includes("/admin/reclamos/lista")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [
                {
                  id: 201,
                  titulo: "Reclamo sin entidad responsable",
                  estado: "Pendiente",
                  ciudadNombre: "Viale",
                  institucionNombre: null,
                  tieneAnomalia: true,
                },
              ],
              total: 1,
              totalPaginas: 1,
            },
          });
        }
        return Promise.resolve({ data: { ok: true, data: [] } });
      });

      render(<AdminReclamosPage />);

      const btnSupervisar = await screen.findByRole("button", { name: /Supervisar reclamos/i });
      fireEvent.click(btnSupervisar);

      expect(await screen.findByText("Sin Asignar")).toBeInTheDocument();
      const itemsReclamo = await screen.findAllByText("Reclamo sin entidad responsable");
      expect(itemsReclamo[0]).toBeInTheDocument();

      // Botón de filtro de anomalías
      const btnAnomalia = screen.getByRole("button", { name: /Anomalías/i });
      fireEvent.click(btnAnomalia);

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          expect.stringContaining("anomalia=true")
        );
      });
    });

    it("CiudadanoCiudadPanel: como Administrador permite seleccionar y cambiar la localidad activa de la comunidad", async () => {
      const { authService } = require("@/services/authService");
      jest.spyOn(authService, "getCiudadesActivas").mockResolvedValue({
        ok: true,
        data: [
          { id: 1, nombre: "Viale", provincia: "Entre Ríos", activa: 1 },
          { id: 2, nombre: "Paraná", provincia: "Entre Ríos", activa: 1 },
        ],
      });

      render(
        <CiudadanoCiudadProvider>
          <CiudadanoCiudadPanel />
        </CiudadanoCiudadProvider>
      );

      expect(await screen.findByText(/Vista Comunitaria \(Admin\):/i)).toBeInTheDocument();

      // Abrir selector
      const btnCambiar = screen.getByRole("button", { name: "Cambiar ciudad activa" });
      fireEvent.click(btnCambiar);

      expect(screen.getByText(/Seleccionar ciudad activa para la comunidad/i)).toBeInTheDocument();

      // Seleccionar Paraná
      const selectCiudad = screen.getByRole("combobox", { name: /Localidad activa/i });
      fireEvent.click(selectCiudad);

      const opcionParana = await screen.findByText("Paraná, Entre Ríos");
      fireEvent.click(opcionParana);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Paraná"));
      });
    });

    it("AdminNavbar: Búsqueda global incluye soporte para instituciones, ciudades y reclamos con rutas correctas", async () => {
      const mockResultados = [
        { tipo: "Usuario", label: "Juan Pérez", sub: "juan@test.com", href: "/admin/users" },
        { tipo: "Institución", label: "Municipalidad de Paraná", sub: "Paraná · Pública", href: "/admin/institutions" },
        { tipo: "Ciudad", label: "Paraná", sub: "Entre Ríos · Activa", href: "/admin/ciudades" },
        { tipo: "Reporte", label: "Bache en calle San Martín", sub: "Pendiente", href: "/admin/reclamos" },
      ];

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/buscar")) {
          return Promise.resolve({ ok: true, data: { ok: true, data: mockResultados } });
        }
        return Promise.resolve({ ok: true, data: { ok: true, data: [] } });
      });

      render(<AdminNavbar />);

      const searchInput = screen.getByPlaceholderText(/Buscar usuarios, reclamos, ciudades/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "Paraná" } });

      // Esperar a que el debounce resuelva y se muestren los resultados
      await waitFor(() => {
        expect(screen.getByText("Municipalidad de Paraná")).toBeInTheDocument();
      });

      expect(screen.getByText("Bache en calle San Martín")).toBeInTheDocument();

      // Click en el resultado de institución
      const btnInst = screen.getByText("Municipalidad de Paraná").closest("button");
      fireEvent.click(btnInst);

      expect(mockPush).toHaveBeenCalledWith("/admin/institutions");
    });

    it("CrearCategoriaPage: renderiza con controles UI estandarizados y valida campos obligatorios", async () => {
      render(<CrearCategoriaPage />);

      expect(screen.getByText("Crear Nueva Categoría")).toBeInTheDocument();
      const inputNombre = screen.getByLabelText(/Nombre de la categoría \*/i);
      expect(inputNombre).toBeInTheDocument();

      const btnSubmit = screen.getByRole("button", { name: /Crear categoría/i });
      fireEvent.click(btnSubmit);

      expect(await screen.findByText(/El nombre de la categoría es obligatorio/i)).toBeInTheDocument();

      // Completar nombre
      fireEvent.change(inputNombre, { target: { value: "Espacios Verdes" } });

      apiClient.post.mockResolvedValueOnce({
        data: { ok: true, mensaje: "Categoría creada" },
      });

      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Espacios Verdes"));
        expect(mockPush).toHaveBeenCalledWith("/admin/categories");
      });
    });
  });
});
