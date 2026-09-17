import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { EpochMetric } from '../../types/playground';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { formatMetric } from '../../utils/mathHelpers';
import { TrendingDown, AlertTriangle, BarChart2 } from 'lucide-react';

interface LossCurveProps {
  history: EpochMetric[];
  isDiverged?: boolean;
  title?: string;
  showAccuracy?: boolean;
}

export const LossCurve: React.FC<LossCurveProps> = ({
  history,
  isDiverged = false,
  title = 'Loss Curve (MSE / Objective)',
  showAccuracy = false,
}) => {
  const theme = usePlaygroundStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [useLogScale, setUseLogScale] = useState(false);

  const width = 340;
  const height = 140;
  const margin = { top: 12, right: 16, bottom: 24, left: 38 };

  const validData = useMemo(() => {
    return history.filter((d) => !isNaN(d.loss) && isFinite(d.loss));
  }, [history]);

  const latestMetric = history[history.length - 1];
  const minLoss = useMemo(() => {
    if (validData.length === 0) return 0;
    return Math.min(...validData.map((d) => d.loss));
  }, [validData]);

  const { pathLoss, pathAcc, xScale, yScale } = useMemo(() => {
    if (validData.length === 0) {
      return { pathLoss: '', pathAcc: '', xScale: null, yScale: null };
    }

    const xExtent = d3.extent(validData, (d) => d.epoch) as [number, number];
    const xSc = d3
      .scaleLinear()
      .domain([Math.max(1, xExtent[0] || 1), Math.max(10, xExtent[1] || 10)])
      .range([margin.left, width - margin.right]);

    const yExtent = d3.extent(validData, (d) => d.loss) as [number, number];
    const yMin = Math.max(1e-4, yExtent[0] || 0.01);
    const yMax = Math.max(yMin * 1.5, yExtent[1] || 1);

    const ySc = useLogScale
      ? d3.scaleLog().domain([yMin, yMax]).range([height - margin.bottom, margin.top]).nice()
      : d3.scaleLinear().domain([0, yMax * 1.1]).range([height - margin.bottom, margin.top]).nice();

    const lineLossGen = d3
      .line<EpochMetric>()
      .x((d) => xSc(d.epoch))
      .y((d) => ySc(d.loss))
      .curve(d3.curveMonotoneX);

    const yAccSc = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    const lineAccGen = d3
      .line<EpochMetric>()
      .x((d) => xSc(d.epoch))
      .y((d) => yAccSc(d.accuracy ?? 0))
      .curve(d3.curveMonotoneX);

    return {
      pathLoss: lineLossGen(validData) || '',
      pathAcc: showAccuracy ? lineAccGen(validData.filter((d) => d.accuracy !== undefined)) || '' : '',
      xScale: xSc,
      yScale: ySc,
    };
  }, [validData, useLogScale, showAccuracy]);

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl p-3.5 gap-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown size={15} className="text-accent-coral" />
          <span className="text-xs font-semibold text-ink-primary tracking-wide uppercase">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseLogScale(!useLogScale)}
            className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
              useLogScale
                ? 'bg-accent-coral/20 text-accent-coral border-accent-coral/40 font-medium'
                : 'text-ink-muted border-border hover:text-ink-primary'
            }`}
          >
            Log Scale
          </button>
        </div>
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-3 gap-2 py-1 px-2.5 bg-ground/60 border border-border/60 rounded-lg text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-ink-muted">Epoch</span>
          <span className="font-mono tabular-nums font-semibold text-ink-primary">
            {latestMetric?.epoch || 0}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-ink-muted">Current Loss</span>
          <span
            className={`font-mono tabular-nums font-semibold ${
              isDiverged ? 'text-accent-rose' : 'text-accent-coral'
            }`}
          >
            {isDiverged ? 'DIVERGED' : formatMetric(latestMetric?.loss, 4)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-ink-muted">
            {showAccuracy ? 'Accuracy' : 'Min Loss'}
          </span>
          <span className="font-mono tabular-nums font-semibold text-accent-blueLight">
            {showAccuracy
              ? `${((latestMetric?.accuracy ?? 0) * 100).toFixed(1)}%`
              : formatMetric(minLoss, 4)}
          </span>
        </div>
      </div>

      {/* Loss Warning Banner */}
      {isDiverged && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-accent-rose/15 border border-accent-rose/30 rounded-lg text-accent-rose text-xs animate-pulse">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span className="font-medium">
            Loss exploded! Learning rate too high for gradients.
          </span>
        </div>
      )}

      {/* SVG Plot */}
      <div className="w-full relative h-[140px] flex items-center justify-center">
        {validData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-ink-muted text-xs gap-1">
            <BarChart2 size={24} className="opacity-40" />
            <span>Ready to train. Press Start or Step.</span>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {yScale &&
              yScale.ticks(4).map((tick) => (
                <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    stroke={isDark ? '#1D3B60' : '#E8EEF6'}
                    strokeDasharray="2,2"
                  />
                  <text
                    x={margin.left - 4}
                    y={3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-ink-muted select-none tabular-nums"
                  >
                    {tick >= 100 ? tick.toFixed(0) : tick >= 1 ? tick.toFixed(1) : tick.toExponential(0)}
                  </text>
                </g>
              ))}

            {/* X-axis ticks */}
            {xScale &&
              xScale.ticks(4).map((tick) => (
                <g key={tick} transform={`translate(${xScale(tick)}, ${height - margin.bottom})`}>
                  <line y1={0} y2={4} stroke={isDark ? '#264B7A' : '#C2D2E6'} />
                  <text
                    y={14}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-ink-muted select-none tabular-nums"
                  >
                    {tick}
                  </text>
                </g>
              ))}

            {/* Loss Path (Ocean Blue from palette) */}
            {pathLoss && (
              <path
                d={pathLoss}
                fill="none"
                stroke={isDark ? '#5B8EC9' : '#3F72AF'}
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Accuracy Path if enabled */}
            {showAccuracy && pathAcc && (
              <path
                d={pathAcc}
                fill="none"
                stroke="#2EA44F"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="3,2"
              />
            )}
          </svg>
        )}
      </div>

      {showAccuracy && (
        <div className="flex items-center gap-4 text-[10px] text-ink-muted justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-accent-coral rounded-full"></span>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-accent-blue rounded-full"></span>
            <span>Accuracy</span>
          </div>
        </div>
      )}
    </div>
  );
};
