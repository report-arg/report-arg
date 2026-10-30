import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CiudadanoCiudadProvider } from "@/context/CiudadanoCiudadContext";
import CiudadanoCiudadPanel from "@/components/ciudadano/CiudadanoCiudadPanel";
import apiClient from "@/services/apiClient";
import { authService } from "@/services/authService";

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: 10,
        name: "Ana Pérez",
        email: "ana@test.com",
        role: "ciudadano",
      },
    },
    status: "authenticated",
  }),
}));

jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/services/authService", () => ({
  authService: {
    getCiudadesActivas: jest.fn(),
    getCiudadesInteres: jest.fn(),
    addCiudadInteres: jest.fn(),
    removeCiudadInteres: jest.fn(),
    cambiarContextoCiudad: jest.fn(),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("CITY-02 — Panel Ciudadano: Ciudad de Residencia y Ciudades de Interés", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  test("Muestra la ciudad de residencia activa, permite abrir el modal, agregar y eliminar ciudades de interés y cambiar contexto", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          id: 10,
          id_ciudad: 1,
          residencia_activa: true,
          ciudad_residencia: {
            id: 1,
            nombre: "Viale",
            provincia: "Entre Ríos",
            activa: true,
          },
        },
      },
    });

    authService.getCiudadesActivas.mockResolvedValueOnce({
      ok: true,
      data: [
        { id: 1, nombre: "Viale", provincia: "Entre Ríos" },
        { id: 2, nombre: "Paraná", provincia: "Entre Ríos" },
        { id: 3, nombre: "Concordia", provincia: "Entre Ríos" },
      ],
    });

    authService.getCiudadesInteres.mockResolvedValueOnce({
      ok: true,
      data: {
        ciudades: [
          {
            id: 2,
            nombre: "Paraná",
            provincia: "Entre Ríos",
            activa: true,
            estado: "activa",
          },
        ],
        maximo: 3,
        disponibles: 2,
      },
    });

    render(
      <CiudadanoCiudadProvider>
        <CiudadanoCiudadPanel />
      </CiudadanoCiudadProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Viale, Entre Ríos/i)).toBeInTheDocument();
    });

    const btnCiudades = screen.getByRole("button", { name: /Ciudades \(1\/3\)/i });
    fireEvent.click(btnCiudades);

    expect(
      await screen.findByText(/Mi ciudad de residencia y ciudades de interés/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Paraná, Entre Ríos/i)).toBeInTheDocument();

    // Cambiar el contexto de consulta a Paraná (como visitante) sin modificar la residencia
    authService.cambiarContextoCiudad.mockResolvedValueOnce({
      ok: true,
      data: {
        ciudad_seleccionada: {
          id: 2,
          nombre: "Paraná",
          provincia: "Entre Ríos",
          activa: true,
        },
        es_residencia: false,
        es_visitante: true,
        id_ciudad_residencia: 1,
        permisos_escritura: false,
      },
    });

    const btnConsultar = screen.getByRole("button", { name: /Consultar/i });
    fireEvent.click(btnConsultar);

    await waitFor(() => {
      expect(authService.cambiarContextoCiudad).toHaveBeenCalledWith(2);
    });

    expect(await screen.findByText(/Modo visitante/i)).toBeInTheDocument();

    // Eliminar Paraná de las ciudades de interés
    authService.removeCiudadInteres.mockResolvedValueOnce({
      ok: true,
      mensaje: "Ciudad de interés eliminada correctamente.",
      data: {
        ciudades: [],
        maximo: 3,
        disponibles: 3,
      },
    });

    const btnQuitar = screen.getByRole("button", {
      name: /Eliminar Paraná de mis ciudades de interés/i,
    });
    fireEvent.click(btnQuitar);

    await waitFor(() => {
      expect(authService.removeCiudadInteres).toHaveBeenCalledWith(2);
    });
  });

  test("Informa cuando la ciudad de residencia está inactiva y ofrece solicitar activación o continuar como visitante", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          id: 10,
          id_ciudad: null,
          residencia_activa: false,
          ciudad_residencia: {
            id: null,
            nombre: "Crespo",
            provincia: "Entre Ríos",
            activa: false,
          },
        },
      },
    });

    authService.getCiudadesActivas.mockResolvedValueOnce({
      ok: true,
      data: [{ id: 1, nombre: "Viale", provincia: "Entre Ríos" }],
    });

    authService.getCiudadesInteres.mockResolvedValueOnce({
      ok: true,
      data: { ciudades: [], maximo: 3, disponibles: 3 },
    });

    render(
      <CiudadanoCiudadProvider>
        <CiudadanoCiudadPanel />
      </CiudadanoCiudadProvider>
    );

    expect(
      await screen.findByText(/Tu ciudad de residencia \(Crespo, Entre Ríos\) aún no está activa/i)
    ).toBeInTheDocument();

    const linkSolicitud = screen.getByRole("link", {
      name: /Solicitar activación de ciudad/i,
    });
    expect(linkSolicitud).toHaveAttribute(
      "href",
      "/solicitud-activacion?ciudad=Crespo&provincia=Entre+R%C3%ADos"
    );
  });

  test("Bloquea agregar una cuarta ciudad cuando ya hay 3 guardadas e informa si una ciudad de interés se desactiva", async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        ok: true,
        data: {
          id: 10,
          id_ciudad: 1,
          residencia_activa: true,
          ciudad_residencia: {
            id: 1,
            nombre: "Viale",
            provincia: "Entre Ríos",
            activa: true,
          },
        },
      },
    });

    authService.getCiudadesActivas.mockResolvedValueOnce({
      ok: true,
      data: [
        { id: 1, nombre: "Viale", provincia: "Entre Ríos" },
        { id: 2, nombre: "Paraná", provincia: "Entre Ríos" },
        { id: 3, nombre: "Concordia", provincia: "Entre Ríos" },
        { id: 4, nombre: "Gualeguaychú", provincia: "Entre Ríos" },
        { id: 5, nombre: "Victoria", provincia: "Entre Ríos" },
      ],
    });

    authService.getCiudadesInteres.mockResolvedValueOnce({
      ok: true,
      data: {
        ciudades: [
          { id: 2, nombre: "Paraná", provincia: "Entre Ríos", activa: true, estado: "activa" },
          { id: 3, nombre: "Concordia", provincia: "Entre Ríos", activa: false, estado: "inactiva", aviso_inactiva: "La ciudad Concordia dejó de estar activa." },
          { id: 4, nombre: "Gualeguaychú", provincia: "Entre Ríos", activa: true, estado: "activa" },
        ],
        maximo: 3,
        disponibles: 0,
      },
    });

    render(
      <CiudadanoCiudadProvider>
        <CiudadanoCiudadPanel />
      </CiudadanoCiudadProvider>
    );

    expect(
      await screen.findByText(/La ciudad de interés Concordia dejó de estar activa/i)
    ).toBeInTheDocument();

    const btnCiudades = screen.getByRole("button", { name: /Ciudades \(3\/3\)/i });
    fireEvent.click(btnCiudades);

    expect(
      await screen.findByText(/Alcanzaste el máximo permitido de 3 ciudades adicionales de interés/i)
    ).toBeInTheDocument();
  });
});
