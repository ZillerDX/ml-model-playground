import React, { useState, useMemo, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { useRegressionStore } from '../../store/useRegressionStore';
import { useClassificationStore } from '../../store/useClassificationStore';
import { useClusteringStore } from '../../store/useClusteringStore';
import { parseCSVData } from '../../utils/datasetGenerators';
import { ActionButton } from './CustomControls';
import { getTranslation } from '../../utils/i18n';

export const DataImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, importTarget, locale, setNotification } = usePlaygroundStore();
  const t = getTranslation(locale);

  const setRegressionDataset = useRegressionStore((s) => s.setDataset);
  const resetRegression = useRegressionStore((s) => s.resetTraining);

  const setClassificationDataset = useClassificationStore((s) => s.setDataset);
  const resetClassification = useClassificationStore((s) => s.resetTraining);

  const setClusteringDataset = useClusteringStore((s) => s.setPoints);
  const resetClustering = useClusteringStore((s) => s.resetCentroids);

  const [csvText, setCsvText] = useState('');
  const [autoScale, setAutoScale] = useState(true);

  useEffect(() => {
    if (!isImportModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeImportModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImportModalOpen, closeImportModal]);

  const parsedPoints = useMemo(() => {
    return parseCSVData(csvText, autoScale);
  }, [csvText, autoScale]);

  if (!isImportModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedPoints.length === 0) {
      setNotification({
        title: t.common.warning,
        message: t.notifications.csvError,
        type: 'error',
      });
      return;
    }

    if (importTarget === 'regression') {
      setRegressionDataset(parsedPoints);
      resetRegression();
    } else if (importTarget === 'classification') {
      // Ensure points have binary labels if missing
      const labeled = parsedPoints.map((p, idx) => ({
        ...p,
        label: p.label !== undefined ? p.label : idx % 2 === 0 ? 0 : 1,
      }));
      setClassificationDataset(labeled);
      resetClassification();
    } else if (importTarget === 'clustering') {
      setClusteringDataset(parsedPoints);
      resetClustering();
    }

    setNotification({
      title: 'Success',
      message: t.notifications.csvSuccess.replace('{count}', String(parsedPoints.length)),
      type: 'success',
    });

    closeImportModal();
    setCsvText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ground/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeImportModal}
    >
      <div
        className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <Upload className="text-accent-blue" size={20} />
            <div>
              <h3 className="text-base font-semibold text-ink-primary">
                {t.common.importCsv} ({importTarget.toUpperCase()})
              </h3>
              <p className="text-xs text-ink-muted">{t.common.dropFileOrPaste}</p>
            </div>
          </div>
          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={closeImportModal}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* File input / drag trigger */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border hover:bg-surface-hover text-xs font-semibold text-ink-primary cursor-pointer transition-colors shadow-sm whitespace-nowrap">
              <FileText size={15} className="text-accent-blue" />
              <span>{t.common.chooseCsvFile}</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <span className="text-xs text-ink-muted">{t.common.orPasteRawNumbers}</span>
          </div>

          {/* Text Area */}
          <textarea
            rows={7}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={t.common.pasteCsvPlaceholder}
            className="w-full p-3.5 rounded-xl bg-ground border border-border text-ink-primary font-mono text-xs placeholder:text-ink-muted/50 focus:outline-none focus:border-accent-blue resize-none transition-colors"
          />

          {/* Options */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle/70 border border-border">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScale}
                onChange={(e) => setAutoScale(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent-blue focus:ring-accent-blue accent-accent-blue"
              />
              <span className="text-xs font-medium text-ink-primary">{t.common.autoNormalize}</span>
            </label>
          </div>
          <p className="text-[11px] text-ink-muted -mt-2 px-1">
            {t.common.autoNormalizeHelp}
          </p>

          {/* Parse Status Box */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-border text-xs">
            {parsedPoints.length > 0 ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-ink-primary">
                  {t.common.rowsParsed}: <strong className="text-accent-blue">{parsedPoints.length}</strong>
                </span>
                <span className="text-ink-muted font-mono text-[11px] ml-auto">
                  Sample: ({parsedPoints[0].x}, {parsedPoints[0].y})
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <span className="text-ink-muted">
                  {t.common.pastePreviewHelp}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Footer: Single Action Hierarchy */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-subtle/30">
          <span className="text-xs text-ink-muted font-mono">
            {parsedPoints.length > 0
              ? `${parsedPoints.length} ${t.common.pointsCount}`
              : t.common.pastePreviewHelp}
          </span>
          <ActionButton
            variant="primary"
            size="sm"
            disabled={parsedPoints.length === 0}
            onClick={handleImport}
            icon={<Upload size={14} />}
          >
            {t.common.importData}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
