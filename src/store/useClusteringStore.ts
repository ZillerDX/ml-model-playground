import { create } from 'zustand';
import { DataPoint2D, ClusteringParams, Centroid } from '../types/playground';
import { generateClusteringData, injectClusteringOutliers, filterOutliers } from '../utils/datasetGenerators';
import { workerBridge } from '../workers/workerBridge';

interface ClusteringState {
  dataset: DataPoint2D[];
  datasetType: 'gaussian_clusters' | 'anisotropic' | 'varied_density';
  params: ClusteringParams;
  isRunning: boolean;
  step: number;
  centroids: Centroid[];
  assignments: number[];
  inertiaHistory: { step: number; inertia: number }[];
  converged: boolean;

  // Actions
  setDatasetType: (type: 'gaussian_clusters' | 'anisotropic' | 'varied_density') => void;
  setDataset: (dataset: DataPoint2D[]) => void;
  setPoints: (dataset: DataPoint2D[]) => void;
  updateParams: (params: Partial<ClusteringParams>) => void;
  injectNoise: () => void;
  removeOutliers: () => { removedCount: number };
  addPoint: (x: number, y: number) => void;
  initKMeans: () => void;
  resetCentroids: () => void;
  stepKMeans: () => void;
  autoRun: () => void;
  pauseAutoRun: () => void;
  onStepResult: (result: {
    centroids: Centroid[];
    assignments: number[];
    inertia: number;
    converged: boolean;
    step: number;
  }) => void;
}

const initialParams: ClusteringParams = {
  k: 3,
  initMethod: 'kmeans++',
  maxIterations: 50,
  stepDelayMs: 250,
};

let autoRunTimer: NodeJS.Timeout | null = null;

export const useClusteringStore = create<ClusteringState>((set, get) => ({
  dataset: generateClusteringData('gaussian_clusters', 120),
  datasetType: 'gaussian_clusters',
  params: initialParams,
  isRunning: false,
  step: 0,
  centroids: [],
  assignments: [],
  inertiaHistory: [],
  converged: false,

  setDatasetType: (type) => {
    if (autoRunTimer) clearInterval(autoRunTimer);
    const newPoints = generateClusteringData(type, 120);
    set({
      datasetType: type,
      dataset: newPoints,
      step: 0,
      centroids: [],
      assignments: [],
      inertiaHistory: [],
      converged: false,
      isRunning: false,
    });
    // Auto-init K-Means on dataset switch
    setTimeout(() => get().initKMeans(), 50);
  },

  setDataset: (dataset) => {
    set({ dataset });
    get().initKMeans();
  },

  setPoints: (dataset) => {
    set({ dataset });
    get().initKMeans();
  },

  updateParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams },
    }));
    if (newParams.k !== undefined || newParams.initMethod !== undefined) {
      get().initKMeans();
    }
  },

  injectNoise: () => {
    const updated = injectClusteringOutliers(get().dataset, 6);
    set({ dataset: updated });
    get().initKMeans();
  },

  removeOutliers: () => {
    const { cleaned, removedCount } = filterOutliers(get().dataset);
    set({ dataset: cleaned });
    get().initKMeans();
    return { removedCount };
  },

  resetCentroids: () => {
    get().initKMeans();
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

  initKMeans: () => {
    if (autoRunTimer) clearInterval(autoRunTimer);
    const state = get();
    set({
      step: 0,
      inertiaHistory: [],
      converged: false,
      isRunning: false,
    });
    workerBridge.post({
      type: 'KMEANS_INIT',
      payload: {
        dataset: state.dataset,
        k: state.params.k,
        initMethod: state.params.initMethod,
      },
    });
  },

  stepKMeans: () => {
    workerBridge.post({ type: 'KMEANS_STEP' });
  },

  autoRun: () => {
    if (autoRunTimer) clearInterval(autoRunTimer);
    set({ isRunning: true });

    autoRunTimer = setInterval(() => {
      const state = get();
      if (state.converged || !state.isRunning) {
        if (autoRunTimer) clearInterval(autoRunTimer);
        set({ isRunning: false });
        return;
      }
      get().stepKMeans();
    }, get().params.stepDelayMs);
  },

  pauseAutoRun: () => {
    if (autoRunTimer) clearInterval(autoRunTimer);
    set({ isRunning: false });
  },

  onStepResult: (result) => {
    set((state) => ({
      centroids: result.centroids,
      assignments: result.assignments,
      step: result.step,
      converged: result.converged,
      inertiaHistory: [
        ...state.inertiaHistory,
        { step: result.step, inertia: result.inertia },
      ],
      isRunning: result.converged ? false : state.isRunning,
    }));
  },
}));
