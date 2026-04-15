import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserTable from "@/components/admin/UserTable";

export default function UsersPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7faff" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar section="Users" />
        <main style={{ padding: "32px 28px", flex: 1 }}>

          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", letterSpacing: 1 }}>ADMIN PANEL › USUARIOS</p>
              <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: "bold", color: "#2D3A8C" }}>
                Gestión de Usuarios
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#666", maxWidth: 520 }}>
                Administrá las credenciales de acceso, roles y estados de los ciudadanos y personal administrativo del sistema ReportARG.
              </p>
            </div>
            <button style={{
              padding: "10px 20px",
              background: "#2D3A8C",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}>
              + Crear Usuario
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            {[
              { label: "TOTAL USUARIOS", value: "12.482", sub: "+4.2%", subColor: "#1A7A3C" },
              { label: "ACTIVOS", value: "10.105", sub: "——", subColor: "#2D3A8C" },
              { label: "INACTIVOS", value: "2.377", sub: "——", subColor: "#C0392B" },
              { label: "ADMINISTRADORES", value: "48", sub: "——", subColor: "#F5C842" },
            ].map((stat) => (
              <div key={stat.label} style={{
                flex: 1, background: "#fff", borderRadius: 10,
                border: "1px solid #e8f0fa", padding: "16px 20px",
              }}>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>{stat.label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "#2D3A8C" }}>{stat.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: stat.subColor, fontWeight: "bold" }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <UserTable />

        </main>
      </div>
    </div>
  );
}