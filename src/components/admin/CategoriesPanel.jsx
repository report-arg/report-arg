"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const coloresExtra = ["#7F77DD", "#D85A30", "#1D9E75", "#D4537E", "#378ADD", "#EF9F27", "#639922", "#888780"];

export default function CategoriesPanel() {
  const [categorias,  setCategorias]  = useState([]);
  const [nuevaCat,    setNuevaCat]    = useState("");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/categorias`);
      const data = await res.json();
      if (data.ok) setCategorias(data.data);
    } catch (err) {
      setError("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }

  async function agregarCategoria() {
    if (!nuevaCat.trim()) return;
    setError("");
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaCat.trim() }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.mensaje); return; }
      await fetchCategorias();
      setNuevaCat("");
      setSuccessMsg("Categoría agregada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError("Error al agregar categoría");
    } finally {
      setSaving(false);
    }
  }

  async function eliminarCategoria(id) {
    setError("");
    try {
      const res  = await fetch(`${API_URL}/api/admin/categorias/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) { setError(data.mensaje); return; }
      await fetchCategorias();
      setConfirmDelete(null);
      setSuccessMsg("Categoría eliminada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError("Error al eliminar categoría");
    }
  }

  return (
    <div>

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 380, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>¿Eliminar categoría?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              Se eliminará <strong>{confirmDelete.nombre}</strong>. Si tiene reclamos asociados no se podrá eliminar.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                padding: "8px 18px", border: "1px solid var(--color-border)",
                borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
              }}>Cancelar</button>
              <button onClick={() => eliminarCategoria(confirmDelete.id)} style={{
                padding: "8px 18px", background: "var(--color-danger)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: "bold", cursor: "pointer",
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div style={{
          background: "#FEE2E2", border: "1px solid #FCA5A5",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#991B1B",
        }}>{error}</div>
      )}
      {successMsg && (
        <div style={{
          background: "#EAF3DE", border: "1px solid #639922",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#27500A",
        }}>✓ {successMsg}</div>
      )}

      {/* Agregar categoría */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>
          NUEVA CATEGORÍA
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{
              flex: 1, padding: "9px 12px", fontSize: 13,
              border: "1px solid var(--color-border)", borderRadius: 8,
              background: "#fff", color: "#333", boxSizing: "border-box",
            }}
            placeholder="Ej: Cortes de luz, Inundaciones..."
            value={nuevaCat}
            onChange={e => setNuevaCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && agregarCategoria()}
            disabled={saving}
          />
          <button
            onClick={agregarCategoria}
            disabled={saving || !nuevaCat.trim()}
            style={{
              padding: "9px 20px", background: saving ? "#ccc" : "var(--color-primary)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: "bold",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Agregando..." : "+ Agregar"}
          </button>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>
            CATEGORÍAS ACTIVAS ({categorias.length})
          </p>
        </div>

        {loading && (
          <p style={{ padding: "32px 20px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            Cargando categorías...
          </p>
        )}

        {!loading && categorias.length === 0 && (
          <p style={{ padding: "32px 20px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            No hay categorías cargadas.
          </p>
        )}

        {!loading && categorias.map((c, i) => (
          <div key={c.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: i < categorias.length - 1 ? "1px solid var(--color-border)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: coloresExtra[i % coloresExtra.length],
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 500 }}>{c.nombre}</p>
                {c.descripcion && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>{c.descripcion}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setConfirmDelete(c)}
              style={{
                padding: "6px 14px", background: "none",
                border: "1px solid var(--color-border)", borderRadius: 8,
                fontSize: 12, color: "var(--color-danger)", cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}