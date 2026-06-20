"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./ChartRenderer.module.css";

/* ─── Paleta de colores para las series ─── */
const CHART_COLORS = [
  "#00c48c", // primary green
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
];

/* ─── Tipos ─── */
export interface ChartDataItem {
  label: string;
  value: number;
  value2?: number;
}

export interface ChartProps {
  title: string;
  type: "bar" | "line" | "pie";
  data: ChartDataItem[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  legend?: string[];
}

/* ─── Tooltip personalizado ─── */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.customTooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className={styles.tooltipValue} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString("es-CL")}
        </p>
      ))}
    </div>
  );
}

/* ─── Componente principal ─── */
export function ChartRenderer({ title, type, data, xAxisLabel, yAxisLabel, legend }: ChartProps) {
  const chartData = useMemo(
    () => (data ?? []).map((d) => ({ name: d.label, value: d.value, value2: d.value2 })),
    [data],
  );

  // During tool call streaming, data may not be available yet
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h4 className={styles.chartTitle}>{title ?? "Generando gráfico..."}</h4>
        <div className={styles.chartContainer} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Cargando datos del gráfico…</span>
        </div>
      </div>
    );
  }
  const hasSecondSeries = data.some((d) => d.value2 !== undefined);
  const legendLabels = legend ?? ["Serie 1", "Serie 2"];

  const axisStyle = {
    fontSize: 11,
    fill: "var(--color-text-secondary)",
  };

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>{title}</h4>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: xAxisLabel ? 35 : 10, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                label={xAxisLabel ? { value: xAxisLabel, position: "bottom", offset: 15, style: axisStyle } : undefined}
              />
              <YAxis
                tick={axisStyle}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: -15, style: axisStyle } : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                name={legendLabels[0]}
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              {hasSecondSeries && (
                <Bar
                  dataKey="value2"
                  name={legendLabels[1]}
                  fill={CHART_COLORS[1]}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              )}
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: xAxisLabel ? 35 : 10, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                label={xAxisLabel ? { value: xAxisLabel, position: "bottom", offset: 15, style: axisStyle } : undefined}
              />
              <YAxis
                tick={axisStyle}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: -15, style: axisStyle } : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                name={legendLabels[0]}
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS[0] }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
              {hasSecondSeries && (
                <Line
                  type="monotone"
                  dataKey="value2"
                  name={legendLabels[1]}
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: CHART_COLORS[1] }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                />
              )}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={3}
                animationDuration={800}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: "var(--color-text-muted)" }}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend fuera del SVG para evitar superposición con ejes */}
      {(hasSecondSeries || legend) && type !== "pie" && (
        <ul className={styles.legendList}>
          <li className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: CHART_COLORS[0] }} />
            {legendLabels[0]}
          </li>
          {hasSecondSeries && (
            <li className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: CHART_COLORS[1] }} />
              {legendLabels[1]}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
