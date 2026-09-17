import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { useClusteringStore } from '../../store/useClusteringStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { Compass, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';

export const ClusteringCanvas: React.FC = () => {
  const { theme, locale } = usePlaygroundStore();
  const t = getTranslation(locale);
  const isDark = theme === 'dark';

  const { dataset, centroids, assignments, converged, step, addPoint, isRunning } =
    useClusteringStore();

  const width = 580;
  const height = 440;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const xDomain = [-3.8, 3.8];
  const yDomain = [-3.8, 3.8];

  const xScale = useMemo(() => {
    return d3.scaleLinear().domain(xDomain).range([margin.left, width - margin.right]);
  }, [width, margin.left, margin.right]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]);
  }, [height, margin.top, margin.bottom]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
      clickX < margin.left ||
      clickX > width - margin.right ||
      clickY < margin.top ||
      clickY > height - margin.bottom
    ) {
      return;
    }

    const dataX = xScale.invert(clickX);
    const dataY = yScale.invert(clickY);
    addPoint(Number(dataX.toFixed(3)), Number(dataY.toFixed(3)));
  };

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-lg select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/70 border-b border-border text-xs">
        <div className="flex items-center gap-2 text-ink-secondary">
          <Compass size={14} className="text-accent-blue shrink-0" />
          <span>{t.clustering.clusteringHint}</span>
        </div>
        <div className="flex items-center gap-3">
          {converged ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/30 whitespace-nowrap">
              <CheckCircle2 size={12} />
              {t.clustering.converged} ({t.common.step} {step})
            </span>
          ) : (
            <span className="font-mono tabular-nums text-ink-muted text-[11px] whitespace-nowrap">
              {t.common.iteration}: {step}
            </span>
          )}
          <span className="font-mono tabular-nums text-ink-muted text-[11px] whitespace-nowrap">
            {dataset.length} {t.common.samplesCount}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className={`w-full flex items-center justify-center p-2 transition-colors duration-200 ${isDark ? 'bg-[#091526]' : 'bg-[#FFFFFF]'}`}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair max-w-[620px]"
        >
          {/* Subtle Grid */}
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill={isDark ? '#091526' : '#FFFFFF'}
            stroke={isDark ? '#244771' : '#DBE2EF'}
            strokeWidth="1"
            rx="6"
          />

          {/* Crosshair Zero Axes */}
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke={isDark ? '#264B7A' : '#C2D2E6'}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <line
            x1={xScale(0)}
            x2={xScale(0)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke={isDark ? '#264B7A' : '#C2D2E6'}
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          {/* Centroid Movement Vectors / Trajectories */}
          {centroids.map((c) => {
            if (!c.history || c.history.length < 2) return null;
            const lineGen = d3
              .line<{ x: number; y: number }>()
              .x((d) => xScale(d.x))
              .y((d) => yScale(d.y));

            return (
              <g key={`traj_${c.id}`}>
                <path
                  d={lineGen(c.history) || ''}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  opacity="0.6"
                />
                {c.history.map((h, hIdx) => (
                  <circle
                    key={`hist_${c.id}_${hIdx}`}
                    cx={xScale(h.x)}
                    cy={yScale(h.y)}
                    r={2.5}
                    fill={c.color}
                    opacity="0.4"
                  />
                ))}
              </g>
            );
          })}

          {/* Data Points colored by cluster assignment */}
          {dataset.map((pt, idx) => {
            const clusterIdx = assignments[idx] ?? 0;
            const clusterColor = centroids[clusterIdx]?.color || '#64748b';
            const cx = xScale(pt.x);
            const cy = yScale(pt.y);

            return (
              <g key={pt.id}>
                {pt.isOutlier && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.25"
                    strokeDasharray="2,2"
                    opacity="0.75"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill={clusterColor}
                  stroke="#090d16"
                  strokeWidth="1.5"
                  opacity={0.85}
                  className="transition-colors duration-200"
                />
              </g>
            );
          })}

          {/* Centroids (Rendered with glowing pulse & diamond cross) */}
          {centroids.map((c) => {
            const cx = xScale(c.x);
            const cy = yScale(c.y);

            return (
              <g
                key={`cent_${c.id}`}
                className="transition-transform duration-300 ease-out"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Glow ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={15}
                  fill={c.color}
                  opacity="0.2"
                  className="animate-pulse"
                />

                {/* Outer Diamond */}
                <polygon
                  points={`${cx},${cy - 11} ${cx + 11},${cy} ${cx},${cy + 11} ${cx - 11},${cy}`}
                  fill={c.color}
                  stroke={isDark ? '#0B192C' : '#FFFFFF'}
                  strokeWidth="2.5"
                  className="shadow-xl filter drop-shadow-[0_0_8px_rgba(63,114,175,0.35)]"
                />

                {/* Center marker */}
                <circle cx={cx} cy={cy} r={3.5} fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
