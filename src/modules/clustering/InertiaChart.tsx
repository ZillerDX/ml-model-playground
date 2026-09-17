import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { formatMetric } from '../../utils/mathHelpers';
import { Layers, Activity } from 'lucide-react';

interface InertiaChartProps {
  history: { step: number; inertia: number }[];
  converged: boolean;
}

export const InertiaChart: React.FC<InertiaChartProps> = ({ history, converged }) => {
  const theme = usePlaygroundStore((s) => s.theme);
  const isDark = theme === 'dark';
  const width = 340;
  const height = 130;
  const margin = { top: 12, right: 16, bottom: 24, left: 42 };

  const latestInertia = history[history.length - 1]?.inertia;

  const { pathInertia, xScale, yScale } = useMemo(() => {
    if (history.length === 0) {
      return { pathInertia: '', xScale: null, yScale: null };
    }

    const xExtent = d3.extent(history, (d) => d.step) as [number, number];
    const xSc = d3
      .scaleLinear()
      .domain([0, Math.max(5, xExtent[1] || 5)])
      .range([margin.left, width - margin.right]);

    const yExtent = d3.extent(history, (d) => d.inertia) as [number, number];
    const yMax = Math.max(1, yExtent[1] || 10);
    const ySc = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top])
      .nice();

    const lineGen = d3
      .line<{ step: number; inertia: number }>()
      .x((d) => xSc(d.step))
      .y((d) => ySc(d.inertia))
      .curve(d3.curveMonotoneX);

    return {
      pathInertia: lineGen(history) || '',
      xScale: xSc,
      yScale: ySc,
    };
  }, [history, width, height, margin]);

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl p-3.5 gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-accent-coral" />
          <span className="text-xs font-semibold text-ink-primary tracking-wide uppercase">
            Inertia (WCSS)
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-accent-coral font-medium">
          {converged ? 'Stabilized' : 'Iterating'}
        </span>
      </div>

      <div className="flex items-center justify-between px-3 py-1 bg-ground/60 border border-border/60 rounded-lg text-xs">
        <span className="text-ink-muted text-[11px]">Sum of Squared Distances:</span>
        <span className="font-mono tabular-nums font-semibold text-ink-primary">
          {formatMetric(latestInertia, 2)}
        </span>
      </div>

      <div className="w-full relative h-[130px] flex items-center justify-center">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-ink-muted text-xs gap-1">
            <Activity size={20} className="opacity-40" />
            <span>Ready. Click Step Centroids or Auto-Run.</span>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Horizontal Grid */}
            {yScale &&
              yScale.ticks(3).map((tick) => (
                <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    stroke={isDark ? '#1D3B60' : '#E8EEF6'}
                    strokeDasharray="2,2"
                  />
                  <text
                    x={margin.left - 5}
                    y={3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-ink-muted select-none tabular-nums"
                  >
                    {tick.toFixed(0)}
                  </text>
                </g>
              ))}

            {/* X-axis Ticks */}
            {xScale &&
              xScale.ticks(4).map((tick) => (
                <g key={tick} transform={`translate(${xScale(tick)}, ${height - margin.bottom})`}>
                  <line y1={0} y2={4} stroke={isDark ? '#264B7A' : '#C2D2E6'} />
                  <text
                    y={13}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-ink-muted select-none tabular-nums"
                  >
                    {tick}
                  </text>
                </g>
              ))}

            {/* Inertia Path */}
            {pathInertia && (
              <path
                d={pathInertia}
                fill="none"
                stroke={isDark ? '#5B8EC9' : '#3F72AF'}
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
};
