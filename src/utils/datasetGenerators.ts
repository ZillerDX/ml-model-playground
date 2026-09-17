import { DataPoint2D } from '../types/playground';

let pointCounter = 0;
function nextId(): string {
  pointCounter += 1;
  return `pt_${pointCounter}_${Date.now()}`;
}

// Deterministic pseudo-random with seedable option if needed
function gaussianRandom(mean = 0, stdev = 1): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

// REGRESSION DATASETS
export function generateRegressionData(
  type: 'linear' | 'quadratic' | 'sine' | 'stock',
  count = 50,
  noise = 0.2
): DataPoint2D[] {
  const points: DataPoint2D[] = [];

  for (let i = 0; i < count; i++) {
    // x in range [-3, 3]
    const x = -3 + (6 * i) / (count - 1);
    let y = 0;

    switch (type) {
      case 'linear':
        y = 0.75 * x - 0.2;
        break;
      case 'quadratic':
        y = 0.45 * x * x - 1.6;
        break;
      case 'sine':
        y = 1.8 * Math.sin(1.2 * x);
        break;
      case 'stock':
        // Upward trending random walk shape with momentum dips
        y = 0.6 * x + 0.5 * Math.sin(2.5 * x) + 0.2 * Math.cos(5 * x);
        break;
    }

    y += gaussianRandom(0, noise);
    points.push({ id: nextId(), x, y });
  }

  return points;
}

// CLASSIFICATION DATASETS
export function generateClassificationData(
  type: 'circles' | 'moons' | 'spiral' | 'blobs',
  count = 120,
  noise = 0.1
): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  const nPerClass = Math.floor(count / 2);

  if (type === 'circles') {
    // Inner circle (Class 0, radius ~1.2)
    for (let i = 0; i < nPerClass; i++) {
      const angle = (2 * Math.PI * i) / nPerClass;
      const r = 1.1 + gaussianRandom(0, noise);
      points.push({
        id: nextId(),
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        label: 0,
      });
    }
    // Outer circle (Class 1, radius ~2.6)
    for (let i = 0; i < nPerClass; i++) {
      const angle = (2 * Math.PI * i) / nPerClass;
      const r = 2.5 + gaussianRandom(0, noise);
      points.push({
        id: nextId(),
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        label: 1,
      });
    }
  } else if (type === 'moons') {
    // Upper moon (Class 0)
    for (let i = 0; i < nPerClass; i++) {
      const angle = (Math.PI * i) / nPerClass;
      const x = 1.5 * Math.cos(angle) - 0.75 + gaussianRandom(0, noise);
      const y = 1.5 * Math.sin(angle) - 0.2 + gaussianRandom(0, noise);
      points.push({ id: nextId(), x, y, label: 0 });
    }
    // Lower moon (Class 1)
    for (let i = 0; i < nPerClass; i++) {
      const angle = (Math.PI * i) / nPerClass;
      const x = 1.5 - 1.5 * Math.cos(angle) - 0.75 + gaussianRandom(0, noise);
      const y = 0.5 - 1.5 * Math.sin(angle) + gaussianRandom(0, noise);
      points.push({ id: nextId(), x, y, label: 1 });
    }
  } else if (type === 'spiral') {
    // Intertwined spirals
    for (let label = 0; label < 2; label++) {
      for (let i = 0; i < nPerClass; i++) {
        const r = (i / nPerClass) * 2.8;
        const theta = (i / nPerClass) * 1.8 * Math.PI + (label * Math.PI);
        const x = r * Math.sin(theta) + gaussianRandom(0, noise * 0.7);
        const y = r * Math.cos(theta) + gaussianRandom(0, noise * 0.7);
        points.push({ id: nextId(), x, y, label });
      }
    }
  } else {
    // Blobs
    for (let i = 0; i < nPerClass; i++) {
      points.push({
        id: nextId(),
        x: -1.3 + gaussianRandom(0, 0.6 + noise),
        y: -1.2 + gaussianRandom(0, 0.6 + noise),
        label: 0,
      });
    }
    for (let i = 0; i < nPerClass; i++) {
      points.push({
        id: nextId(),
        x: 1.3 + gaussianRandom(0, 0.6 + noise),
        y: 1.2 + gaussianRandom(0, 0.6 + noise),
        label: 1,
      });
    }
  }

  return points;
}

// CLUSTERING DATASETS
export function generateClusteringData(
  type: 'gaussian_clusters' | 'anisotropic' | 'varied_density',
  count = 150
): DataPoint2D[] {
  const points: DataPoint2D[] = [];

  if (type === 'gaussian_clusters') {
    const centers = [
      { x: -2.0, y: -2.0 },
      { x: 1.8, y: 1.8 },
      { x: -1.5, y: 2.0 },
      { x: 2.2, y: -1.5 },
    ];
    const nPerCenter = Math.floor(count / centers.length);
    centers.forEach(c => {
      for (let i = 0; i < nPerCenter; i++) {
        points.push({
          id: nextId(),
          x: c.x + gaussianRandom(0, 0.45),
          y: c.y + gaussianRandom(0, 0.45),
        });
      }
    });
  } else if (type === 'anisotropic') {
    // Stretched elliptical clusters
    const nPerCluster = Math.floor(count / 3);
    for (let i = 0; i < nPerCluster; i++) {
      const u = gaussianRandom(0, 0.9);
      const v = gaussianRandom(0, 0.25);
      points.push({ id: nextId(), x: u - 1.5, y: 0.8 * u + v - 1 });
    }
    for (let i = 0; i < nPerCluster; i++) {
      const u = gaussianRandom(0, 0.9);
      const v = gaussianRandom(0, 0.25);
      points.push({ id: nextId(), x: u + 1.2, y: -0.8 * u + v + 1 });
    }
    for (let i = 0; i < nPerCluster; i++) {
      const u = gaussianRandom(0, 0.5);
      const v = gaussianRandom(0, 0.5);
      points.push({ id: nextId(), x: u, y: v + 2.2 });
    }
  } else {
    // Varied density
    for (let i = 0; i < Math.floor(count * 0.5); i++) {
      points.push({
        id: nextId(),
        x: -1.5 + gaussianRandom(0, 0.25),
        y: -1.2 + gaussianRandom(0, 0.25),
      });
    }
    for (let i = 0; i < Math.floor(count * 0.3); i++) {
      points.push({
        id: nextId(),
        x: 1.5 + gaussianRandom(0, 0.65),
        y: 1.3 + gaussianRandom(0, 0.65),
      });
    }
    for (let i = 0; i < Math.floor(count * 0.2); i++) {
      points.push({
        id: nextId(),
        x: 0 + gaussianRandom(0, 1.1),
        y: -2 + gaussianRandom(0, 1.1),
      });
    }
  }

  return points;
}

// INJECT NOISE & OUTLIERS
export function injectRegressionOutlier(points: DataPoint2D[]): DataPoint2D[] {
  // Inject 2 extreme high-leverage outliers
  const copy = [...points];
  const outlier1: DataPoint2D = {
    id: nextId(),
    x: 2.5 + (Math.random() - 0.5),
    y: -3.8 + (Math.random() - 0.5),
    isOutlier: true,
  };
  const outlier2: DataPoint2D = {
    id: nextId(),
    x: -2.4 + (Math.random() - 0.5),
    y: 3.6 + (Math.random() - 0.5),
    isOutlier: true,
  };
  return [...copy, outlier1, outlier2];
}

export function injectClassificationNoise(points: DataPoint2D[], ratio = 0.15): DataPoint2D[] {
  return points.map(pt => {
    if (Math.random() < ratio) {
      return {
        ...pt,
        label: pt.label === 0 ? 1 : 0, // Invert class label
        isOutlier: true,
      };
    }
    return pt;
  });
}

export function injectClusteringOutliers(points: DataPoint2D[], count = 6): DataPoint2D[] {
  const outliers: DataPoint2D[] = [];
  for (let i = 0; i < count; i++) {
    outliers.push({
      id: nextId(),
      x: (Math.random() - 0.5) * 6.5,
      y: (Math.random() - 0.5) * 6.5,
      isOutlier: true,
    });
  }
  return [...points, ...outliers];
}

// -------------------------------------------------------------
// STATISTICAL OUTLIER DETECTION & FILTERING (IQR & Z-Score)
// -------------------------------------------------------------
export function detectOutliers(points: DataPoint2D[]): Set<string> {
  const outlierIds = new Set<string>();
  if (points.length < 4) return outlierIds;

  // 1. Explicitly tagged outliers from injection
  points.forEach(p => {
    if (p.isOutlier) {
      outlierIds.add(p.id);
    }
  });

  // 2. Statistical IQR Rule along Y
  const sortedY = [...points].map(p => p.y).sort((a, b) => a - b);
  const q1Index = Math.floor(sortedY.length * 0.25);
  const q3Index = Math.floor(sortedY.length * 0.75);
  const q1 = sortedY[q1Index];
  const q3 = sortedY[q3Index];
  const iqr = q3 - q1;
  const lowerBoundY = q1 - 1.5 * iqr;
  const upperBoundY = q3 + 1.5 * iqr;

  // 3. Statistical Z-Score along distance from centroid / mean
  const meanX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
  const meanY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
  const varianceX = points.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0) / points.length;
  const varianceY = points.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0) / points.length;
  const stdX = Math.sqrt(varianceX) || 1;
  const stdY = Math.sqrt(varianceY) || 1;

  points.forEach(p => {
    const isYOutlier = p.y < lowerBoundY || p.y > upperBoundY;
    const zX = Math.abs(p.x - meanX) / stdX;
    const zY = Math.abs(p.y - meanY) / stdY;
    const isZScoreOutlier = zX > 2.6 || zY > 2.6;

    if (isYOutlier || isZScoreOutlier) {
      outlierIds.add(p.id);
    }
  });

  return outlierIds;
}

export function filterOutliers(points: DataPoint2D[]): { cleaned: DataPoint2D[]; removedCount: number } {
  const outlierIds = detectOutliers(points);
  const cleaned = points
    .filter(p => !outlierIds.has(p.id))
    .map(p => ({ ...p, isOutlier: false }));
  return {
    cleaned,
    removedCount: points.length - cleaned.length,
  };
}

// -------------------------------------------------------------
// CSV / TSV NUMERICAL DATA PARSER
// -------------------------------------------------------------
export function parseCSVData(csvText: string, autoScale = true): DataPoint2D[] {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText.trim().split(/\r?\n/);
  const rawPoints: { x: number; y: number; label?: number }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    // Split on comma, tab, semicolon, or consecutive whitespace
    const tokens = trimmed.split(/[\t,;]+/).map(t => t.trim());
    if (tokens.length < 2) continue;

    const xVal = parseFloat(tokens[0]);
    const yVal = parseFloat(tokens[1]);

    // Check if numbers are valid (skips header like "x,y")
    if (isNaN(xVal) || isNaN(yVal)) continue;

    let label: number | undefined;
    if (tokens.length >= 3) {
      const parsedLabel = parseInt(tokens[2], 10);
      if (!isNaN(parsedLabel) && (parsedLabel === 0 || parsedLabel === 1)) {
        label = parsedLabel;
      }
    }

    rawPoints.push({ x: xVal, y: yVal, label });
  }

  if (rawPoints.length === 0) return [];

  // Optional coordinate auto-scaling to canvas bounds [-2.8, 2.8]
  if (autoScale && rawPoints.length > 1) {
    const minX = Math.min(...rawPoints.map(p => p.x));
    const maxX = Math.max(...rawPoints.map(p => p.x));
    const minY = Math.min(...rawPoints.map(p => p.y));
    const maxY = Math.max(...rawPoints.map(p => p.y));

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    return rawPoints.map(p => ({
      id: nextId(),
      x: Number((((p.x - midX) / (spanX / 2)) * 2.6).toFixed(3)),
      y: Number((((p.y - midY) / (spanY / 2)) * 2.6).toFixed(3)),
      label: p.label,
    }));
  }

  return rawPoints.map(p => ({
    id: nextId(),
    x: Number(p.x.toFixed(3)),
    y: Number(p.y.toFixed(3)),
    label: p.label,
  }));
}
