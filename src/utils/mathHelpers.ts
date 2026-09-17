import { DataPoint2D } from '../types/playground';

/**
 * Normalizes an array of points to [-1, 1] range for numerical stability in gradient descent
 */
export function normalizePoints(
  points: DataPoint2D[],
  bounds = { minX: -5, maxX: 5, minY: -5, maxY: 5 }
): { x: number; y: number }[] {
  return points.map(p => ({
    x: ((p.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 2 - 1,
    y: ((p.y - bounds.minY) / (bounds.maxY - bounds.minY)) * 2 - 1,
  }));
}

/**
 * Expands 1D x feature into polynomial features [x, x^2, x^3, ..., x^degree]
 */
export function polynomialFeatures(xValues: number[], degree: number): number[][] {
  return xValues.map(x => {
    const features: number[] = [];
    for (let d = 1; d <= degree; d++) {
      features.push(Math.pow(x, d));
    }
    return features;
  });
}

/**
 * Calculates Mean Squared Error
 */
export function calculateMSE(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  let sum = 0;
  for (let i = 0; i < actual.length; i++) {
    const diff = actual[i] - predicted[i];
    sum += diff * diff;
  }
  return sum / actual.length;
}

/**
 * Calculates Binary Cross Entropy
 */
export function calculateBinaryCrossEntropy(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  const eps = 1e-7;
  let sum = 0;
  for (let i = 0; i < actual.length; i++) {
    const y = actual[i];
    const p = Math.max(eps, Math.min(1 - eps, predicted[i]));
    sum += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  }
  return sum / actual.length;
}

/**
 * Calculates within-cluster sum of squares (Inertia)
 */
export function calculateInertia(
  points: { x: number; y: number }[],
  centroids: { x: number; y: number }[],
  assignments: number[]
): number {
  let inertia = 0;
  for (let i = 0; i < points.length; i++) {
    const clusterIdx = assignments[i];
    const c = centroids[clusterIdx];
    if (c) {
      const dx = points[i].x - c.x;
      const dy = points[i].y - c.y;
      inertia += dx * dx + dy * dy;
    }
  }
  return inertia;
}

/**
 * Formats float numbers cleanly for tabular display
 */
export function formatMetric(val: number | undefined | null, decimals = 4): string {
  if (val === undefined || val === null || isNaN(val)) return 'NaN';
  if (!isFinite(val)) return '∞';
  return val.toFixed(decimals);
}
