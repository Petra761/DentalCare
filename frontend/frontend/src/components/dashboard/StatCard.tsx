import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;

  value: string | number;

  subtitle?: string;

  icon: LucideIcon;

  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => {
  return (
    <article
      className="stat-card"
      style={{
        borderLeft: `5px solid ${color}`,
      }}
    >
      <div className="stat-card-top">
        <div
          className="stat-card-icon"
          style={{
            background: color,
          }}
        >
          <Icon size={22} color="white" />
        </div>

        {subtitle && (
          <span
            className="stat-card-subtitle"
            style={{
              color,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      <span className="stat-card-title">{title}</span>

      <h2 className="stat-card-value">{value}</h2>
    </article>
  );
};
