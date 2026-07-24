import React from "react";
import { MessageCircle } from "lucide-react";

interface TopBarProps {
  userName: string;
}

export const TopBar: React.FC<TopBarProps> = ({ userName }) => {
  const fechaActual = new Date();

  const fechaFormateada = fechaActual.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="dashboard-topbar">
      <div className="dashboard-topbar-title">
        <h1>¡Buen día, {userName}!</h1>
        <p>{fechaFormateada}</p>
      </div>

      <div className="topbar-right">
        <div className="whatsapp-status">
          <MessageCircle size={16} style={{ color: "#10B981" }} />
          <span>WHATSAPP: CONECTADO</span>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p className="user-role">Administrador</p>
          </div>
          <div className="user-avatar">
            <span>A</span>
          </div>
        </div>
      </div>
    </section>
  );
};
