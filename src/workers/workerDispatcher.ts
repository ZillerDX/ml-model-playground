import { workerBridge } from './workerBridge';
import { useRegressionStore } from '../store/useRegressionStore';
import { useClassificationStore } from '../store/useClassificationStore';
import { useClusteringStore } from '../store/useClusteringStore';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { WorkerOutMessage } from '../types/playground';

let isInitialized = false;

export function initWorkerDispatcher() {
  if (isInitialized) return;
  isInitialized = true;

  workerBridge.subscribe((msg: WorkerOutMessage) => {
    const activeTab = usePlaygroundStore.getState().activeTab;

    switch (msg.type) {
      case 'TF_READY':
        // Ready status
        break;

      case 'EPOCH_METRICS':
        if (activeTab === 'regression') {
          useRegressionStore.getState().onEpochMetric(msg.payload as any);
        } else if (activeTab === 'classification') {
          useClassificationStore.getState().onEpochMetric(msg.payload);
        }
        break;

      case 'BOUNDARY_GRID':
        if (activeTab === 'classification') {
          useClassificationStore.getState().onBoundaryGrid(msg.payload.grid, msg.payload.resolution);
        }
        break;

      case 'KMEANS_STEP_RESULT':
        if (activeTab === 'clustering') {
          useClusteringStore.getState().onStepResult(msg.payload);
        }
        break;

      case 'TRAINING_ERROR':
        if (msg.payload.isDiverged) {
          if (activeTab === 'regression') {
            useRegressionStore.getState().onDiverged();
          } else if (activeTab === 'classification') {
            useClassificationStore.getState().onDiverged();
          }
          usePlaygroundStore.getState().setNotification({
            title: 'Gradient Explosion / Divergence Detected!',
            message: msg.payload.message,
            type: 'error',
          });
        }
        break;

      case 'TRAINING_COMPLETE':
        if (activeTab === 'regression') {
          useRegressionStore.setState({ isRunning: false });
        } else if (activeTab === 'classification') {
          useClassificationStore.setState({ isRunning: false });
        }
        break;

      case 'WEIGHTS_EXPORTED':
        usePlaygroundStore.getState().openExportModal(msg.payload);
        break;
    }
  });
}
