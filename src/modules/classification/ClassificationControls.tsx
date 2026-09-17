import React, { useMemo } from 'react';
import { useClassificationStore } from '../../store/useClassificationStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import {
  CustomSelect,
  PrecisionSlider,
  ActionButton,
  SelectOption,
} from '../../components/common/CustomControls';
import { Play, Pause, RotateCcw, StepForward, Sparkles, Sliders, Filter, Upload } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';
import { detectOutliers } from '../../utils/datasetGenerators';

export const ClassificationControls: React.FC = () => {
  const {
    dataset,
    datasetType,
    params,
    isRunning,
    setDatasetType,
    updateParams,
    injectNoise,
    removeOutliers,
    startTraining,
    pauseTraining,
    stepTraining,
    resetTraining,
  } = useClassificationStore();

  const { locale, openImportModal, setNotification } = usePlaygroundStore();
  const t = getTranslation(locale);

  const outlierCount = useMemo(() => {
    return detectOutliers(dataset).size;
  }, [dataset]);

  const handleFilterOutliers = () => {
    const { removedCount } = removeOutliers();
    if (removedCount > 0) {
      setNotification({
        title: 'Noise Filtered',
        message: t.notifications.outliersRemoved.replace('{count}', String(removedCount)),
        type: 'info',
      });
    } else {
      setNotification({
        title: 'Information',
        message: t.notifications.noOutliers,
        type: 'info',
      });
    }
  };

  const datasetOptions: SelectOption[] = [
    { value: 'circles', label: t.classification.datasets.circles, description: t.classification.datasets.circlesDesc },
    { value: 'moons', label: t.classification.datasets.moons, description: t.classification.datasets.moonsDesc },
    { value: 'spiral', label: t.classification.datasets.spiral, description: t.classification.datasets.spiralDesc },
    { value: 'blobs', label: t.classification.datasets.blobs, description: t.classification.datasets.blobsDesc },
  ];

  const architectureOptions: SelectOption[] = [
    { value: '6,6', label: '2 Hidden Layers (6, 6)', description: 'Balanced capacity' },
    { value: '4', label: '1 Hidden Layer (4)', description: 'Lightweight representation' },
    { value: '8,8,4', label: '3 Deep Layers (8, 8, 4)', description: 'High representation capacity' },
    { value: 'none', label: 'Perceptron (0 Layers)', description: 'Linear decision boundary only' },
  ];

  const activationOptions: SelectOption[] = [
    { value: 'tanh', label: 'Tanh (Hyperbolic Tangent)', description: 'Zero-centered [-1, 1]' },
    { value: 'relu', label: 'ReLU (Rectified Linear)', description: 'Fast convergence' },
    { value: 'sigmoid', label: 'Sigmoid', description: 'Smooth [0, 1] range' },
  ];

  const optimizerOptions: SelectOption[] = [
    { value: 'adam', label: 'Adam', description: 'Adaptive moment estimation' },
    { value: 'sgd', label: 'SGD', description: 'Standard stochastic gradient' },
  ];

  const currentArchKey =
    params.hiddenLayers.length === 0 ? 'none' : params.hiddenLayers.join(',');

  const handleArchChange = (val: string) => {
    if (val === 'none') {
      updateParams({ hiddenLayers: [] });
    } else {
      const layers = val.split(',').map(Number);
      updateParams({ hiddenLayers: layers });
    }
  };

  const isHighRisk = params.learningRate > 0.15 && params.activation === 'relu';

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl p-5 gap-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="text-accent-blue" size={18} />
          <h2 className="text-sm font-semibold text-ink-primary tracking-wide uppercase">
            {t.classification.title}
          </h2>
        </div>

        {/* Dataset Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV */}
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => openImportModal('classification')}
            icon={<Upload size={14} />}
            title={t.common.importCsv}
          >
            CSV
          </ActionButton>

          {/* Filter Outliers */}
          <ActionButton
            variant="secondary"
            size="sm"
            disabled={outlierCount === 0}
            onClick={handleFilterOutliers}
            icon={<Filter size={14} className={outlierCount > 0 ? 'text-[#E25B45]' : ''} />}
            title={t.common.removeOutliers}
          >
            {t.common.removeOutliersBadge} {outlierCount > 0 && `(${outlierCount})`}
          </ActionButton>

          {/* Inject Noise */}
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={injectNoise}
            icon={<Sparkles size={14} className="text-accent-blue" />}
          >
            {t.common.injectOutliers}
          </ActionButton>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label={t.classification.datasetLabel}
          value={datasetType}
          options={datasetOptions}
          onChange={(val) => setDatasetType(val as any)}
        />
        <CustomSelect
          label={t.classification.topologyLabel}
          value={currentArchKey}
          options={architectureOptions}
          onChange={handleArchChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label={t.classification.activationLabel}
          value={params.activation}
          options={activationOptions}
          onChange={(val) => updateParams({ activation: val as any })}
        />
        <CustomSelect
          label={t.classification.optimizerLabel}
          value={params.optimizer}
          options={optimizerOptions}
          onChange={(val) => updateParams({ optimizer: val as any })}
        />
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        <PrecisionSlider
          label={t.classification.lrLabel}
          value={params.learningRate}
          min={0.005}
          max={0.3}
          step={0.005}
          isExplosionZone={isHighRisk}
          onChange={(val) => updateParams({ learningRate: Number(val.toFixed(3)) })}
          tooltip={
            isHighRisk
              ? '⚠️ High learning rate on ReLU may cause Dying ReLU or severe gradient oscillation.'
              : 'Weight adjustment multiplier per backward propagation step.'
          }
        />

        <PrecisionSlider
          label={t.classification.epochsLabel}
          value={params.epochs}
          min={30}
          max={400}
          step={10}
          onChange={(val) => updateParams({ epochs: Math.round(val) })}
          tooltip="Total training cycles over the 2D coordinate dataset."
        />
      </div>

      {/* Playback Action Bar */}
      <div className="pt-2 border-t border-border flex items-center gap-2.5">
        {isRunning ? (
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={pauseTraining}
            icon={<Pause size={15} />}
          >
            {t.common.pause}
          </ActionButton>
        ) : (
          <ActionButton
            variant="primary"
            className="flex-1"
            onClick={startTraining}
            icon={<Play size={15} />}
          >
            {t.common.train}
          </ActionButton>
        )}

        <ActionButton
          variant="secondary"
          disabled={isRunning}
          onClick={stepTraining}
          icon={<StepForward size={15} />}
          title={t.common.stepTooltip}
        >
          {t.common.step}
        </ActionButton>

        <ActionButton
          variant="ghost"
          onClick={resetTraining}
          icon={<RotateCcw size={15} />}
          title={t.common.resetTooltip}
        >
          {t.common.reset}
        </ActionButton>
      </div>
    </div>
  );
};
