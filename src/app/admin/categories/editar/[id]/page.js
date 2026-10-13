"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import apiClient from "@/services/apiClient";

export default function EditarCategoriaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    tipo: "",
    orden: 0,
    estado: "activo",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchCategoria() {
      try {
        const res = await apiClient.get(`/admin/categorias/${id}`);
        const data = res.data;
        if (isMounted && data.ok) setForm(data.data);
      } catch {
        if (isMounted) setError("Error al cargar la categoría");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCategoria();
    return () => { isMounted = false; };
  }, [id]);

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
      const res = await apiClient.put(`/admin/categorias/${id}`, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || null,
        tipo: form.tipo,
        estado: form.estado,
        orden: Number(form.orden),
      });
      const data = res.data;
      if (!data.ok) return setError(data.mensaje);
      setSuccess("La categoría se ha actualizado correctamente.");
      setTimeout(() => router.push("/admin/categories"), 1500);
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted gap-2 text-sm">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span>Cargando categoría...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title={`Editar Categoría — ${form.codigo || ""}`}
        description="Modificá el nombre, tipo de publicación, orden o estado de la categoría."
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
        {/* Código y Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Código
            </label>
            <input
              value={form.codigo || ""}
              disabled
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface-subtle text-text-muted font-mono cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Nombre *
            </label>
            <input
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion || ""}
            onChange={handleChange}
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
              value={form.tipo || ""}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
            >
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
              value={form.orden ?? 0}
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
            id="edit-cat-activo"
            name="estado"
            checked={form.estado === "activo"}
            onChange={handleChange}
            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="edit-cat-activo" className="text-xs font-medium text-text-primary cursor-pointer select-none">
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
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
