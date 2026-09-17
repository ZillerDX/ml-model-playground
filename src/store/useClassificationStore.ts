import { create } from 'zustand';
import { DataPoint2D, ClassificationParams, EpochMetric } from '../types/playground';
import { generateClassificationData, injectClassificationNoise, filterOutliers } from '../utils/datasetGenerators';
import { workerBridge } from '../workers/workerBridge';

interface ClassificationState {
  dataset: DataPoint2D[];
  datasetType: 'circles' | 'moons' | 'spiral' | 'blobs';
  params: ClassificationParams;
  isRunning: boolean;
  currentEpoch: number;
  lossHistory: EpochMetric[];
  isDiverged: boolean;
  boundaryGrid: number[][] | null;
  gridResolution: number;
  activeClassToDraw: 0 | 1;

  // Actions
  setDatasetType: (type: 'circles' | 'moons' | 'spiral' | 'blobs') => void;
  setDataset: (dataset: DataPoint2D[]) => void;
  updateParams: (params: Partial<ClassificationParams>) => void;
  setActiveClassToDraw: (cls: 0 | 1) => void;
  injectNoise: () => void;
  removeOutliers: () => { removedCount: number };
  addPoint: (x: number, y: number) => void;
  startTraining: () => void;
  pauseTraining: () => void;
  stepTraining: () => void;
  resetTraining: () => void;
  onEpochMetric: (metric: EpochMetric) => void;
  onBoundaryGrid: (grid: number[][], resolution: number) => void;
  onDiverged: () => void;
}

const initialParams: ClassificationParams = {
  learningRate: 0.05,
  hiddenLayers: [6, 6],
  activation: 'tanh',
  optimizer: 'adam',
  epochs: 150,
  batchSize: 32,
  noisePercent: 0.1,
};

export const useClassificationStore = create<ClassificationState>((set, get) => ({
  dataset: generateClassificationData('circles', 100, 0.1),
  datasetType: 'circles',
  params: initialParams,
  isRunning: false,
  currentEpoch: 0,
  lossHistory: [],
  isDiverged: false,
  boundaryGrid: null,
  gridResolution: 36,
  activeClassToDraw: 0,

  setDatasetType: (type) => {
    const newPoints = generateClassificationData(type, 100, get().params.noisePercent);
    set({
      datasetType: type,
      dataset: newPoints,
      currentEpoch: 0,
      lossHistory: [],
      boundaryGrid: null,
      isDiverged: false,
      isRunning: false,
    });
    workerBridge.post({ type: 'RESET_TRAIN' });
  },

  setDataset: (dataset) => set({ dataset }),

  updateParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams },
    }));
  },

  setActiveClassToDraw: (cls) => set({ activeClassToDraw: cls }),

  injectNoise: () => {
    const updated = injectClassificationNoise(get().dataset, 0.2);
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
      label: get().activeClassToDraw,
      isOutlier: false,
    };
    set((state) => ({ dataset: [...state.dataset, newPoint] }));
  },

  startTraining: () => {
    const state = get();
    set({ isRunning: true, isDiverged: false });
    workerBridge.post({
      type: 'TRAIN_CLASSIFICATION',
      payload: {
        dataset: state.dataset,
        params: state.params,
        gridResolution: state.gridResolution,
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
      type: 'STEP_CLASSIFICATION',
      payload: {
        dataset: state.dataset,
        params: state.params,
        gridResolution: state.gridResolution,
      },
    });
  },

  resetTraining: () => {
    set({
      isRunning: false,
      currentEpoch: 0,
      lossHistory: [],
      isDiverged: false,
      boundaryGrid: null,
    });
    workerBridge.post({ type: 'RESET_TRAIN' });
  },

  onEpochMetric: (metric) => {
    set((state) => ({
      currentEpoch: metric.epoch,
      lossHistory: [...state.lossHistory.slice(-150), metric],
    }));
  },

  onBoundaryGrid: (grid, resolution) => {
    set({ boundaryGrid: grid, gridResolution: resolution });
  },

  onDiverged: () => {
    set({ isDiverged: true, isRunning: false });
  },
}));
