"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import apiClient from "@/services/apiClient";

const OPCIONES_TIPO = [
  { value: "reclamo", label: "Reclamo" },
  { value: "comunicado", label: "Comunicado" },
  { value: "ambos", label: "Reclamo y Comunicado (Ambos)" },
];

export default function CrearCategoriaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "reclamo",
    orden: 0,
    estado: "activo",
  });

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }
    if (!form.tipo) {
      setError("El tipo de aplicación es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post("/admin/categorias", {
        ...form,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        orden: Number(form.orden) || 0,
      });

      if (res.data?.ok) {
        toast.success(`Categoría "${form.nombre.trim()}" creada correctamente.`);
        router.push("/admin/categories");
      } else {
        setError(res.data?.mensaje || "Error al registrar la categoría.");
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Crear Nueva Categoría"
        description="Configurá una nueva categoría para la clasificación de reclamos ciudadanos o comunicados institucionales."
        action={
          <Button
            onClick={() => router.push("/admin/categories")}
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver a categorías
          </Button>
        }
      />

      <div className="bg-surface rounded-2xl border border-border-subtle p-6 max-w-2xl shadow-xs space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la categoría *"
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            placeholder="Ej: Alumbrado Público, Cloacas, Arbolado..."
            leftIcon={<Tag size={15} />}
          />

          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Breve descripción del alcance operativo y problemáticas cubiertas por esta categoría..."
            rows={3}
            maxLength={300}
            showCount
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de Aplicación *"
              value={form.tipo}
              onChange={(val) => setForm((prev) => ({ ...prev, tipo: String(val) }))}
              options={OPCIONES_TIPO}
              placeholder="Seleccionar tipo..."
            />

            <Input
              label="Orden de Visualización"
              type="number"
              min={0}
              value={form.orden}
              onChange={(e) => setForm((prev) => ({ ...prev, orden: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.estado === "activo"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    estado: e.target.checked ? "activo" : "inactivo",
                  }))
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-text-primary">
                Categoría activa (habilitada para selección de vecinos e instituciones)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              onClick={() => router.push("/admin/categories")}
              variant="outline"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Crear categoría
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
