"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import apiClient from "@/services/apiClient";

export default function CrearCategoriaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    orden: 0,
    estado: "activo",
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "activo" : "inactivo") : value,
    }));
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!form.nombre.trim()) return setError("El nombre es obligatorio");
    if (!form.tipo) return setError("El tipo es obligatorio");

    setSaving(true);
    try {
      const res = await apiClient.post(`/admin/categorias`, {
        ...form,
        nombre: form.nombre.trim(),
        orden: Number(form.orden),
      });
      const data = res.data;
      if (!data.ok) return setError(data.mensaje);
      setSuccess("Categoría creada correctamente.");
      setTimeout(() => router.push("/admin/categories"), 1500);
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Crear Nueva Categoría"
        description="Completá la información para registrar una nueva categoría en ReportARG."
        action={
          <Button
            onClick={() => router.push("/admin/categories")}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a categorías
          </Button>
        }
      />

      <div className="bg-surface rounded-2xl border border-border-subtle p-6 max-w-2xl shadow-xs">
        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Nombre *
          </label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Alumbrado Público, Cloacas..."
            className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción del alcance de esta categoría..."
            rows={3}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden resize-y"
          />
        </div>

        {/* Tipo y Orden */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Tipo de Aplicación *
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="reclamo">Reclamo</option>
              <option value="comunicado">Comunicado</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Orden de Visualización
            </label>
            <input
              type="number"
              name="orden"
              value={form.orden}
              onChange={handleChange}
              min={0}
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
            />
          </div>
        </div>

        {/* Estado activo */}
        <div className="flex items-center gap-3 pt-2 pb-4">
          <input
            type="checkbox"
            id="cat-activo"
            name="estado"
            checked={form.estado === "activo"}
            onChange={handleChange}
            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="cat-activo" className="text-xs font-medium text-text-primary cursor-pointer select-none">
            Categoría activa (disponible para selección)
          </label>
        </div>

        {/* Mensajes */}
        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
            ⚠ {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            onClick={() => router.push("/admin/categories")}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            variant="primary"
          >
            Crear categoría
          </Button>
        </div>
      </div>
    </div>
  );
}