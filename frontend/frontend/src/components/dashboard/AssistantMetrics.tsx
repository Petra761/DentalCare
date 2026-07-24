import React from "react";
import {
  Bot,
  MessageCircle,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";

interface AssistantMetricsProps {
  totalCitas: number;
  citasConfirmadas: number;
  citasPendientes: number;
  porcentajeConfirmadas: number;
}

export const AssistantMetrics: React.FC<AssistantMetricsProps> = ({
  totalCitas,
  citasConfirmadas,
  citasPendientes,
  porcentajeConfirmadas,
}) => {
  return (
    <section className="assistant-card">
      <div className="assistant-title">
        <Bot size={26} />
        <h2>Asistente Virtual</h2>
      </div>

      <div className="assistant-item">
        <div className="assistant-icon">
          <MessageCircle size={20} />
        </div>

        <div>
          <span>Total de consultas</span>
          <h3>{totalCitas}</h3>
        </div>
      </div>

      <div className="assistant-item">
        <div className="assistant-icon">
          <CheckCircle2 size={20} />
        </div>

        <div>
          <span>Citas confirmadas</span>
          <h3>{citasConfirmadas}</h3>
        </div>
      </div>

      <div className="assistant-item">
        <div className="assistant-icon">
          <Clock3 size={20} />
        </div>

        <div>
          <span>Citas pendientes</span>
          <h3>{citasPendientes}</h3>
        </div>
      </div>

      <div className="assistant-item">
        <div className="assistant-icon">
          <TrendingUp size={20} />
        </div>

        <div>
          <span>Efectividad</span>
          <h3>{porcentajeConfirmadas}%</h3>
        </div>
      </div>
    </section>
  );
};
