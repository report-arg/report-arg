import "@/styles/admin-dash.css";
import AdminShell from "@/components/admin/layout/AdminShell";

export const metadata = {
  title: "Panel de Administración | ReportARG",
  description: "Panel de gestión y administración general de la plataforma ReportARG",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}