import { describe, it, expect } from 'vitest';
import {
  generateRegressionData,
  generateClassificationData,
  generateClusteringData,
  injectRegressionOutlier,
  injectClassificationNoise,
  injectClusteringOutliers,
  filterOutliers,
  detectOutliers,
  parseCSVData,
} from './datasetGenerators';

describe('datasetGenerators', () => {
  it('generates regression dataset with expected sample count and finite values', () => {
    const data = generateRegressionData('linear', 30, 0.1);
    expect(data).toHaveLength(30);
    data.forEach((pt) => {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
      expect(pt.id).toBeDefined();
    });
  });

  it('generates classification dataset with balanced classes', () => {
    const data = generateClassificationData('circles', 60, 0.05);
    expect(data).toHaveLength(60);

    const class0 = data.filter((p) => p.label === 0);
    const class1 = data.filter((p) => p.label === 1);
    expect(class0.length).toBe(30);
    expect(class1.length).toBe(30);
  });

  it('generates clustering dataset with finite coordinates', () => {
    const data = generateClusteringData('gaussian_clusters', 80);
    expect(data.length).toBeGreaterThan(0);
    data.forEach((pt) => {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
    });
  });

  it('correctly injects regression outliers marked with isOutlier flag', () => {
    const initial = generateRegressionData('linear', 20, 0.1);
    const withOutliers = injectRegressionOutlier(initial);

    expect(withOutliers.length).toBe(initial.length + 2);
    const outliers = withOutliers.filter((p) => p.isOutlier);
    expect(outliers).toHaveLength(2);
  });

  it('injects label noise into classification dataset', () => {
    const initial = generateClassificationData('blobs', 40, 0.05);
    const withNoise = injectClassificationNoise(initial, 0.5);

    expect(withNoise).toHaveLength(40);
    const modifiedCount = withNoise.filter((p) => p.isOutlier).length;
    expect(modifiedCount).toBeGreaterThan(0);
  });

  it('injects outliers into clustering dataset', () => {
    const initial = generateClusteringData('gaussian_clusters', 40);
    const withOutliers = injectClusteringOutliers(initial, 5);

    expect(withOutliers.length).toBe(initial.length + 5);
    const outliers = withOutliers.filter((p) => p.isOutlier);
    expect(outliers).toHaveLength(5);
  });

  it('detects and filters outliers cleanly using filterOutliers', () => {
    const initial = generateRegressionData('linear', 30, 0.05);
    const withOutliers = injectRegressionOutlier(initial);
    const detected = detectOutliers(withOutliers);
    expect(detected.size).toBeGreaterThanOrEqual(2);

    const { cleaned, removedCount } = filterOutliers(withOutliers);
    expect(removedCount).toBeGreaterThanOrEqual(2);
    expect(cleaned.length).toBeLessThan(withOutliers.length);
    // Ensure all remaining points have isOutlier = false
    cleaned.forEach((p) => {
      expect(p.isOutlier).toBeFalsy();
    });
  });

  it('correctly parses CSV data with headers and handles auto-scaling', () => {
    const csvContent = `
      x, y, label
      -100, 200, 0
      0, 300, 1
      100, 400, 0
    `;

    const parsed = parseCSVData(csvContent, true);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].label).toBe(0);
    expect(parsed[1].label).toBe(1);

    // Auto-scaling ensures points are scaled into [-2.8, 2.8]
    parsed.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(-3.0);
      expect(p.x).toBeLessThanOrEqual(3.0);
      expect(p.y).toBeGreaterThanOrEqual(-3.0);
      expect(p.y).toBeLessThanOrEqual(3.0);
    });
  });
});
