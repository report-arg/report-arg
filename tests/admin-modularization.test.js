import React from "react";
import { render, screen, fireEvent, act, renderHook } from "@testing-library/react";
import apiClient from "@/services/apiClient";
import useDebounce from "@/hooks/useDebounce";
import useInstituciones from "@/hooks/admin/useInstituciones";
import InstitucionRejectModal from "@/components/admin/instituciones/InstitucionRejectModal";
import InstitucionApproveModal from "@/components/admin/instituciones/InstitucionApproveModal";
import ReclamoFilterBar from "@/components/admin/reclamos/ReclamoFilterBar";
import UsuarioFilterBar from "@/components/admin/usuarios/UsuarioFilterBar";
import CategoriaFilterBar from "@/components/admin/categorias/CategoriaFilterBar";

// Mock apiClient
jest.mock("@/services/apiClient");

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/admin",
  useParams: () => ({}),
}));

describe("ADMIN-01 - Etapa 3: Modularización y reducción de responsabilidades", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe("Hook Reutilizable: useDebounce", () => {
    it("debe retornar el valor inicial inmediatamente", () => {
      const { result } = renderHook(() => useDebounce("test inicial", 300));
      expect(result.current).toBe("test inicial");
    });

    it("debe actualizar el valor debounced únicamente tras cumplirse el retardo", () => {
      let valor = "primero";
      const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
        initialProps: { v: valor },
      });

      expect(result.current).toBe("primero");

      valor = "segundo";
      rerender({ v: valor });

      // Inmediatamente después del rerender, el valor aún debe ser el anterior
      expect(result.current).toBe("primero");

      // Avanzamos 200ms (aún no transcurrieron los 300ms)
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe("primero");

      // Avanzamos los 100ms restantes
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe("segundo");
    });

    it("debe reiniciar el temporizador si el valor cambia rápidamente (evitar condiciones de carrera)", () => {
      let valor = "v1";
      const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
        initialProps: { v: valor },
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });
      valor = "v2";
      rerender({ v: valor });

      act(() => {
        jest.advanceTimersByTime(250);
      });
      // Han pasado 450ms totales, pero solo 250ms desde 'v2'
      expect(result.current).toBe("v1");

      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current).toBe("v2");
    });
  });

  describe("Concurrencia en useInstituciones: Prevención de condiciones de carrera", () => {
    it("una búsqueda anterior lenta no debe sobreescribir los resultados de una búsqueda reciente rápida", async () => {
      let resolverPeticionLenta;
      const promesaLenta = new Promise((resolve) => {
        resolverPeticionLenta = resolve;
      });

      apiClient.get.mockImplementation((url) => {
        if (url.includes("busqueda=lenta")) {
          return promesaLenta;
        }
        if (url.includes("busqueda=rapida")) {
          return Promise.resolve({
            data: {
              ok: true,
              data: [{ id: 99, nombre: "Institución Rápida" }],
              total: 1,
              totalPaginas: 1,
            },
          });
        }
        return Promise.resolve({ data: { ok: true, data: [] } });
      });

      const { result } = renderHook(() => useInstituciones({ fetchStats: false }));

      // Disparar búsqueda lenta
      act(() => {
        result.current.cargarInstituciones(1, "lenta", "todos");
      });

      // Disparar búsqueda rápida que resuelve antes
      await act(async () => {
        await result.current.cargarInstituciones(1, "rapida", "todos");
      });

      // El resultado debe reflejar la búsqueda rápida
      expect(result.current.instituciones).toEqual([{ id: 99, nombre: "Institución Rápida" }]);

      // Ahora resuelve la petición lenta anterior tardía
      await act(async () => {
        resolverPeticionLenta({
          data: {
            ok: true,
            data: [{ id: 1, nombre: "Institución Vieja Lenta" }],
            total: 1,
            totalPaginas: 1,
          },
        });
      });

      // El resultado NO debe haber sido sobreescrito por la petición lenta anterior
      expect(result.current.instituciones).toEqual([{ id: 99, nombre: "Institución Rápida" }]);
    });
  });

  describe("Instituciones y Solicitudes: Modales y Validaciones", () => {
    const mockInstitution = {
      id: 42,
      nombre: "Bomberos Voluntarios",
      email: "bomberos@test.gob.ar",
      cuit: "30-12345678-9",
      tipo: "Emergencias",
    };

    it("InstitucionRejectModal: debe impedir rechazo si el motivo está vacío mostrando error", () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <InstitucionRejectModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          institucion={mockInstitution}
          loading={false}
        />
      );

      expect(screen.getByText(/Rechazar solicitud institucional/i)).toBeInTheDocument();
      expect(screen.getByText(/Bomberos Voluntarios/i)).toBeInTheDocument();

      const btnConfirmar = screen.getByRole("button", { name: /Confirmar rechazo/i });
      fireEvent.click(btnConfirmar);

      // No debe llamar a onConfirm y debe mostrar mensaje de error en pantalla
      expect(onConfirm).not.toHaveBeenCalled();
      expect(
        screen.getByText(/El motivo de rechazo es obligatorio para notificar formalmente a la entidad./i)
      ).toBeInTheDocument();
    });

    it("InstitucionRejectModal: debe habilitar confirmación al ingresar un motivo válido y disparar onConfirm", () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <InstitucionRejectModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          institucion={mockInstitution}
          loading={false}
        />
      );

      const textarea = screen.getByPlaceholderText(/Ej. La documentación adjunta no coincide/i);
      fireEvent.change(textarea, { target: { value: "Documentación fiscal ilegible" } });

      const btnConfirmar = screen.getByRole("button", { name: /Confirmar rechazo/i });
      fireEvent.click(btnConfirmar);

      expect(onConfirm).toHaveBeenCalledWith("Documentación fiscal ilegible");
    });

    it("InstitucionRejectModal: debe invocar onClose al cancelar", () => {
      const onClose = jest.fn();
      render(
        <InstitucionRejectModal
          isOpen={true}
          onClose={onClose}
          onConfirm={jest.fn()}
          institucion={mockInstitution}
          loading={false}
        />
      );

      const btnCancelar = screen.getByRole("button", { name: /Cancelar/i });
      fireEvent.click(btnCancelar);
      expect(onClose).toHaveBeenCalled();
    });

    it("InstitucionApproveModal: debe renderizar detalles y confirmar la verificación", () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <InstitucionApproveModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          institucion={mockInstitution}
          loading={false}
        />
      );

      expect(screen.getByText(/¿Verificar institución\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Bomberos Voluntarios/i)).toBeInTheDocument();

      const btnAprobar = screen.getByRole("button", { name: /Verificar institución/i });
      fireEvent.click(btnAprobar);
      expect(onConfirm).toHaveBeenCalled();

      const btnCancelar = screen.getByRole("button", { name: /Cancelar/i });
      fireEvent.click(btnCancelar);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Filtros y Búsqueda Modularizados", () => {
    it("ReclamoFilterBar: debe emitir cambios de estado y búsqueda", () => {
      const onBusquedaChange = jest.fn();
      const onFiltroEstadoChange = jest.fn();
      const onLimpiarTodo = jest.fn();

      render(
        <ReclamoFilterBar
          busqueda=""
          onBusquedaChange={onBusquedaChange}
          onLimpiarBusqueda={jest.fn()}
          filtroEstado=""
          onFiltroEstadoChange={onFiltroEstadoChange}
          onLimpiarTodo={onLimpiarTodo}
          totalResultados={5}
          totalGeneral={10}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por ID, título/i);
      fireEvent.change(searchInput, { target: { value: "Bache" } });
      expect(onBusquedaChange).toHaveBeenCalledWith("Bache");

      const selectEstado = screen.getByRole("combobox");
      fireEvent.change(selectEstado, { target: { value: "Pendiente" } });
      expect(onFiltroEstadoChange).toHaveBeenCalledWith("Pendiente");
    });

    it("UsuarioFilterBar: debe emitir cambios en búsqueda, rol y estado de usuarios", () => {
      const onBusquedaChange = jest.fn();
      const onFiltroRolChange = jest.fn();
      const onFiltroEstadoChange = jest.fn();
      const onLimpiarTodo = jest.fn();

      render(
        <UsuarioFilterBar
          busqueda=""
          onBusquedaChange={onBusquedaChange}
          onLimpiarBusqueda={jest.fn()}
          filtroRol="Todos"
          onFiltroRolChange={onFiltroRolChange}
          filtroEstado="Todos"
          onFiltroEstadoChange={onFiltroEstadoChange}
          onLimpiarTodo={onLimpiarTodo}
          hayFiltrosActivos={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar usuario por nombre/i);
      fireEvent.change(searchInput, { target: { value: "García" } });
      expect(onBusquedaChange).toHaveBeenCalledWith("García");

      const selectElements = screen.getAllByRole("combobox");
      // primer select es Rol, segundo es Estado
      fireEvent.change(selectElements[0], { target: { value: "admin" } });
      expect(onFiltroRolChange).toHaveBeenCalledWith("admin");

      fireEvent.change(selectElements[1], { target: { value: "activo" } });
      expect(onFiltroEstadoChange).toHaveBeenCalledWith("activo");
    });

    it("CategoriaFilterBar: debe emitir cambios en búsqueda y tipo de categoría", () => {
      const onBusquedaChange = jest.fn();
      const onFiltroTipoChange = jest.fn();
      const onFiltroEstadoChange = jest.fn();
      const onRefresh = jest.fn();

      render(
        <CategoriaFilterBar
          busqueda=""
          onBusquedaChange={onBusquedaChange}
          onLimpiarBusqueda={jest.fn()}
          filtroTipo=""
          onFiltroTipoChange={onFiltroTipoChange}
          filtroEstado=""
          onFiltroEstadoChange={onFiltroEstadoChange}
          onRefresh={onRefresh}
          loading={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Buscar por nombre, código o descripción/i);
      fireEvent.change(searchInput, { target: { value: "Luz" } });
      expect(onBusquedaChange).toHaveBeenCalledWith("Luz");

      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "reclamo" } });
      expect(onFiltroTipoChange).toHaveBeenCalledWith("reclamo");
    });
  });
});
