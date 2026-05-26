'use client';

import { useState } from 'react';

interface MonthlyPoint {
  label: string; // "ene", "feb", ...
  year: number;
  month: number;
  total: number;
  paid: number;
  pending: number;
}

interface Props {
  data: MonthlyPoint[];
}

export function IncomeChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.total), 1);
  const height = 180;
  const width = 720;
  const padding = { top: 24, right: 16, bottom: 32, left: 56 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barW = innerWidth / data.length;
  const barGap = barW * 0.25;

  const formatCOP = (v: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
      notation: max > 10_000_000 ? 'compact' : 'standard',
    }).format(v);

  const gridLines = 4;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Ingresos por mes últimos 12 meses"
      >
        {/* Y-axis grid + labels */}
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = padding.top + (innerHeight / gridLines) * i;
          const value = max - (max / gridLines) * i;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerWidth}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={i === gridLines ? '0' : '2 4'}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                fontSize="10"
                textAnchor="end"
                fill="#94a3b8"
                fontFamily="var(--font-mono)"
              >
                {value > 0 ? formatCOP(value) : ''}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + i * barW + barGap / 2;
          const w = barW - barGap;
          const paidH = (d.paid / max) * innerHeight;
          const pendingH = (d.pending / max) * innerHeight;
          const isHover = hover === i;
          return (
            <g
              key={`${d.year}-${d.month}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hover background */}
              {isHover && (
                <rect
                  x={padding.left + i * barW}
                  y={padding.top}
                  width={barW}
                  height={innerHeight}
                  fill="#eef2ff"
                  opacity="0.5"
                />
              )}
              {/* Pending (amber) on top */}
              <rect
                x={x}
                y={padding.top + innerHeight - paidH - pendingH}
                width={w}
                height={pendingH}
                fill="#fbbf24"
                rx="2"
              />
              {/* Paid (indigo) at bottom */}
              <rect
                x={x}
                y={padding.top + innerHeight - paidH}
                width={w}
                height={paidH}
                fill="url(#barGradient)"
                rx="2"
              />
              {/* X axis label */}
              <text
                x={x + w / 2}
                y={height - 14}
                fontSize="10"
                textAnchor="middle"
                fill={isHover ? '#4f46e5' : '#64748b'}
                fontWeight={isHover ? '600' : '500'}
              >
                {d.label}
              </text>
              {/* Year label en enero */}
              {d.month === 1 && (
                <text
                  x={x + w / 2}
                  y={height - 2}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontFamily="var(--font-mono)"
                >
                  {d.year}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${((padding.left + hover * barW + barW / 2) / width) * 100}%`,
            top: `${(padding.top / height) * 100}%`,
          }}
        >
          <p className="font-semibold text-slate-900">
            {data[hover].label} {data[hover].year}
          </p>
          <p className="mt-0.5 font-mono tabular-nums text-slate-600">
            Total: {formatCOP(data[hover].total)}
          </p>
          {data[hover].paid > 0 && (
            <p className="font-mono tabular-nums text-indigo-700">
              Pagado: {formatCOP(data[hover].paid)}
            </p>
          )}
          {data[hover].pending > 0 && (
            <p className="font-mono tabular-nums text-amber-700">
              Pendiente: {formatCOP(data[hover].pending)}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
          Pagado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          Pendiente
        </span>
      </div>
    </div>
  );
}
