"use client";

export default function Navbar({ section = "Dashboard" }) {
  return (
    <header style={{
      height: 60,
      background: "#fff",
      borderBottom: "1px solid #e8f0fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
    }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#aaa" }}>
        <span>ADMIN PANEL</span>
        <span>›</span>
        <span style={{ color: "#2D3A8C", fontWeight: "bold" }}>{section.toUpperCase()}</span>
      </div>

      {/* Buscador */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search system records..."
          style={{
            padding: "7px 14px 7px 34px",
            borderRadius: 8,
            border: "1px solid #e8f0fa",
            fontSize: 13,
            width: 240,
            color: "#333",
            outline: "none",
            background: "#f7faff",
          }}
        />
        <span style={{ position: "absolute", left: 10, top: 8, fontSize: 14, color: "#aaa" }}>🔍</span>
      </div>

      {/* Acciones + usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 18, cursor: "pointer", color: "#aaa" }}>🔔</span>
        <span style={{ fontSize: 18, cursor: "pointer", color: "#aaa" }}>❓</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "#2D3A8C" }}>Admin Root</p>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Super Administrator</p>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#2D3A8C",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 14,
          }}>
            A
          </div>
        </div>
      </div>
    </header>
  );
}