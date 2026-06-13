"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassCard, SectionLabel, A } from "@/components/app/ui";
import { TrendingUp } from "lucide-react";

const BLENDED_APY = 0.043; // 4.3% blended

const PERIODS = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "3Y", months: 36 },
  { label: "5Y", months: 60 },
] as const;

function buildPoints(principal: number, months: number) {
  return Array.from({ length: months + 1 }, (_, i) => ({
    i,
    value: principal * Math.pow(1 + BLENDED_APY / 12, i),
  }));
}

function fmtVal(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}k`;
  return `$${n.toFixed(2)}`;
}

function fmtMonth(i: number, months: number): string {
  if (i === 0) return "Now";
  if (months <= 12) return `${i}m`;
  const years = i / 12;
  if (Number.isInteger(years)) return `${years}yr`;
  return "";
}

interface TooltipState {
  x: number;
  y: number;
  value: number;
  month: number;
  svgX: number;
  svgY: number;
}

export function GrowthChart({ principal }: { principal: number }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[2]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const base = principal > 0 ? principal : 100;
  const points = buildPoints(base, period.months);

  const W = 800;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 36, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const minVal = points[0].value;
  const maxVal = points[points.length - 1].value;
  const valRange = maxVal - minVal || 1;

  const toX = (i: number) => PAD.left + (i / period.months) * innerW;
  const toY = (v: number) => PAD.top + (1 - (v - minVal) / valRange) * innerH;

  const linePath = points
    .map(({ i, value }, idx) => `${idx === 0 ? "M" : "L"}${toX(i).toFixed(2)},${toY(value).toFixed(2)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L${toX(period.months).toFixed(2)},${(PAD.top + innerH).toFixed(2)}` +
    ` L${toX(0).toFixed(2)},${(PAD.top + innerH).toFixed(2)} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // X-axis tick indices
  const xTickCount = period.months <= 12 ? period.months : period.months <= 36 ? Math.floor(period.months / 3) : Math.floor(period.months / 6);
  const xStep = period.months / xTickCount;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => Math.round(i * xStep));

  const gain = maxVal - base;
  const gainPct = ((gain / base) * 100).toFixed(2);

  // Hover handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const rawX = (e.clientX - rect.left) * scaleX;
      const clampedX = Math.max(PAD.left, Math.min(rawX, PAD.left + innerW));
      const frac = (clampedX - PAD.left) / innerW;
      const monthIdx = Math.round(frac * period.months);
      const clamped = Math.max(0, Math.min(monthIdx, period.months));
      const pt = points[clamped];
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: pt.value,
        month: clamped,
        svgX: toX(clamped),
        svgY: toY(pt.value),
      });
    },
    [points, period.months, innerW, PAD.left]
  );

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(194,138,30,0.12)", border: "1px solid rgba(194,138,30,0.28)" }}
          >
            <TrendingUp size={14} style={{ color: A.accent }} />
          </span>
          <div>
            <SectionLabel>Projected growth</SectionLabel>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Compound projection · blended {(BLENDED_APY * 100).toFixed(1)}% APY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">End value</p>
              <p className="text-[18px] font-light text-foreground leading-none">{fmtVal(maxVal)}</p>
            </div>
            <div
              className="px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(64,200,120,0.08)", border: "1px solid rgba(64,200,120,0.18)" }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "hsl(var(--positive))" }}>Gain</p>
              <p className="text-[14px] font-semibold leading-none" style={{ color: "hsl(var(--positive))" }}>
                +{gainPct}%
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: "rgba(20,20,30,0.05)", border: "1px solid rgba(20,20,30,0.07)" }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={
                  period.label === p.label
                    ? { background: A.accent, color: A.onAccent }
                    : { color: "rgba(20,20,30,0.45)" }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 200, overflow: "visible", cursor: "crosshair" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          aria-label="Portfolio growth projection chart"
        >
          <defs>
            <linearGradient id="gc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(194,138,30)" stopOpacity="0.22" />
              <stop offset="75%" stopColor="rgb(194,138,30)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="rgb(194,138,30)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gc-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(194,138,30,0.4)" />
              <stop offset="100%" stopColor="rgba(194,138,30,1)" />
            </linearGradient>
            <filter id="gc-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Y-axis grid lines + labels */}
          {yTicks.map((t) => {
            const y = PAD.top + (1 - t) * innerH;
            const val = minVal + t * valRange;
            return (
              <g key={t}>
                <line
                  x1={PAD.left} y1={y}
                  x2={PAD.left + innerW} y2={y}
                  stroke="rgba(20,20,30,0.06)"
                  strokeWidth="1"
                  strokeDasharray={t === 0 || t === 1 ? "0" : "4 4"}
                />
                <text
                  x={PAD.left - 8} y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="rgba(20,20,30,0.32)"
                  fontFamily="inherit"
                >
                  {fmtVal(val)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((m) => {
            const label = fmtMonth(m, period.months);
            if (!label) return null;
            return (
              <text
                key={m}
                x={toX(m)} y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(20,20,30,0.32)"
                fontFamily="inherit"
              >
                {label}
              </text>
            );
          })}

          {/* Area fill */}
          <motion.path
            key={`area-${period.label}`}
            d={areaPath}
            fill="url(#gc-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Line */}
          <motion.path
            key={`line-${period.label}`}
            d={linePath}
            fill="none"
            stroke="url(#gc-line)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#gc-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Tooltip crosshair */}
          {tooltip && (
            <g>
              <line
                x1={tooltip.svgX} y1={PAD.top}
                x2={tooltip.svgX} y2={PAD.top + innerH}
                stroke="rgba(194,138,30,0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={tooltip.svgX}
                cy={tooltip.svgY}
                r="5"
                fill={A.accent}
                stroke="white"
                strokeWidth="2"
                filter="url(#gc-glow)"
              />
            </g>
          )}

          {/* End dot (always visible) */}
          {!tooltip && (
            <circle
              cx={toX(period.months)}
              cy={toY(maxVal)}
              r="4.5"
              fill={A.accent}
              stroke="white"
              strokeWidth="2"
              filter="url(#gc-glow)"
            />
          )}
        </svg>

        {/* Floating tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl shadow-lg"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 36,
              background: "rgba(20,18,14,0.88)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(194,138,30,0.3)",
              transform: tooltip.x > (svgRef.current?.clientWidth ?? 0) * 0.72 ? "translateX(-110%)" : undefined,
            }}
          >
            <p className="text-[10px] text-amber-200/60 mb-0.5">
              {tooltip.month === 0 ? "Today" : `Month ${tooltip.month}`}
            </p>
            <p className="text-[14px] font-semibold text-white leading-none">{fmtVal(tooltip.value)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--positive))" }}>
              +{fmtVal(tooltip.value - base)}
            </p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground mt-4">
        Projected figures are estimates based on current APY rates and do not guarantee future returns.
      </p>
    </GlassCard>
  );
}
