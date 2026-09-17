import * as tf from '@tensorflow/tfjs';
import {
  WorkerInMessage,
  WorkerOutMessage,
  RegressionParams,
  ClassificationParams,
  Centroid,
  DataPoint2D,
  ModelExportPayload,
} from '../types/playground';
import { polynomialFeatures, calculateInertia } from '../utils/mathHelpers';

// Initialize TF backend (CPU is reliable and ultra-fast in Web Workers)
tf.setBackend('cpu').then(() => {
  postMessage({ type: 'TF_READY' } as WorkerOutMessage);
});

// Worker Internal State
let isRunning = false;
let currentEpoch = 0;
let currentModule: 'regression' | 'classification' | 'clustering' | null = null;

// Regression State
let regWeights: tf.Variable | null = null;
let regBias: tf.Variable | null = null;
let regOptimizer: tf.Optimizer | null = null;
let regDataset: DataPoint2D[] = [];
let regParams: RegressionParams | null = null;

// Classification State
let classModel: tf.LayersModel | null = null;
let classDataset: DataPoint2D[] = [];
let classParams: ClassificationParams | null = null;
let classXsTensor: tf.Tensor2D | null = null;
let classYsTensor: tf.Tensor2D | null = null;
let gridTensor: tf.Tensor2D | null = null;

// Clustering State
let clusterPoints: DataPoint2D[] = [];
let centroids: Centroid[] = [];
let clusterAssignments: number[] = [];
let clusterStep = 0;

const CLUSTER_COLORS = [
  '#315B8C', // Palette Slate Blue
  '#F2765E', // Palette Coral
  '#e6984e', // Warm Amber
  '#4a9c79', // Sage Green
  '#8f6885', // Warm Muted Violet
  '#4f7ea8', // Light Slate Blue
  '#e05353', // Terracotta Rose
  '#d6c6b2', // Muted Cream
];

// -------------------------------------------------------------
// REGRESSION ENGINE
// -------------------------------------------------------------
function initRegression(dataset: DataPoint2D[], params: RegressionParams) {
  regDataset = dataset;
  regParams = params;
  currentEpoch = 0;
  currentModule = 'regression';

  if (regWeights) regWeights.dispose();
  if (regBias) regBias.dispose();
  if (regOptimizer) regOptimizer.dispose();

  // Initialize weights with small random normal values
  regWeights = tf.variable(tf.randomNormal([params.degree, 1], 0, 0.1));
  regBias = tf.variable(tf.scalar(0));

  if (params.optimizer === 'adam') {
    regOptimizer = tf.train.adam(params.learningRate);
  } else if (params.optimizer === 'momentum') {
    regOptimizer = tf.train.momentum(params.learningRate, 0.9);
  } else {
    regOptimizer = tf.train.sgd(params.learningRate);
  }
}

function stepRegressionEpoch(): boolean {
  if (!regWeights || !regBias || !regOptimizer || !regParams || regDataset.length === 0) {
    return false;
  }

  const xVals = regDataset.map(p => p.x);
  const yVals = regDataset.map(p => p.y);
  const polyX = polynomialFeatures(xVals, regParams.degree);

  let lossVal = 0;
  let isDiverged = false;

  try {
    tf.tidy(() => {
      const xs = tf.tensor2d(polyX);
      const ys = tf.tensor2d(yVals, [yVals.length, 1]);

      const cost = regOptimizer!.minimize(() => {
        const pred = tf.matMul(xs, regWeights!).add(regBias!);
        let loss = tf.losses.meanSquaredError(ys, pred) as tf.Scalar;

        // Apply L1 / L2 Regularization Penalty if enabled
        if (regParams!.regularization === 'l2' && regParams!.regStrength && regParams!.regStrength > 0) {
          const l2Penalty = tf.mul(tf.scalar(regParams!.regStrength), tf.sum(tf.square(regWeights!))) as tf.Scalar;
          return tf.add(loss, l2Penalty) as tf.Scalar;
        } else if (regParams!.regularization === 'l1' && regParams!.regStrength && regParams!.regStrength > 0) {
          const l1Penalty = tf.mul(tf.scalar(regParams!.regStrength), tf.sum(tf.abs(regWeights!))) as tf.Scalar;
          return tf.add(loss, l1Penalty) as tf.Scalar;
        }

        return loss;
      }, true);

      if (cost) {
        lossVal = cost.dataSync()[0];
      }
    });
  } catch (err: unknown) {
    isDiverged = true;
    lossVal = NaN;
  }

  currentEpoch += 1;

  if (isNaN(lossVal) || !isFinite(lossVal) || lossVal > 1e6) {
    isDiverged = true;
  }

  // Generate curve prediction across [-3.5, 3.5]
  const curvePoints: { x: number; y: number }[] = [];
  let weightsArray: number[] = [];
  let biasVal = 0;

  if (!isDiverged) {
    weightsArray = Array.from(regWeights.dataSync());
    biasVal = regBias.dataSync()[0];

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = -3.5 + (7 * i) / steps;
      let y = biasVal;
      for (let d = 1; d <= regParams.degree; d++) {
        y += (weightsArray[d - 1] || 0) * Math.pow(x, d);
      }
      curvePoints.push({ x, y: Math.max(-10, Math.min(10, y)) });
    }
  }

  postMessage({
    type: 'EPOCH_METRICS',
    payload: {
      epoch: currentEpoch,
      loss: isDiverged ? NaN : lossVal,
      timestamp: Date.now(),
      predictions: curvePoints,
      weights: {
        weights: weightsArray,
        bias: biasVal,
      },
    },
  } as WorkerOutMessage);

  if (isDiverged) {
    postMessage({
      type: 'TRAINING_ERROR',
      payload: {
        message: 'Loss diverged (NaN / Infinity). Learning rate is too high for this polynomial scale!',
        isDiverged: true,
      },
    } as WorkerOutMessage);
    isRunning = false;
    return false;
  }

  if (currentEpoch >= regParams.epochs) {
    isRunning = false;
    postMessage({
      type: 'TRAINING_COMPLETE',
      payload: { reason: `Reached maximum epochs (${regParams.epochs})` },
    } as WorkerOutMessage);
    return false;
  }

  return true;
}

// -------------------------------------------------------------
// CLASSIFICATION ENGINE
// -------------------------------------------------------------
function initClassification(dataset: DataPoint2D[], params: ClassificationParams, gridResolution = 36) {
  classDataset = dataset;
  classParams = params;
  currentEpoch = 0;
  currentModule = 'classification';

  if (classModel) {
    classModel.dispose();
    classModel = null;
  }
  if (classXsTensor) classXsTensor.dispose();
  if (classYsTensor) classYsTensor.dispose();

  // Prepare Tensors
  const xs = dataset.map(p => [p.x, p.y]);
  const ys = dataset.map(p => [p.label ?? 0]);
  classXsTensor = tf.tensor2d(xs);
  classYsTensor = tf.tensor2d(ys);

  // Build Dense Neural Network
  const model = tf.sequential();

  const layers = params.hiddenLayers;
  if (layers.length > 0) {
    model.add(
      tf.layers.dense({
        inputShape: [2],
        units: layers[0],
        activation: params.activation === 'linear' ? undefined : params.activation,
        kernelInitializer: 'glorotNormal',
      })
    );

    for (let i = 1; i < layers.length; i++) {
      model.add(
        tf.layers.dense({
          units: layers[i],
          activation: params.activation === 'linear' ? undefined : params.activation,
          kernelInitializer: 'glorotNormal',
        })
      );
    }

    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        kernelInitializer: 'glorotNormal',
      })
    );
  } else {
    // Single perceptron
    model.add(
      tf.layers.dense({
        inputShape: [2],
        units: 1,
        activation: 'sigmoid',
      })
    );
  }

  const optimizer =
    params.optimizer === 'adam'
      ? tf.train.adam(params.learningRate)
      : tf.train.sgd(params.learningRate);

  model.compile({
    optimizer,
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  classModel = model;

  // Build grid coordinates for decision boundary
  if (gridTensor) gridTensor.dispose();
  const gridCoords: number[][] = [];
  const min = -3.5;
  const max = 3.5;
  const step = (max - min) / (gridResolution - 1);

  for (let r = 0; r < gridResolution; r++) {
    const y = max - r * step; // Top to bottom
    for (let c = 0; c < gridResolution; c++) {
      const x = min + c * step;
      gridCoords.push([x, y]);
    }
  }
  gridTensor = tf.tensor2d(gridCoords);
}

async function stepClassificationEpoch(): Promise<boolean> {
  if (!classModel || !classXsTensor || !classYsTensor || !classParams || classDataset.length === 0) {
    return false;
  }

  let lossVal = 0;
  let accVal = 0;
  let isDiverged = false;

  try {
    const history = await classModel.fit(classXsTensor, classYsTensor, {
      epochs: 1,
      batchSize: classParams.batchSize,
      verbose: 0,
      shuffle: true,
    });

    lossVal = history.history.loss[0] as number;
    accVal = (history.history.acc?.[0] as number) ?? 0;
  } catch (err) {
    isDiverged = true;
    lossVal = NaN;
  }

  currentEpoch += 1;

  if (isNaN(lossVal) || !isFinite(lossVal) || lossVal > 1e4) {
    isDiverged = true;
  }

  // Calculate Decision Boundary Grid
  if (!isDiverged && gridTensor && classModel) {
    const gridPreds = classModel.predict(gridTensor) as tf.Tensor;
    const rawData = await gridPreds.data();
    gridPreds.dispose();

    const resolution = Math.round(Math.sqrt(rawData.length));
    const grid2D: number[][] = [];
    for (let r = 0; r < resolution; r++) {
      const row: number[] = [];
      for (let c = 0; c < resolution; c++) {
        row.push(rawData[r * resolution + c]);
      }
      grid2D.push(row);
    }

    postMessage({
      type: 'BOUNDARY_GRID',
      payload: { grid: grid2D, resolution },
    } as WorkerOutMessage);
  }

  postMessage({
    type: 'EPOCH_METRICS',
    payload: {
      epoch: currentEpoch,
      loss: isDiverged ? NaN : lossVal,
      accuracy: isDiverged ? 0 : accVal,
      timestamp: Date.now(),
    },
  } as WorkerOutMessage);

  if (isDiverged) {
    postMessage({
      type: 'TRAINING_ERROR',
      payload: {
        message: 'Classification loss diverged. Try lowering the learning rate or adjusting layer activations!',
        isDiverged: true,
      },
    } as WorkerOutMessage);
    isRunning = false;
    return false;
  }

  if (currentEpoch >= classParams.epochs) {
    isRunning = false;
    postMessage({
      type: 'TRAINING_COMPLETE',
      payload: { reason: `Reached maximum epochs (${classParams.epochs})` },
    } as WorkerOutMessage);
    return false;
  }

  return true;
}

// -------------------------------------------------------------
// CLUSTERING ENGINE (K-MEANS)
// -------------------------------------------------------------
function initClustering(points: DataPoint2D[], k: number, initMethod: 'random' | 'kmeans++') {
  clusterPoints = points;
  clusterStep = 0;
  currentModule = 'clustering';
  centroids = [];
  clusterAssignments = new Array(points.length).fill(0);

  if (points.length === 0) return;

  if (initMethod === 'kmeans++') {
    // K-Means++: First centroid random
    const firstIdx = Math.floor(Math.random() * points.length);
    centroids.push({
      id: 0,
      x: points[firstIdx].x,
      y: points[firstIdx].y,
      color: CLUSTER_COLORS[0 % CLUSTER_COLORS.length],
      history: [{ x: points[firstIdx].x, y: points[firstIdx].y }],
    });

    for (let c = 1; c < k; c++) {
      // Find distances to nearest centroid
      const distances: number[] = points.map(p => {
        let minDistSq = Infinity;
        for (const cent of centroids) {
          const d = Math.pow(p.x - cent.x, 2) + Math.pow(p.y - cent.y, 2);
          if (d < minDistSq) minDistSq = d;
        }
        return minDistSq;
      });

      const sumDist = distances.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sumDist;
      let selectedIdx = 0;

      for (let i = 0; i < distances.length; i++) {
        rand -= distances[i];
        if (rand <= 0) {
          selectedIdx = i;
          break;
        }
      }

      centroids.push({
        id: c,
        x: points[selectedIdx].x,
        y: points[selectedIdx].y,
        color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
        history: [{ x: points[selectedIdx].x, y: points[selectedIdx].y }],
      });
    }
  } else {
    // Simple random point pick
    const shuffled = [...points].sort(() => 0.5 - Math.random());
    for (let i = 0; i < k; i++) {
      const pt = shuffled[i % shuffled.length];
      centroids.push({
        id: i,
        x: pt.x,
        y: pt.y,
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
        history: [{ x: pt.x, y: pt.y }],
      });
    }
  }

  // Initial assignment
  assignClusters();
  sendClusteringUpdate(false);
}

function assignClusters(): void {
  for (let i = 0; i < clusterPoints.length; i++) {
    const pt = clusterPoints[i];
    let minDist = Infinity;
    let bestCluster = 0;

    for (let c = 0; c < centroids.length; c++) {
      const dist = Math.pow(pt.x - centroids[c].x, 2) + Math.pow(pt.y - centroids[c].y, 2);
      if (dist < minDist) {
        minDist = dist;
        bestCluster = c;
      }
    }
    clusterAssignments[i] = bestCluster;
  }
}

function stepClustering(): boolean {
  if (centroids.length === 0 || clusterPoints.length === 0) return false;

  clusterStep += 1;
  let maxShift = 0;

  // Step A: Recompute centroid positions
  for (let c = 0; c < centroids.length; c++) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let i = 0; i < clusterPoints.length; i++) {
      if (clusterAssignments[i] === c) {
        sumX += clusterPoints[i].x;
        sumY += clusterPoints[i].y;
        count += 1;
      }
    }

    if (count > 0) {
      const newX = sumX / count;
      const newY = sumY / count;
      const shift = Math.hypot(newX - centroids[c].x, newY - centroids[c].y);
      if (shift > maxShift) maxShift = shift;

      centroids[c].x = newX;
      centroids[c].y = newY;
      centroids[c].history.push({ x: newX, y: newY });
    }
  }

  // Step B: Reassign points to new centroids
  assignClusters();

  const converged = maxShift < 0.001;
  sendClusteringUpdate(converged);

  return !converged;
}

function sendClusteringUpdate(converged: boolean) {
  const inertia = calculateInertia(clusterPoints, centroids, clusterAssignments);

  postMessage({
    type: 'KMEANS_STEP_RESULT',
    payload: {
      centroids: JSON.parse(JSON.stringify(centroids)),
      assignments: [...clusterAssignments],
      inertia,
      converged,
      step: clusterStep,
    },
  } as WorkerOutMessage);
}

// -------------------------------------------------------------
// WEIGHT EXPORT DISPATCHER
// -------------------------------------------------------------
async function handleExportWeights() {
  if (currentModule === 'regression' && regWeights && regBias && regParams) {
    const weights = Array.from(regWeights.dataSync());
    const bias = regBias.dataSync()[0];

    const payload: ModelExportPayload = {
      name: 'Polynomial_Regression_Model',
      module: 'regression',
      exportedAt: new Date().toISOString(),
      architecture: {
        type: 'Polynomial Regression',
        degree: regParams.degree,
        formula: `y = ${weights.map((w, i) => `${w.toFixed(4)}*x^${i + 1}`).join(' + ')} + ${bias.toFixed(4)}`,
      },
      hyperparameters: { ...regParams },
      weights: {
        coefficients: weights,
        intercept: bias,
      },
      metrics: {
        finalLoss: NaN, // will be populated from store or latest
        epochsTrained: currentEpoch,
      },
    };

    postMessage({ type: 'WEIGHTS_EXPORTED', payload } as WorkerOutMessage);
  } else if (currentModule === 'classification' && classModel && classParams) {
    const weightsMap: Record<string, number[] | number[][]> = {};
    for (const layer of classModel.layers) {
      const layerWeights = layer.getWeights();
      if (layerWeights.length > 0) {
        const kernel = await layerWeights[0].array();
        const bias = layerWeights.length > 1 ? await layerWeights[1].array() : [];
        weightsMap[`${layer.name}_kernel`] = kernel as number[][];
        weightsMap[`${layer.name}_bias`] = bias as number[];
      }
    }

    const payload: ModelExportPayload = {
      name: 'Neural_Network_Classifier',
      module: 'classification',
      exportedAt: new Date().toISOString(),
      architecture: {
        type: 'Sequential Dense NN',
        hiddenLayers: classParams.hiddenLayers,
        activation: classParams.activation,
        outputActivation: 'sigmoid',
      },
      hyperparameters: { ...classParams },
      weights: weightsMap,
      metrics: {
        finalLoss: 0,
        epochsTrained: currentEpoch,
      },
    };

    postMessage({ type: 'WEIGHTS_EXPORTED', payload } as WorkerOutMessage);
  } else if (currentModule === 'clustering' && centroids.length > 0) {
    const payload: ModelExportPayload = {
      name: 'KMeans_Clustering_Model',
      module: 'clustering',
      exportedAt: new Date().toISOString(),
      architecture: {
        type: 'K-Means',
        k: centroids.length,
      },
      hyperparameters: {
        k: centroids.length,
        iterations: clusterStep,
      },
      weights: {
        centroids: centroids.map(c => [c.x, c.y]),
      },
      metrics: {
        finalLoss: calculateInertia(clusterPoints, centroids, clusterAssignments),
        finalInertia: calculateInertia(clusterPoints, centroids, clusterAssignments),
        epochsTrained: clusterStep,
      },
    };

    postMessage({ type: 'WEIGHTS_EXPORTED', payload } as WorkerOutMessage);
  }
}

// -------------------------------------------------------------
// WORKER TRAINING LOOP
// -------------------------------------------------------------
async function runLoop() {
  if (!isRunning) return;

  let canContinue = false;

  if (currentModule === 'regression') {
    canContinue = stepRegressionEpoch();
  } else if (currentModule === 'classification') {
    canContinue = await stepClassificationEpoch();
  } else if (currentModule === 'clustering') {
    canContinue = stepClustering();
  }

  if (canContinue && isRunning) {
    // Throttled iteration to allow UI responsive paint cycle
    setTimeout(runLoop, 20);
  } else {
    isRunning = false;
  }
}

// -------------------------------------------------------------
// MESSAGE LISTENER
// -------------------------------------------------------------
self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'TRAIN_REGRESSION':
      initRegression(msg.payload.dataset, msg.payload.params);
      isRunning = true;
      runLoop();
      break;

    case 'STEP_REGRESSION':
      if (currentEpoch === 0 || currentModule !== 'regression') {
        initRegression(msg.payload.dataset, msg.payload.params);
      }
      isRunning = false;
      stepRegressionEpoch();
      break;

    case 'TRAIN_CLASSIFICATION':
      initClassification(msg.payload.dataset, msg.payload.params, msg.payload.gridResolution);
      isRunning = true;
      runLoop();
      break;

    case 'STEP_CLASSIFICATION':
      if (currentEpoch === 0 || currentModule !== 'classification') {
        initClassification(msg.payload.dataset, msg.payload.params, msg.payload.gridResolution);
      }
      isRunning = false;
      stepClassificationEpoch();
      break;

    case 'KMEANS_INIT':
      initClustering(msg.payload.dataset, msg.payload.k, msg.payload.initMethod);
      break;

    case 'KMEANS_STEP':
      stepClustering();
      break;

    case 'PAUSE_TRAIN':
      isRunning = false;
      break;

    case 'RESET_TRAIN':
      isRunning = false;
      currentEpoch = 0;
      break;

    case 'EXPORT_WEIGHTS':
      await handleExportWeights();
      break;
  }
};
