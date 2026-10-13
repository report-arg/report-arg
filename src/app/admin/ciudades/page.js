"use client";

import { useEffect, useState } from "react";
import { MapPin, Info, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import apiClient from "@/services/apiClient";

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarCiudades = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/ciudades");
      if (res.data?.ok) {
        setCiudades(res.data.data || []);
      } else {
        setError("No se pudieron cargar las ciudades disponibles.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor para consultar ciudades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCiudades();
  }, []);

  return (
    <div className="w-full">
      <PageHeader
        title="Administración Territorial"
        description="Localidades habilitadas en ReportARG y estado de cobertura territorial."
        action={
          <Button
            onClick={cargarCiudades}
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw size={14} />}
          >
            Actualizar
          </Button>
        }
      />

      {/* Banner de preparación para CITY */}
      <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-text-primary m-0">
            Módulo preparado para integración Multi-Ciudad (Tickets CITY-01 a CITY-05)
          </p>
          <p className="text-text-secondary m-0 leading-relaxed">
            Actualmente el sistema opera con las localidades activas registradas en la plataforma.
            Las funcionalidades avanzadas de alta territorial, solicitudes ciudadanas de apertura de ciudades y asignación de cabeceras se habilitarán en la siguiente etapa.
          </p>
        </div>
      </div>

      {/* Listado de ciudades */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary m-0">Ciudades Disponibles</h3>
            <p className="text-xs text-text-muted m-0 mt-0.5">
              {ciudades.length} {ciudades.length === 1 ? "localidad activa" : "localidades activas"} registradas
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando datos territoriales...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
            <Button onClick={cargarCiudades} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : ciudades.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-xs">
            No se encontraron localidades activas registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Ciudad / Localidad</th>
                  <th className="py-3 px-4">Provincia</th>
                  <th className="py-3 px-4">Estado Operativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {ciudades.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-text-secondary">
                      #{c.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-primary shrink-0" />
                        <span className="font-bold text-text-primary">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-medium">
                      {c.provincia}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="Resuelto" customLabel="Activa" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
