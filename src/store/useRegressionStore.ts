import { create } from 'zustand';
import { DataPoint2D, RegressionParams, EpochMetric } from '../types/playground';
import { generateRegressionData, injectRegressionOutlier, filterOutliers } from '../utils/datasetGenerators';
import { workerBridge } from '../workers/workerBridge';

interface RegressionState {
  dataset: DataPoint2D[];
  datasetType: 'linear' | 'quadratic' | 'sine' | 'stock';
  params: RegressionParams;
  isRunning: boolean;
  currentEpoch: number;
  lossHistory: EpochMetric[];
  isDiverged: boolean;
  fittedCurve: { x: number; y: number }[];
  weights: { weights: number[]; bias: number } | null;
  weightTrajectory: { w: number; b: number }[];
  showResiduals: boolean;

  // Actions
  setDatasetType: (type: 'linear' | 'quadratic' | 'sine' | 'stock') => void;
  setDataset: (dataset: DataPoint2D[]) => void;
  updateParams: (params: Partial<RegressionParams>) => void;
  toggleResiduals: () => void;
  injectNoise: () => void;
  removeOutliers: () => { removedCount: number };
  addPoint: (x: number, y: number) => void;
  startTraining: () => void;
  pauseTraining: () => void;
  stepTraining: () => void;
  resetTraining: () => void;
  onEpochMetric: (metric: EpochMetric & { predictions?: { x: number; y: number }[]; weights?: { weights: number[]; bias: number } }) => void;
  onDiverged: () => void;
}

const initialParams: RegressionParams = {
  learningRate: 0.05,
  degree: 1,
  optimizer: 'adam',
  epochs: 100,
  batchSize: 32,
  noisePercent: 0.15,
  regularization: 'none',
  regStrength: 0.01,
};

export const useRegressionStore = create<RegressionState>((set, get) => ({
  dataset: generateRegressionData('linear', 40, 0.2),
  datasetType: 'linear',
  params: initialParams,
  isRunning: false,
  currentEpoch: 0,
  lossHistory: [],
  isDiverged: false,
  fittedCurve: [],
  weights: null,
  weightTrajectory: [],
  showResiduals: true,

  setDatasetType: (type) => {
    const newPoints = generateRegressionData(type, 40, get().params.noisePercent);
    // Auto-adjust default degree recommendation
    let degree = 1;
    if (type === 'quadratic') degree = 2;
    if (type === 'sine' || type === 'stock') degree = 3;

    set({
      datasetType: type,
      dataset: newPoints,
      currentEpoch: 0,
      lossHistory: [],
      fittedCurve: [],
      isDiverged: false,
      isRunning: false,
      weightTrajectory: [],
      params: { ...get().params, degree },
    });
    workerBridge.post({ type: 'RESET_TRAIN' });
  },

  setDataset: (dataset) => set({ dataset, weightTrajectory: [] }),

  updateParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams },
    }));
  },

  toggleResiduals: () => set((state) => ({ showResiduals: !state.showResiduals })),

  injectNoise: () => {
    const updated = injectRegressionOutlier(get().dataset);
    set({ dataset: updated });
  },

  removeOutliers: () => {
    const { cleaned, removedCount } = filterOutliers(get().dataset);
    set({ dataset: cleaned });
    return { removedCount };
  },

  addPoint: (x, y) => {
    const newPoint: DataPoint2D = {
      id: `pt_${Date.now()}_${Math.random()}`,
      x,
      y,
      isOutlier: false,
    };
    set((state) => ({ dataset: [...state.dataset, newPoint] }));
  },

  startTraining: () => {
    const state = get();
    set({ isRunning: true, isDiverged: false });
    workerBridge.post({
      type: 'TRAIN_REGRESSION',
      payload: {
        dataset: state.dataset,
        params: state.params,
      },
    });
  },

  pauseTraining: () => {
    set({ isRunning: false });
    workerBridge.post({ type: 'PAUSE_TRAIN' });
  },

  stepTraining: () => {
    const state = get();
    set({ isRunning: false });
    workerBridge.post({
      type: 'STEP_REGRESSION',
      payload: {
        dataset: state.dataset,
        params: state.params,
      },
    });
  },

  resetTraining: () => {
    set({
      isRunning: false,
      currentEpoch: 0,
      lossHistory: [],
      isDiverged: false,
      fittedCurve: [],
      weights: null,
      weightTrajectory: [],
    });
    workerBridge.post({ type: 'RESET_TRAIN' });
  },

  onEpochMetric: (metric) => {
    set((state) => {
      const w1 = metric.weights?.weights?.[0] as number | undefined;
      const b1 = metric.weights?.bias as number | undefined;
      const newTrajectory = (w1 !== undefined && b1 !== undefined && !isNaN(w1) && !isNaN(b1))
        ? [...state.weightTrajectory, { w: Number(w1.toFixed(3)), b: Number(b1.toFixed(3)) }].slice(-200)
        : state.weightTrajectory;

      return {
        currentEpoch: metric.epoch,
        lossHistory: [...state.lossHistory.slice(-150), metric],
        fittedCurve: metric.predictions || state.fittedCurve,
        weights: metric.weights ? { weights: metric.weights.weights as number[], bias: metric.weights.bias as number } : state.weights,
        weightTrajectory: newTrajectory,
      };
    });
  },

  onDiverged: () => {
    set({ isDiverged: true, isRunning: false });
  },
}));
