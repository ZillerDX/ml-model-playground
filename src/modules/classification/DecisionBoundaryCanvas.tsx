import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useClassificationStore } from '../../store/useClassificationStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { CircleDot } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';

export const DecisionBoundaryCanvas: React.FC = () => {
  const { theme, locale } = usePlaygroundStore();
  const t = getTranslation(locale);
  const isDark = theme === 'dark';

  const {
    dataset,
    boundaryGrid,
    gridResolution,
    activeClassToDraw,
    setActiveClassToDraw,
    addPoint,
    isRunning,
  } = useClassificationStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 580;
  const height = 440;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const xDomain = [-3.5, 3.5];
  const yDomain = [-3.5, 3.5];

  const xScale = useMemo(() => {
    return d3.scaleLinear().domain(xDomain).range([margin.left, width - margin.right]);
  }, [width, margin.left, margin.right]);

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]);
  }, [height, margin.top, margin.bottom]);

  // Render Decision Boundary Heatmap onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (boundaryGrid && boundaryGrid.length > 0) {
      const res = gridResolution;
      const cellW = (width - margin.left - margin.right) / res;
      const cellH = (height - margin.top - margin.bottom) / res;

      // Draw probability heatmap cells using palette colors (#3F72AF and #E25B45)
      for (let r = 0; r < res; r++) {
        for (let c = 0; c < res; c++) {
          const prob = boundaryGrid[r]?.[c] ?? 0.5;
          const px = margin.left + c * cellW;
          const py = margin.top + r * cellH;

          let fill = '';
          if (prob < 0.5) {
            // Class 0: Vibrant Blue (#3F72AF -> rgb(63, 114, 175))
            const intensity = (0.5 - prob) * 2;
            fill = `rgba(63, 114, 175, ${0.15 + intensity * 0.55})`;
          } else {
            // Class 1: Coral (#E25B45 -> rgb(226, 91, 69))
            const intensity = (prob - 0.5) * 2;
            fill = `rgba(226, 91, 69, ${0.15 + intensity * 0.55})`;
          }

          ctx.fillStyle = fill;
          ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
        }
      }

      // Draw decision boundary contour
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#F9F7F7' : '#112D4E';
      ctx.setLineDash([4, 4]);
    } else {
      ctx.fillStyle = isDark ? '#091526' : '#FFFFFF';
      ctx.fillRect(margin.left, margin.top, width - margin.left - margin.right, height - margin.top - margin.bottom);
    }
  }, [boundaryGrid, gridResolution, width, height, margin, isDark]);

  // Click to add point with active class
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-xl select-none transition-colors duration-200">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <CircleDot size={14} className="text-accent-blue shrink-0" />
          <span className="text-ink-secondary whitespace-nowrap">{t.common.placeSamplesHint}</span>
          {/* Class Switcher */}
          <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setActiveClassToDraw(0)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                activeClassToDraw === 0
                  ? 'bg-accent-blue text-white shadow-sm font-semibold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-accent-ice"></span>
              {t.common.classA}
            </button>
            <button
              type="button"
              onClick={() => setActiveClassToDraw(1)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                activeClassToDraw === 1
                  ? 'bg-accent-coral text-white shadow-sm font-semibold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#fca5a5]"></span>
              {t.common.classB}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-ink-muted text-[11px] whitespace-nowrap">
            {dataset.length} {t.common.pointsCount}
          </span>
        </div>
      </div>

      {/* Canvas & Overlay Container */}
      <div
        className={`relative w-full flex items-center justify-center p-2 cursor-crosshair transition-colors duration-200 ${
          isDark ? 'bg-[#091526]' : 'bg-[#FFFFFF]'
        }`}
        onClick={handleCanvasClick}
      >
        <div className="relative w-full max-w-[620px]" style={{ aspectRatio: `${width}/${height}` }}>
          {/* Bottom Canvas for Decision Boundary */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-full rounded-lg border border-border"
          />

          {/* Top SVG for Data Points */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Axis Crosshair lines */}
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke={isDark ? '#264B7A' : '#C2D2E6'}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <line
              x1={xScale(0)}
              x2={xScale(0)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke={isDark ? '#264B7A' : '#C2D2E6'}
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Points */}
            {dataset.map((pt) => {
              const cx = xScale(pt.x);
              const cy = yScale(pt.y);
              const isClassZero = pt.label === 0;

              return (
                <g key={pt.id}>
                  {/* Outer ring for noisy/outlier points */}
                  {pt.isOutlier && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill="none"
                      stroke={isDark ? '#F9F7F7' : '#112D4E'}
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                      opacity="0.85"
                    />
                  )}
                  {/* Point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={isClassZero ? '#3F72AF' : '#E25B45'}
                    stroke={isDark ? '#0B192C' : '#FFFFFF'}
                    strokeWidth="1.5"
                    className="transition-transform duration-150"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
