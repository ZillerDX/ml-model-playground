import React, { useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useRegressionStore } from '../../store/useRegressionStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { Move, Eye, EyeOff } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';

export const RegressionCanvas: React.FC = () => {
  const { theme, locale } = usePlaygroundStore();
  const t = getTranslation(locale);
  const isDark = theme === 'dark';

  const {
    dataset,
    fittedCurve,
    showResiduals,
    toggleResiduals,
    addPoint,
    setDataset,
    isRunning,
  } = useRegressionStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  const width = 580;
  const height = 440;
  const margin = { top: 24, right: 24, bottom: 36, left: 44 };

  const xDomain = [-3.8, 3.8];
  const yDomain = [-4.5, 4.5];

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);
  }, [width, margin.left, margin.right]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top]);
  }, [height, margin.top, margin.bottom]);

  // Fitted curve path
  const curvePath = useMemo(() => {
    if (fittedCurve.length === 0) return '';
    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(Math.max(-4.5, Math.min(4.5, d.y))))
      .curve(d3.curveMonotoneX);
    return lineGen(fittedCurve) || '';
  }, [fittedCurve, xScale, yScale]);

  // Handle canvas click to add point
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRunning || draggedPointId) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check bounds
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

  // Handle drag point
  const handlePointMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) return;
    setDraggedPointId(id);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const curX = moveEvent.clientX - rect.left;
      const curY = moveEvent.clientY - rect.top;

      const newX = Math.max(-3.5, Math.min(3.5, xScale.invert(curX)));
      const newY = Math.max(-4.2, Math.min(4.2, yScale.invert(curY)));

      const currentDataset = useRegressionStore.getState().dataset;
      const updated = currentDataset.map((pt) =>
        pt.id === id ? { ...pt, x: Number(newX.toFixed(3)), y: Number(newY.toFixed(3)) } : pt
      );
      setDataset(updated);
    };

    const handleMouseUp = () => {
      setDraggedPointId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-xl select-none">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle border-b border-border text-xs">
        <div className="flex items-center gap-2 text-ink-secondary">
          <Move size={14} className="text-accent-coral shrink-0" />
          <span>{t.common.dragPointHint}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleResiduals}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary transition-colors whitespace-nowrap"
          >
            {showResiduals ? <Eye size={14} className="text-accent-coral" /> : <EyeOff size={14} />}
            <span>{t.common.residuals}</span>
          </button>
          <span className="font-mono tabular-nums text-ink-muted text-[11px] whitespace-nowrap">
            {dataset.length} {t.common.samplesCount}
          </span>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className={`w-full flex items-center justify-center p-2 transition-colors duration-200 ${isDark ? 'bg-[#091526]' : 'bg-[#FFFFFF]'}`}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          onClick={handleSvgClick}
          className="w-full h-auto cursor-crosshair max-w-[620px]"
        >
          <defs>
            {/* Grid background pattern */}
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDark ? '#162E4D' : '#E8EEF6'} strokeWidth="1" />
            </pattern>
          </defs>

          {/* Plot Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="url(#grid-pattern)"
            stroke={isDark ? '#244771' : '#DBE2EF'}
            strokeWidth="1"
            rx="6"
          />

          {/* Axis Ticks and Grid lines */}
          {xScale.ticks(8).map((tick) => (
            <g key={`x-${tick}`} transform={`translate(${xScale(tick)}, 0)`}>
              <line
                y1={margin.top}
                y2={height - margin.bottom}
                stroke={isDark ? '#162E4D' : '#E8EEF6'}
                strokeDasharray="2,2"
              />
              <line y1={height - margin.bottom} y2={height - margin.bottom + 5} stroke={isDark ? '#264B7A' : '#C2D2E6'} />
              <text
                y={height - margin.bottom + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-ink-muted tabular-nums"
              >
                {tick}
              </text>
            </g>
          ))}

          {yScale.ticks(8).map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                stroke={isDark ? '#162E4D' : '#E8EEF6'}
                strokeDasharray="2,2"
              />
              <line x1={margin.left - 5} x2={margin.left} stroke={isDark ? '#264B7A' : '#C2D2E6'} />
              <text
                x={margin.left - 8}
                y={3}
                textAnchor="end"
                className="text-[10px] font-mono fill-ink-muted tabular-nums"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Zero axes */}
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke={isDark ? '#3F72AF' : '#8CA5C4'}
            strokeWidth="1.5"
          />
          <line
            x1={xScale(0)}
            x2={xScale(0)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke={isDark ? '#3F72AF' : '#8CA5C4'}
            strokeWidth="1.5"
          />

          {/* Residual Error Lines */}
          {showResiduals &&
            fittedCurve.length > 0 &&
            dataset.map((pt) => {
              const px = pt.x;
              const py = pt.y;
              let predY = py;

              for (let i = 0; i < fittedCurve.length - 1; i++) {
                if (px >= fittedCurve[i].x && px <= fittedCurve[i + 1].x) {
                  const t = (px - fittedCurve[i].x) / (fittedCurve[i + 1].x - fittedCurve[i].x);
                  predY = fittedCurve[i].y + t * (fittedCurve[i + 1].y - fittedCurve[i].y);
                  break;
                }
              }

              return (
                <line
                  key={`res-${pt.id}`}
                  x1={xScale(px)}
                  y1={yScale(py)}
                  x2={xScale(px)}
                  y2={yScale(Math.max(-4.5, Math.min(4.5, predY)))}
                  stroke={pt.isOutlier ? '#E25B45' : '#3F72AF'}
                  strokeWidth="1.25"
                  strokeDasharray="3,2"
                  opacity="0.75"
                />
              );
            })}

          {/* Fitted Curve */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke={isDark ? '#5B8EC9' : '#3F72AF'}
              strokeWidth="2.75"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_rgba(63,114,175,0.45)]"
            />
          )}

          {/* Data Points */}
          {dataset.map((pt) => {
            const cx = xScale(pt.x);
            const cy = yScale(pt.y);
            const isDragging = draggedPointId === pt.id;

            return (
              <g
                key={pt.id}
                onMouseDown={(e) => handlePointMouseDown(pt.id, e)}
                className="cursor-grab active:cursor-grabbing group"
              >
                {/* Outlier Halo */}
                {pt.isOutlier && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill="none"
                    stroke="#E25B45"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                    className="animate-spin origin-center"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                )}

                {/* Point dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isDragging ? 6.5 : 5}
                  fill={pt.isOutlier ? '#E25B45' : '#3F72AF'}
                  stroke={isDark ? '#0B192C' : '#FFFFFF'}
                  strokeWidth="2"
                  className="transition-transform duration-100 group-hover:scale-125"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
