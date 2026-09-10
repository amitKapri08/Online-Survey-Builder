import { useId } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data?: number[];
  color?: "emerald" | "brand" | "sky" | "amber" | "slate";
  trend?: "up" | "down" | "neutral";
  className?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "emerald",
  trend = "up",
  className,
  width = 72,
  height = 28,
}: SparklineProps) {
  const gradientId = useId();

  // If no custom data is provided, use aesthetically pleasing trend presets
  const points =
    data && data.length >= 3
      ? data
      : trend === "up"
        ? [4, 8, 7, 12, 11, 16, 15, 22]
        : trend === "down"
          ? [20, 18, 19, 14, 15, 9, 11, 6]
          : [12, 14, 11, 15, 13, 16, 14, 15];

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  // Map data array to (x, y) coordinates
  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  // Generate smooth cubic bezier SVG path
  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0]!.x} ${coords[0]!.y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i]!;
      const p1 = coords[i + 1]!;
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path for subtle gradient fill under the line
  const lastCoord = coords[coords.length - 1];
  const firstCoord = coords[0];
  const areaD =
    lastCoord && firstCoord
      ? `${pathD} L ${lastCoord.x} ${height} L ${firstCoord.x} ${height} Z`
      : "";

  const colorStyles = {
    emerald: {
      stroke: "stroke-emerald-500 dark:stroke-emerald-400",
      stopStart: "rgba(16, 185, 129, 0.28)",
      stopEnd: "rgba(16, 185, 129, 0.0)",
    },
    brand: {
      stroke: "stroke-brand-600 dark:stroke-brand-400",
      stopStart: "rgba(99, 102, 241, 0.28)",
      stopEnd: "rgba(99, 102, 241, 0.0)",
    },
    sky: {
      stroke: "stroke-sky-500 dark:stroke-sky-400",
      stopStart: "rgba(14, 165, 233, 0.28)",
      stopEnd: "rgba(14, 165, 233, 0.0)",
    },
    amber: {
      stroke: "stroke-amber-500 dark:stroke-amber-400",
      stopStart: "rgba(245, 158, 11, 0.28)",
      stopEnd: "rgba(245, 158, 11, 0.0)",
    },
    slate: {
      stroke: "stroke-slate-400 dark:stroke-slate-500",
      stopStart: "rgba(148, 163, 184, 0.28)",
      stopEnd: "rgba(148, 163, 184, 0.0)",
    },
  };

  const selectedColor = colorStyles[color];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={selectedColor.stopStart} />
          <stop offset="100%" stopColor={selectedColor.stopEnd} />
        </linearGradient>
      </defs>
      {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={selectedColor.stroke}
        />
      )}
    </svg>
  );
}
