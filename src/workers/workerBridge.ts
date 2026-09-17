import { WorkerInMessage, WorkerOutMessage } from '../types/playground';

type MessageHandler = (msg: WorkerOutMessage) => void;

class TrainingWorkerBridge {
  private worker: Worker | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private isReady = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Modern Vite worker instantiation
      this.worker = new Worker(
        new URL('./trainingWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        if (e.data.type === 'TF_READY') {
          this.isReady = true;
        }
        this.listeners.forEach(handler => handler(e.data));
      };

      this.worker.onerror = (err) => {
        console.error('Worker error:', err);
      };
    } catch (err) {
      console.error('Failed to create training worker:', err);
    }
  }

  public get ready(): boolean {
    return this.isReady;
  }

  public subscribe(handler: MessageHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public post(msg: WorkerInMessage): void {
    if (this.worker) {
      this.worker.postMessage(msg);
    } else {
      console.warn('Worker is not initialized yet');
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

// Singleton worker bridge instance
export const workerBridge = new TrainingWorkerBridge();
