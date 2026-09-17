import React, { useEffect } from 'react';
import { usePlaygroundStore } from './store/usePlaygroundStore';
import { Header } from './components/common/Header';
import { RegressionPlayground } from './modules/regression/RegressionPlayground';
import { ClassificationPlayground } from './modules/classification/ClassificationPlayground';
import { ClusteringPlayground } from './modules/clustering/ClusteringPlayground';
import { WeightExportModal } from './components/export/WeightExportModal';
import { DataImportModal } from './components/common/DataImportModal';
import { initWorkerDispatcher } from './workers/workerDispatcher';
import { AlertCircle, X, Cpu, Database } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeTab,
    isExportModalOpen,
    closeExportModal,
    exportPayload,
    theme,
    notification,
    setNotification,
  } = usePlaygroundStore();

  useEffect(() => {
    initWorkerDispatcher();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-ground text-ink-primary">
      {/* App Header */}
      <Header />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-accent-rose/15 border-accent-rose/30 text-rose-200'
                : 'bg-surface border-border text-ink-primary'
            }`}
          >
            <AlertCircle size={20} className="text-accent-coral flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{notification.title}</h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-ink-muted hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'regression' && <RegressionPlayground />}
        {activeTab === 'classification' && <ClassificationPlayground />}
        {activeTab === 'clustering' && <ClusteringPlayground />}
      </main>

      {/* Architecture Specs & Performance Footer */}
      <footer className="w-full border-t border-border bg-surface/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className="text-accent-blue" />
              <span>Multi-threaded Web Worker (Zero UI Freezes)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database size={14} className="text-accent-emerald" />
              <span>100% In-Browser TensorFlow.js (Zero Cloud Latency)</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-ink-muted">
            ML Model Playground v1.0 • Client-Side Neural Studio
          </div>
        </div>
      </footer>

      {/* Weights Export Modal */}
      <WeightExportModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        payload={exportPayload}
      />

      {/* CSV / Data Import Modal */}
      <DataImportModal />
    </div>
  );
};
