import React from "react";
import { render, screen, within, fireEvent, waitFor, act } from "@testing-library/react";
import apiClient from "@/services/apiClient";
import BandejaReclamosPage from "@/app/institucion/reclamos/page";
import InstitucionReclamoTable from "@/components/reclamos/InstitucionReclamoTable";
import InstitucionReclamoFilterBar from "@/components/reclamos/InstitucionReclamoFilterBar";

jest.mock("@/services/apiClient");

jest.mock("@/hooks/useCategorias", () => ({
  __esModule: true,
  default: () => ({
    categorias: [
      { id: 1, codigo: "LUZ", nombre: "Cortes de luz" },
      { id: 2, codigo: "AGUA", nombre: "Problemas de agua" },
    ],
    loading: false,
  }),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
let currentSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/institucion/reclamos",
  useSearchParams: () => currentSearchParams,
}));

describe("LIS-01 y LIS-02 — Bandeja Operativa Institucional (Tabla, Búsqueda, Filtros, Orden y Paginación)", () => {
  const mockReclamos = [
    {
      id: 42,
      titulo: "Corte de suministro eléctrico en zona norte",
      categoriaId: 1,
      categoriaCodigo: "LUZ",
      categoriaNombre: "Cortes de luz",
      fecha_creacion: "2026-10-15T12:00:00.000Z",
      fecha_ultimo_cambio_estado: "2026-10-15T12:00:00.000Z",
      visibilidad: "publico",
      estado: "Pendiente",
      afectadosCount: 8,
      diasEnEstado: 7,
      demorado: true,
      direccion: "Calle Rivadavia 450",
    },
    {
      id: 43,
      titulo: "Pérdida en cañería domiciliaria sensible",
      categoriaId: 2,
      categoriaCodigo: "AGUA",
      categoriaNombre: "Problemas de agua",
      fecha_creacion: "2026-10-21T14:30:00.000Z",
      fecha_ultimo_cambio_estado: "2026-10-21T16:00:00.000Z",
      visibilidad: "privado",
      estado: "En revisión",
      afectadosCount: 0,
      diasEnEstado: 1,
      demorado: false,
      direccion: "Pasaje Interno 12",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    currentSearchParams = new URLSearchParams();
  });

  test("InstitucionReclamoTable: renderiza formato de tabla administrativa con todos los campos requeridos y paginación", () => {
    const onCambiarPagina = jest.fn();
    render(
      <InstitucionReclamoTable
        reclamos={mockReclamos}
        pagina={1}
        limite={20}
        total={45}
        onCambiarPagina={onCambiarPagina}
      />
    );

    const table = screen.getByRole("table", {
      name: /Listado operativo de reclamos asignados/i,
    });
    expect(table).toBeInTheDocument();

    // Encabezados requeridos
    expect(within(table).getByText("Reclamo")).toBeInTheDocument();
    expect(within(table).getByText("Categoría")).toBeInTheDocument();
    expect(within(table).getByText("Creación")).toBeInTheDocument();
    expect(within(table).getByText("Visibilidad")).toBeInTheDocument();
    expect(within(table).getByText("Estado")).toBeInTheDocument();
    expect(within(table).getByText("Afectados")).toBeInTheDocument();
    expect(within(table).getByText("Antigüedad / Demora")).toBeInTheDocument();
    expect(within(table).getByText("Acción")).toBeInTheDocument();

    // Identificador y título
    expect(within(table).getByText("#0042")).toBeInTheDocument();
    expect(
      within(table).getByText("Corte de suministro eléctrico en zona norte")
    ).toBeInTheDocument();

    // Visibilidad y estados
    expect(within(table).getByText("Público")).toBeInTheDocument();
    expect(within(table).getByText("Privado")).toBeInTheDocument();
    expect(within(table).getByText("Pendiente")).toBeInTheDocument();
    expect(within(table).getByText("En revisión")).toBeInTheDocument();

    // Cantidad de afectados y demora
    expect(within(table).getByText("8 afectados")).toBeInTheDocument();
    expect(within(table).getByText("Demorado")).toBeInTheDocument();

    // Acción hacia el detalle
    const link42 = within(table).getByRole("link", {
      name: /Gestionar reclamo #0042/i,
    });
    expect(link42).toHaveAttribute("href", "/institucion/reclamos/42");

    // Paginación cuando total > 20
    expect(screen.getByText("45")).toBeInTheDocument();
    const btnSiguiente = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(btnSiguiente);
    expect(onCambiarPagina).toHaveBeenCalledWith(2);
  });

  test("InstitucionReclamoFilterBar: expone únicamente las 3 opciones de ordenamiento de LIS-02 (sin 'atencion')", () => {
    render(
      <InstitucionReclamoFilterBar
        orderBy="recientes"
        onOrderByChange={jest.fn()}
        total={10}
      />
    );

    const sortBtn = screen.getByLabelText(/Ordenar por/i);
    fireEvent.click(sortBtn);

    const listbox = screen.getByRole("listbox", {
      name: /Opciones de ordenamiento/i,
    });
    expect(within(listbox).getByText("Más recientes")).toBeInTheDocument();
    expect(within(listbox).getByText("Más antiguos")).toBeInTheDocument();
    expect(
      within(listbox).getByText("Mayor impacto ciudadano")
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByText(/Requieren atención/i)
    ).not.toBeInTheDocument();
  });

  test("BandejaReclamosPage: inicializa filtros desde la URL, consulta el contrato { total, rows } sin enviar id_institucion y conserva estado", async () => {
    currentSearchParams = new URLSearchParams(
      "busqueda=Rivadavia&estado=Pendiente&categoria=1&visibilidad=publico&fechaDesde=2026-10-01&fechaHasta=2026-10-31&demorado=true&orderBy=impacto&pagina=2"
    );

    apiClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          total: 25,
          rows: [mockReclamos[0]],
        },
      },
    });

    render(<BandejaReclamosPage />);

    const table = await screen.findByRole("table", {
      name: /Listado operativo de reclamos asignados/i,
    });
    expect(table).toBeInTheDocument();

    expect(apiClient.get).toHaveBeenCalledWith("/institucion/reclamos/bandeja", {
      params: {
        busqueda: "Rivadavia",
        estado: "Pendiente",
        categoria: "1",
        visibilidad: "publico",
        fechaDesde: "2026-10-01",
        fechaHasta: "2026-10-31",
        demorado: true,
        orderBy: "impacto",
        pagina: 2,
        limite: 20,
      },
    });
  });

  test("BandejaReclamosPage: muestra estado vacío claro cuando no hay coincidencias y permite limpiar filtros restableciendo la URL", async () => {
    currentSearchParams = new URLSearchParams("estado=Cancelado&demorado=true");

    apiClient.get.mockResolvedValue({
      data: {
        ok: true,
        data: {
          total: 0,
          rows: [],
        },
      },
    });

    render(<BandejaReclamosPage />);

    expect(
      await screen.findByText("Sin resultados para estos filtros")
    ).toBeInTheDocument();

    // Limpiar filtros desde el estado vacío
    const clearButtons = screen.getAllByRole("button", {
      name: /Limpiar filtros/i,
    });
    await act(async () => {
      fireEvent.click(clearButtons[clearButtons.length - 1]);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/institucion/reclamos", {
        scroll: false,
      });
    });
  });

  test("BandejaReclamosPage: muestra estado de error claramente y no lo oculta como lista vacía", async () => {
    apiClient.get.mockRejectedValueOnce({
      response: {
        data: {
          mensaje: "Error de conexión con el servidor institucional",
        },
      },
    });

    render(<BandejaReclamosPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Error de conexión con el servidor institucional"
    );
    expect(
      screen.queryByText("No hay reclamos asignados")
    ).not.toBeInTheDocument();
  });
});
