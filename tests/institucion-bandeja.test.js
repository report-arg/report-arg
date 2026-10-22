import React from "react";
import { render, screen, within } from "@testing-library/react";
import apiClient from "@/services/apiClient";
import BandejaReclamosPage from "@/app/institucion/reclamos/page";
import InstitucionReclamoTable from "@/components/reclamos/InstitucionReclamoTable";

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

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/institucion/reclamos",
  useSearchParams: () => new URLSearchParams(),
}));

describe("LIS-01 — Consultar listado operativo de reclamos (Portal Institucional)", () => {
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
  });

  test("InstitucionReclamoTable: renderiza formato de tabla administrativa con todos los campos requeridos por LIS-01", () => {
    render(<InstitucionReclamoTable reclamos={mockReclamos} />);

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
    expect(within(table).getByText("#0043")).toBeInTheDocument();
    expect(
      within(table).getByText("Pérdida en cañería domiciliaria sensible")
    ).toBeInTheDocument();

    // Categorías
    expect(within(table).getByText("Cortes de luz")).toBeInTheDocument();
    expect(within(table).getByText("Problemas de agua")).toBeInTheDocument();

    // Visibilidad: Público y Privado
    expect(within(table).getByText("Público")).toBeInTheDocument();
    expect(within(table).getByText("Privado")).toBeInTheDocument();

    // Estados actuales
    expect(within(table).getByText("Pendiente")).toBeInTheDocument();
    expect(within(table).getByText("En revisión")).toBeInTheDocument();

    // Cantidad de afectados
    expect(within(table).getByText("8 afectados")).toBeInTheDocument();
    expect(within(table).getByText("0 afectados")).toBeInTheDocument();

    // Antigüedad e indicador visual de demora
    expect(within(table).getByText("7 días")).toBeInTheDocument();
    expect(within(table).getByText("1 día")).toBeInTheDocument();
    expect(within(table).getByText(/Demorado \(\+5d\)/i)).toBeInTheDocument();

    // Acción para acceder al detalle de cada reclamo
    const link42 = within(table).getByRole("link", {
      name: /Gestionar reclamo #0042/i,
    });
    expect(link42).toHaveAttribute("href", "/institucion/reclamos/42");

    const link43 = within(table).getByRole("link", {
      name: /Gestionar reclamo #0043/i,
    });
    expect(link43).toHaveAttribute("href", "/institucion/reclamos/43");
  });

  test("BandejaReclamosPage: consulta /institucion/reclamos/bandeja sin enviar id_institucion y muestra la tabla", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: mockReclamos,
      },
    });

    render(<BandejaReclamosPage />);

    const table = await screen.findByRole("table", {
      name: /Listado operativo de reclamos asignados/i,
    });
    expect(table).toBeInTheDocument();

    expect(apiClient.get).toHaveBeenCalledWith(
      "/institucion/reclamos/bandeja",
      expect.objectContaining({
        params: expect.not.objectContaining({
          id_institucion: expect.anything(),
        }),
      })
    );
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
