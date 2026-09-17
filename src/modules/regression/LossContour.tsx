import React, { useMemo } from 'react';
import { useRegressionStore } from '../../store/useRegressionStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { getTranslation } from '../../utils/i18n';
import { Target, Compass } from 'lucide-react';

export const LossContour: React.FC = () => {
  const { dataset, weightTrajectory, weights } = useRegressionStore();
  const { locale } = usePlaygroundStore();
  const t = getTranslation(locale);

  // Compute analytical OLS global minimum (w*, b*)
  const analyticalMinimum = useMemo(() => {
    if (dataset.length < 2) return { w: 0, b: 0, minLoss: 0, varX: 1, meanX: 0 };

    const n = dataset.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (const p of dataset) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    const denom = sumX2 - n * meanX * meanX;
    const wStar = Math.abs(denom) > 1e-6 ? (sumXY - n * meanX * meanY) / denom : 0;
    const bStar = meanY - wStar * meanX;

    // Minimum loss at (w*, b*)
    let minLoss = 0;
    for (const p of dataset) {
      const pred = wStar * p.x + bStar;
      minLoss += Math.pow(p.y - pred, 2);
    }
    minLoss /= n;

    const varX = (sumX2 / n) - (meanX * meanX) || 1;

    return {
      w: Number(wStar.toFixed(3)),
      b: Number(bStar.toFixed(3)),
      minLoss: Number(minLoss.toFixed(4)),
      varX,
      meanX,
    };
  }, [dataset]);

  // View bounds in (w, b) space
  const centerW = analyticalMinimum.w;
  const centerB = analyticalMinimum.b;
  const range = 3.2; // span around center

  const minW = centerW - range;
  const maxW = centerW + range;
  const minB = centerB - range;
  const maxB = centerB + range;

  // SVG coordinate transformation
  const width = 480;
  const height = 260;
  const pad = 36;

  const scaleW = (w: number) => pad + ((w - minW) / (maxW - minW)) * (width - 2 * pad);
  const scaleB = (b: number) => height - pad - ((b - minB) / (maxB - minB)) * (height - 2 * pad);

  // Generate elliptical contour rings around (w*, b*)
  // Loss quadratic form: L(w, b) approx (w - w*)^2 * (x^2) + 2(w - w*)(b - b*)*x_mean + (b - b*)^2
  const contourEllipses = useMemo(() => {
    const rings = [];
    const ellipseLevels = [0.4, 0.8, 1.3, 1.9, 2.6, 3.4];
    const meanX = analyticalMinimum.meanX;
    const angleRad = Math.atan2(2 * meanX, analyticalMinimum.varX - 1) / 2;
    const angleDeg = (angleRad * 180) / Math.PI;

    const cx = scaleW(analyticalMinimum.w);
    const cy = scaleB(analyticalMinimum.b);

    for (let i = 0; i < ellipseLevels.length; i++) {
      const r = ellipseLevels[i];
      // Radii mapped to SVG pixel scale
      const rx = (r / range) * (width * 0.38);
      const ry = (r / range) * (height * 0.44);

      rings.push({
        rx: Math.max(8, rx),
        ry: Math.max(5, ry),
        cx,
        cy,
        rotation: angleDeg,
        level: i + 1,
      });
    }
    return rings;
  }, [analyticalMinimum, minW, maxW, minB, maxB]);

  // Current weight position
  const currentW = weights?.weights?.[0];
  const currentB = weights?.bias;

  // Map trajectory points into SVG coordinates
  const trajectoryPoints = useMemo(() => {
    return weightTrajectory
      .filter((pt) => !isNaN(pt.w) && !isNaN(pt.b))
      .map((pt) => `${scaleW(pt.w)},${scaleB(pt.b)}`)
      .join(' ');
  }, [weightTrajectory, minW, maxW, minB, maxB]);

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl p-4 gap-3 shadow-lg relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="text-accent-blue" size={17} />
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            {t.regression.contourTitle}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-ink-muted">
            <span className="w-2 h-2 rounded-full bg-accent-blue inline-block animate-pulse" />
            w: <strong className="text-ink-primary">{currentW !== undefined ? currentW.toFixed(3) : '0.000'}</strong>
          </span>
          <span className="flex items-center gap-1 text-ink-muted">
            b: <strong className="text-ink-primary">{currentB !== undefined ? currentB.toFixed(3) : '0.000'}</strong>
          </span>
        </div>
      </div>

      <p className="text-[11px] text-ink-muted leading-relaxed">
        {t.regression.contourDesc}
      </p>

      {/* SVG Contour Canvas */}
      <div className="relative w-full h-[260px] bg-ground rounded-xl border border-border overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for Trajectory Path */}
            <linearGradient id="trajGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3F72AF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3F72AF" stopOpacity="1" />
            </linearGradient>

            {/* Radial glow for current weight ball */}
            <radialGradient id="weightBallGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3F72AF" stopOpacity="1" />
              <stop offset="100%" stopColor="#3F72AF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate Axes Grid */}
          <line
            x1={pad}
            y1={scaleB(0)}
            x2={width - pad}
            y2={scaleB(0)}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={scaleW(0)}
            y1={pad}
            x2={scaleW(0)}
            y2={height - pad}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Elliptical Loss Contour Rings */}
          {contourEllipses.map((e, idx) => (
            <ellipse
              key={idx}
              cx={e.cx}
              cy={e.cy}
              rx={e.rx}
              ry={e.ry}
              transform={`rotate(${e.rotation} ${e.cx} ${e.cy})`}
              fill="none"
              stroke="#3F72AF"
              strokeOpacity={0.12 + idx * 0.05}
              strokeWidth="1.2"
            />
          ))}

          {/* Global OLS Theoretical Minimum (Target Crosshair) */}
          <g transform={`translate(${scaleW(analyticalMinimum.w)}, ${scaleB(analyticalMinimum.b)})`}>
            <circle r="4" fill="none" stroke="#E25B45" strokeWidth="1.5" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#E25B45" strokeWidth="1.2" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#E25B45" strokeWidth="1.2" />
          </g>

          {/* Optimization Trajectory Path */}
          {trajectoryPoints && (
            <polyline
              points={trajectoryPoints}
              fill="none"
              stroke="url(#trajGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Historical Breadcrumb Dots */}
          {weightTrajectory.slice(-25).map((pt, i) => (
            <circle
              key={i}
              cx={scaleW(pt.w)}
              cy={scaleB(pt.b)}
              r="2"
              fill="#3F72AF"
              opacity={0.3 + (i / 25) * 0.7}
            />
          ))}

          {/* Current Dynamic Position Ball */}
          {currentW !== undefined && currentB !== undefined && !isNaN(currentW) && !isNaN(currentB) && (
            <g transform={`translate(${scaleW(currentW)}, ${scaleB(currentB)})`}>
              {/* Outer Glow Halo */}
              <circle r="14" fill="url(#weightBallGlow)" opacity="0.4" />
              {/* Inner Solid Core */}
              <circle r="5" fill="#3F72AF" stroke="#FFFFFF" strokeWidth="1.5" className="shadow-lg" />
            </g>
          )}

          {/* Axis Labels */}
          <text
            x={width - pad + 6}
            y={scaleB(0) + 3}
            className="text-[10px] font-mono fill-ink-muted"
          >
            w
          </text>
          <text
            x={scaleW(0) - 3}
            y={pad - 8}
            textAnchor="middle"
            className="text-[10px] font-mono fill-ink-muted"
          >
            b
          </text>
        </svg>

        {/* Legend Badge Overlay */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-3 bg-surface/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-medium text-ink-muted shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-accent-blue inline-block rounded" />
            <span>{t.regression.contourLegendPath}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={11} className="text-[#E25B45]" />
            <span>{t.regression.contourLegendMin} (w*={analyticalMinimum.w}, b*={analyticalMinimum.b})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
