export type PlaygroundTab = 'regression' | 'classification' | 'clustering';

export interface DataPoint2D {
  id: string;
  x: number;
  y: number;
  label?: number; // For classification: 0, 1, 2...
  cluster?: number; // For clustering
  isOutlier?: boolean;
}

export type OptimizerType = 'sgd' | 'adam' | 'momentum';
export type ActivationType = 'relu' | 'tanh' | 'sigmoid' | 'linear';
export type DatasetType = 
  | 'linear' | 'quadratic' | 'sine' | 'stock' 
  | 'circles' | 'moons' | 'spiral' | 'blobs'
  | 'gaussian_clusters' | 'anisotropic' | 'varied_density';

export interface RegressionParams {
  learningRate: number;
  degree: number; // 1 = linear, 2-5 = polynomial
  optimizer: OptimizerType;
  epochs: number;
  batchSize: number;
  noisePercent: number;
  regularization?: 'none' | 'l1' | 'l2';
  regStrength?: number; // e.g. 0.001 to 0.1
}

export interface ClassificationParams {
  learningRate: number;
  hiddenLayers: number[]; // e.g. [4, 4] means two layers of 4 neurons
  activation: ActivationType;
  optimizer: OptimizerType;
  epochs: number;
  batchSize: number;
  noisePercent: number;
}

export interface ClusteringParams {
  k: number; // Number of clusters (2-8)
  initMethod: 'random' | 'kmeans++';
  maxIterations: number;
  stepDelayMs: number;
}

export interface EpochMetric {
  epoch: number;
  loss: number;
  valLoss?: number;
  accuracy?: number;
  timestamp: number;
}

export interface Centroid {
  id: number;
  x: number;
  y: number;
  color: string;
  history: { x: number; y: number }[];
}

export interface ModelExportPayload {
  name: string;
  module: PlaygroundTab;
  exportedAt: string;
  architecture: Record<string, unknown>;
  hyperparameters: Record<string, unknown>;
  weights: Record<string, number[] | number[][] | number>;
  metrics: {
    finalLoss: number;
    finalAccuracy?: number;
    finalInertia?: number;
    epochsTrained: number;
  };
}

export type WorkerInMessage =
  | { type: 'INIT_TF' }
  | { type: 'TRAIN_REGRESSION'; payload: { dataset: DataPoint2D[]; params: RegressionParams } }
  | { type: 'STEP_REGRESSION'; payload: { dataset: DataPoint2D[]; params: RegressionParams } }
  | { type: 'TRAIN_CLASSIFICATION'; payload: { dataset: DataPoint2D[]; params: ClassificationParams; gridResolution?: number } }
  | { type: 'STEP_CLASSIFICATION'; payload: { dataset: DataPoint2D[]; params: ClassificationParams; gridResolution?: number } }
  | { type: 'PAUSE_TRAIN' }
  | { type: 'RESET_TRAIN' }
  | { type: 'KMEANS_INIT'; payload: { dataset: DataPoint2D[]; k: number; initMethod: 'random' | 'kmeans++' } }
  | { type: 'KMEANS_STEP' }
  | { type: 'EXPORT_WEIGHTS' };

export type WorkerOutMessage =
  | { type: 'TF_READY' }
  | { type: 'EPOCH_METRICS'; payload: EpochMetric & { predictions?: { x: number; y: number }[]; weights?: Record<string, number[] | number[][] | number> } }
  | { type: 'BOUNDARY_GRID'; payload: { grid: number[][]; resolution: number } }
  | { type: 'TRAINING_COMPLETE'; payload: { reason: string } }
  | { type: 'TRAINING_ERROR'; payload: { message: string; isDiverged?: boolean } }
  | { type: 'KMEANS_STEP_RESULT'; payload: { centroids: Centroid[]; assignments: number[]; inertia: number; converged: boolean; step: number } }
  | { type: 'WEIGHTS_EXPORTED'; payload: ModelExportPayload };
