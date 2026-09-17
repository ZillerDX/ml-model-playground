import React, { useState } from 'react';
import { X, Copy, Download, Check, FileJson } from 'lucide-react';
import { ModelExportPayload } from '../../types/playground';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ActionButton } from '../common/CustomControls';
import { getTranslation } from '../../utils/i18n';

interface WeightExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ModelExportPayload | null;
}

export const WeightExportModal: React.FC<WeightExportModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [copied, setCopied] = useState(false);
  const { locale } = usePlaygroundStore();
  const t = getTranslation(locale);

  if (!isOpen || !payload) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy json:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${payload.name}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ground/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <FileJson className="text-accent-blue" size={20} />
            <div>
              <h3 className="text-base font-semibold text-ink-primary">
                {locale === 'th' ? 'ส่งออกค่าน้ำหนักโมเดล (Export Weights)' : 'Export Model Weights'}
              </h3>
              <p className="text-xs text-ink-muted">
                {locale === 'th'
                  ? 'ไฟล์ JSON มาตรฐานสำหรับนำไปใช้ต่อใน Python / TF / NumPy'
                  : 'Standard JSON format for consumption in external Python / TF pipelines'}
              </p>
            </div>
          </div>
          {/* Strict 1-Close Rule: Only Top-Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* JSON Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          <pre className="p-4 bg-ground rounded-xl border border-border text-ink-secondary overflow-x-auto selection:bg-accent-blue/30 selection:text-white leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-subtle/30">
          <span className="text-xs text-ink-muted font-mono">
            {payload.name} • {payload.module}
          </span>
          <div className="flex items-center gap-3">
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
            >
              {copied ? t.common.copied : t.common.copyJson}
            </ActionButton>
            <ActionButton
              variant="primary"
              size="sm"
              onClick={handleDownload}
              icon={<Download size={14} />}
            >
              {t.common.downloadJson}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
