"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
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

interface ChartEntry {
  name: string;
  value: number;
  value2?: number;
}

/* ─── Hook: animación al entrar al viewport ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Solo animar una vez
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
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

/* ─── Panel de detalle al hacer click ─── */
function DetailPanel({
  data,
  index,
  legendLabels,
  hasSecondSeries,
  type,
  onClose,
}: {
  data: ChartEntry[];
  index: number;
  legendLabels: string[];
  hasSecondSeries: boolean;
  type: "bar" | "line" | "pie";
  onClose: () => void;
}) {
  const item = data[index];
  if (!item) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <span className={styles.detailTitle}>{item.name}</span>
        <button
          className={styles.detailClose}
          onClick={onClose}
          aria-label="Cerrar detalle"
        >
          ✕
        </button>
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.detailStat}>
          <span className={styles.detailStatLabel}>{legendLabels[0]}</span>
          <span
            className={styles.detailStatValue}
            style={{ color: CHART_COLORS[0] }}
          >
            {item.value.toLocaleString("es-CL")}
          </span>
        </div>

        {hasSecondSeries && item.value2 !== undefined && (
          <div className={styles.detailStat}>
            <span className={styles.detailStatLabel}>{legendLabels[1]}</span>
            <span
              className={styles.detailStatValue}
              style={{ color: CHART_COLORS[1] }}
            >
              {item.value2.toLocaleString("es-CL")}
            </span>
          </div>
        )}

        {type !== "pie" && hasSecondSeries && item.value2 !== undefined && (
          <div className={styles.detailStat}>
            <span className={styles.detailStatLabel}>Diferencia</span>
            <span
              className={styles.detailStatValue}
              style={{
                color: item.value - item.value2 >= 0 ? "#22c55e" : "#ef4444",
              }}
            >
              {item.value - item.value2 >= 0 ? "+" : ""}
              {(item.value - item.value2).toLocaleString("es-CL")}
            </span>
          </div>
        )}

        <div className={styles.detailStat}>
          <span className={styles.detailStatLabel}>% del total</span>
          <span className={styles.detailStatValue}>{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export function ChartRenderer({
  title,
  type,
  data,
  xAxisLabel,
  yAxisLabel,
  legend,
}: ChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const { ref, isVisible } = useInView(0.15);

  const chartData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        name: d.label,
        value: d.value,
        value2: d.value2,
      })),
    [data],
  );

  const hasSecondSeries = useMemo(
    () => (data ?? []).some((d) => d.value2 !== undefined),
    [data],
  );
  const legendLabels = legend ?? ["Serie 1", "Serie 2"];
  const isSeriesHidden = (key: string) => hiddenSeries.has(key);

  /* ─── Helpers para extraer el índice numérico de Recharts ─── */
  const toNumericIndex = (val: unknown): number | null => {
    if (typeof val === "number") return val;
    return null;
  };

  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /* ─── Lógica de opacidad (hover highlight + selección) ─── */
  const getItemOpacity = useCallback(
    (index: number) => {
      // La selección tiene prioridad sobre el hover
      if (selectedIndex !== null) {
        return index === selectedIndex ? 1 : 0.3;
      }
      if (activeIndex !== null) {
        return index === activeIndex ? 1 : 0.3;
      }
      return 1;
    },
    [activeIndex, selectedIndex],
  );

  /* ─── Handlers de click (chart-level para bar/line) ─── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = useCallback((state: any) => {
    const idx = toNumericIndex(state?.activeTooltipIndex);
    if (idx !== null) {
      setSelectedIndex((prev) => (prev === idx ? null : idx));
    }
  }, []);

  const handlePieClick = useCallback((_: unknown, index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  // During tool call streaming, data may not be available yet
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard} ref={ref}>
        <h4 className={styles.chartTitle}>
          {title ?? "Generando gráfico..."}
        </h4>
        <div
          className={styles.chartContainer}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}
          >
            Cargando datos del gráfico…
          </span>
        </div>
      </div>
    );
  }

  const axisStyle = {
    fontSize: 11,
    fill: "var(--color-text-secondary)",
  };

  return (
    <div
      className={`${styles.chartCard} ${isVisible ? styles.chartVisible : styles.chartHidden}`}
      ref={ref}
    >
      <h4 className={styles.chartTitle}>{title}</h4>

      <div className={styles.chartContainer}>
        {isVisible && (
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: xAxisLabel ? 35 : 10,
                  left: 30,
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMouseMove={(state: any) => {
                  const idx = toNumericIndex(state?.activeTooltipIndex);
                  if (idx !== null) setActiveIndex(idx);
                }}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={handleChartClick}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tick={axisStyle}
                  label={
                    xAxisLabel
                      ? {
                          value: xAxisLabel,
                          position: "bottom",
                          offset: 15,
                          style: axisStyle,
                        }
                      : undefined
                  }
                />
                <YAxis
                  tick={axisStyle}
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                          offset: -15,
                          style: axisStyle,
                        }
                      : undefined
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                {!isSeriesHidden("value") && (
                  <Bar
                    dataKey="value"
                    name={legendLabels[0]}
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    style={{ cursor: "pointer" }}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[0]}
                        opacity={getItemOpacity(index)}
                        style={{ transition: "opacity 0.2s ease" }}
                      />
                    ))}
                  </Bar>
                )}
                {hasSecondSeries && !isSeriesHidden("value2") && (
                  <Bar
                    dataKey="value2"
                    name={legendLabels[1]}
                    fill={CHART_COLORS[1]}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    style={{ cursor: "pointer" }}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[1]}
                        opacity={getItemOpacity(index)}
                        style={{ transition: "opacity 0.2s ease" }}
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            ) : type === "line" ? (
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: xAxisLabel ? 35 : 10,
                  left: 30,
                }}
                onClick={handleChartClick}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tick={axisStyle}
                  label={
                    xAxisLabel
                      ? {
                          value: xAxisLabel,
                          position: "bottom",
                          offset: 15,
                          style: axisStyle,
                        }
                      : undefined
                  }
                />
                <YAxis
                  tick={axisStyle}
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                          offset: -15,
                          style: axisStyle,
                        }
                      : undefined
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                {!isSeriesHidden("value") && (
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={legendLabels[0]}
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS[0], cursor: "pointer" }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                    animationDuration={800}
                  />
                )}
                {hasSecondSeries && !isSeriesHidden("value2") && (
                  <Line
                    type="monotone"
                    dataKey="value2"
                    name={legendLabels[1]}
                    stroke={CHART_COLORS[1]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS[1], cursor: "pointer" }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
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
                  onClick={handlePieClick}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) =>
                    `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "var(--color-text-muted)" }}
                  style={{ cursor: "pointer" }}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      opacity={getItemOpacity(index)}
                      style={{ transition: "opacity 0.2s ease" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend interactiva — click para toggle de series (bar/line) */}
      {type !== "pie" && (
        <ul className={styles.legendList}>
          <li
            className={`${styles.legendItem} ${isSeriesHidden("value") ? styles.legendItemHidden : ""}`}
            onClick={() => toggleSeries("value")}
          >
            <span
              className={styles.legendDot}
              style={{
                background: isSeriesHidden("value")
                  ? "var(--color-text-muted)"
                  : CHART_COLORS[0],
              }}
            />
            {legendLabels[0]}
          </li>
          {hasSecondSeries && (
            <li
              className={`${styles.legendItem} ${isSeriesHidden("value2") ? styles.legendItemHidden : ""}`}
              onClick={() => toggleSeries("value2")}
            >
              <span
                className={styles.legendDot}
                style={{
                  background: isSeriesHidden("value2")
                    ? "var(--color-text-muted)"
                    : CHART_COLORS[1],
                }}
              />
              {legendLabels[1]}
            </li>
          )}
        </ul>
      )}

      {/* Legend informativa para pie (no toggle) */}
      {type === "pie" && (
        <ul className={styles.legendList}>
          {chartData.map((item, index) => (
            <li key={index} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{
                  background: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              {item.name}
            </li>
          ))}
        </ul>
      )}

      {/* Panel de detalle al hacer click */}
      {selectedIndex !== null && (
        <DetailPanel
          data={chartData}
          index={selectedIndex}
          legendLabels={legendLabels}
          hasSecondSeries={hasSecondSeries}
          type={type}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}
