import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

// Componentes y páginas
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import InstitutionTable from "@/components/admin/institutions/InstitutionTable";
import SolicitudesPage from "@/app/admin/solicitudes/page";
import UserTable from "@/components/admin/users/UserTable";
import AdminReclamosPage from "@/app/admin/reclamos/page";
import CategoriesPanel from "@/components/admin/categories/CategoriesPanel";

// Mock de apiClient y toast
jest.mock("@/services/apiClient");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "1", name: "Admin Global", role: "admin", email: "admin@test.gob.ar" } },
    status: "authenticated",
  }),
}));

// Mock de next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
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

    it("InstitutionTable: debe listar instituciones y permitir aprobar una entidad pendiente", async () => {
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

      render(<InstitutionTable />);

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
  });

  describe("2. Flujo de Gestión de Usuarios", () => {
    const mockUsers = [
      { id: 1, nombre: "Admin Global", email: "admin@test.gob.ar", rol: "admin", estado: "activo" },
      { id: 2, nombre: "Juan Pérez", email: "juan@test.com", rol: "ciudadano", estado: "activo" },
    ];

    it("UserTable: debe listar usuarios, impedir auto-inhabilitación y permitir inhabilitar a otro usuario", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/usuarios")) {
          return Promise.resolve({ data: { ok: true, data: mockUsers, total: 2, totalPaginas: 1 } });
        }
        return Promise.resolve({ data: { ok: true } });
      });

      apiClient.patch.mockResolvedValueOnce({ data: { ok: true } });

      window.alert = jest.fn();

      render(<UserTable />);

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
      const selects = screen.getAllByRole("combobox");
      const selectDestino = selects[selects.length - 1];
      fireEvent.change(selectDestino, { target: { value: "50" } });

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

    it("CategoriesPanel: debe permitir dar de baja lógica y reactivar categorías", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/admin/categorias")) {
          return Promise.resolve({ data: { ok: true, data: mockCategorias } });
        }
        return Promise.resolve({ data: { ok: true } });
      });
      apiClient.patch.mockResolvedValue({ data: { ok: true } });

      render(<CategoriesPanel />);

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
  });
});
