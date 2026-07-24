import React, { useState } from "react";
import {
  LayoutGrid,
  Calendar,
  Users,
  Activity,
  FileText,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";

interface SidebarProps {
  userName?: string;
  onNewCita?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userName = "Dr. Alejandro",
  onNewCita,
  onLogout,
}) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "citas-diarias", label: "Citas Diarias", icon: Calendar },
    { id: "pacientes", label: "Pacientes", icon: Users },
    { id: "tratamientos", label: "Tratamientos", icon: Activity },
    { id: "reportes", label: "Reportes", icon: FileText },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>D</span>
        </div>
        <div className="logo-text">
          <h3>DentalFlow</h3>
          <p>CLINICAL MANAGEMENT</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Nueva Cita Button */}
      <div className="sidebar-new-cita">
        <button className="btn-new-cita" onClick={onNewCita}>
          <Plus size={20} />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Bottom Menu */}
      <div className="sidebar-bottom">
        <button className="menu-item">
          <Settings size={20} />
          <span>Ajustes</span>
        </button>

        <button className="menu-item logout" onClick={onLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
