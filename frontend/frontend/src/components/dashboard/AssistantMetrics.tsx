import React from "react";
import { Bot, CalendarCheck, RotateCcw, XCircle } from "lucide-react";

interface AssistantMetricsProps {
  agendadasBot: number;

  reagendadasBot: number;

  canceladasBot: number;
}

export const AssistantMetrics: React.FC<AssistantMetricsProps> = ({
  agendadasBot,
  reagendadasBot,
  canceladasBot,
}) => {
  return (
    <section className="assistant-card">
      <div className="assistant-title">
        <Bot size={26} />

        <h2>Métricas del Asistente Virtual</h2>
      </div>

      <div className="assistant-metrics-grid">
        <div className="assistant-metric green">
          <div className="metric-icon">
            <CalendarCheck size={22} />
          </div>

          <div>
            <span>AGENDADOS POR BOT</span>

            <h3>{agendadasBot}</h3>
          </div>
        </div>

        <div className="assistant-metric teal">
          <div className="metric-icon">
            <RotateCcw size={22} />
          </div>

          <div>
            <span>REAGENDADOS BOT</span>

            <h3>{reagendadasBot}</h3>
          </div>
        </div>

        <div className="assistant-metric red">
          <div className="metric-icon">
            <XCircle size={22} />
          </div>

          <div>
            <span>CANCELACIONES BOT</span>

            <h3>{canceladasBot}</h3>
          </div>
        </div>
      </div>
    </section>
  );
};
