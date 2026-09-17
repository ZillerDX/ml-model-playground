import { describe, it, expect } from 'vitest';
import {
  polynomialFeatures,
  calculateMSE,
  calculateBinaryCrossEntropy,
  calculateInertia,
} from './mathHelpers';

describe('mathHelpers', () => {
  it('correctly computes polynomial feature expansions up to degree 3', () => {
    const xVals = [2, -3];
    const poly = polynomialFeatures(xVals, 3);

    expect(poly).toHaveLength(2);
    // 2^1, 2^2, 2^3 = [2, 4, 8]
    expect(poly[0]).toEqual([2, 4, 8]);
    // (-3)^1, (-3)^2, (-3)^3 = [-3, 9, -27]
    expect(poly[1]).toEqual([-3, 9, -27]);
  });

  it('correctly calculates Mean Squared Error (MSE)', () => {
    const actual = [1, 2, 3];
    const predicted = [1, 2, 5]; // squared error = 0 + 0 + 4 = 4 / 3
    const mse = calculateMSE(actual, predicted);
    expect(mse).toBeCloseTo(4 / 3, 5);
  });

  it('correctly calculates Binary Cross Entropy', () => {
    const actual = [1, 0];
    const predicted = [0.9, 0.1];
    const bce = calculateBinaryCrossEntropy(actual, predicted);
    expect(bce).toBeGreaterThan(0);
    expect(bce).toBeLessThan(0.2);
  });

  it('correctly calculates K-Means Inertia (Within-Cluster Sum of Squares)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 10, y: 10 },
    ];
    const centroids = [
      { x: 0.5, y: 0 },
      { x: 10, y: 10 },
    ];
    const assignments = [0, 0, 1]; // Points 0 & 1 assigned to centroid 0, Point 2 to centroid 1

    // For point 0: (0 - 0.5)^2 + 0 = 0.25
    // For point 1: (1 - 0.5)^2 + 0 = 0.25
    // For point 2: (10 - 10)^2 + 0 = 0
    // Total inertia = 0.5
    const inertia = calculateInertia(points, centroids, assignments);
    expect(inertia).toBeCloseTo(0.5, 4);
  });
});
