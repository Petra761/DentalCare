import React from "react";

interface ProgressBarProps {
  title: string;

  value: number;

  total: number;

  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  value,
  total,
  color = "#2563EB",
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span>{title}</span>

        <span>{percentage}%</span>
      </div>

      <div className="progress-background">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <small>
        {value} de {total}
      </small>
    </div>
  );
};
