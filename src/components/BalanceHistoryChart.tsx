import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface ChartPoint {
  date: string;
  balance: number;
}

interface BalanceHistoryChartProps {
  data: ChartPoint[];
  range: string;
  onRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  data,
  range,
  onRangeChange,
  isLoading = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  const ranges = [
    { label: '7 Days', value: '7D' },
    { label: '30 Days', value: '30D' },
    { label: '90 Days', value: '90D' },
    { label: '1 Year', value: '1Y' },
    { label: 'All Time (2021–2026)', value: 'ALL' },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[320px]">
        <Calendar className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">No balance history points available for selected range.</p>
      </div>
    );
  }

  const balances = data.map((d) => d.balance);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances);
  const padding = (maxBal - minBal) * 0.1 || 1000;
  const yMin = Math.max(0, minBal - padding);
  const yMax = maxBal + padding;

  const width = 800;
  const height = 260;
  const padLeft = 65;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const points = data.map((d, index) => {
    const x = padLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padTop + chartHeight - ((d.balance - yMin) / (yMax - yMin)) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

  // Y-axis tick values (4 steps)
  const yTicks = [yMin, yMin + (yMax - yMin) * 0.33, yMin + (yMax - yMin) * 0.66, yMax];

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const netChange = lastPoint.balance - firstPoint.balance;
  const percentChange = firstPoint.balance > 0 ? (netChange / firstPoint.balance) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Balance Trend & Ledger Activity</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#002855] border border-blue-100">
              Reconciled Daily
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-slate-500">Period Performance:</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                netChange >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${netChange < 0 ? 'rotate-180' : ''}`} />
              {netChange >= 0 ? '+' : ''}${Math.abs(netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({percentChange.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange(r.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                range === r.value
                  ? 'bg-[#002855] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-[#002855]">
              <div className="w-4 h-4 border-2 border-[#002855] border-t-transparent rounded-full animate-spin"></div>
              Calculating ledger curve...
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64 select-none">
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#002855" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#002855" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#002855" stopOpacity="0.0" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#002855" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grid lines and Y labels */}
          {yTicks.map((val, idx) => {
            const y = padTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#balanceGradient)" />

          {/* Stroke path */}
          <path
            d={pathD}
            fill="none"
            stroke="#002855"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X axis date labels */}
          {points.length > 1 && (
            <>
              <text
                x={padLeft}
                y={height - 8}
                textAnchor="start"
                fontSize="10"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[0].date}
              </text>
              <text
                x={padLeft + chartWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[Math.floor(points.length / 2)].date}
              </text>
              <text
                x={width - padRight}
                y={height - 8}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[points.length - 1].date}
              </text>
            </>
          )}

          {/* Hover indicator */}
          {hoveredPoint && (
            <g>
              {(() => {
                const pt = points.find((p) => p.date === hoveredPoint.date) || points[points.length - 1];
                return (
                  <>
                    <line
                      x1={pt.x}
                      y1={padTop}
                      x2={pt.x}
                      y2={padTop + chartHeight}
                      stroke="#002855"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#002855" stroke="#ffffff" strokeWidth="2.5" />
                  </>
                );
              })()}
            </g>
          )}

          {/* Invisible interactive overlay columns */}
          {points.map((pt, i) => {
            const colWidth = chartWidth / points.length;
            return (
              <rect
                key={i}
                x={pt.x - colWidth / 2}
                y={padTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Hover floating tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none border border-slate-700 flex items-center gap-3 animate-fade-in">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">{hoveredPoint.date}</p>
              <p className="text-sm font-bold text-white font-mono">
                ${hoveredPoint.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-1.5 h-6 bg-blue-400 rounded-full"></div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#002855]"></span>
          Authoritative balance reconciled against posted transactions
        </span>
        <span className="font-mono text-slate-400">USD Currency • FDIC Insured</span>
      </div>
    </div>
  );
};
