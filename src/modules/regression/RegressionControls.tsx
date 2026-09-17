import React, { useMemo } from 'react';
import { useRegressionStore } from '../../store/useRegressionStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import {
  CustomSelect,
  PrecisionSlider,
  ActionButton,
  SelectOption,
} from '../../components/common/CustomControls';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Sparkles,
  Zap,
  Filter,
  Upload,
} from 'lucide-react';
import { getTranslation } from '../../utils/i18n';
import { detectOutliers } from '../../utils/datasetGenerators';

export const RegressionControls: React.FC = () => {
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
  } = useRegressionStore();

  const { locale, openImportModal, setNotification } = usePlaygroundStore();
  const t = getTranslation(locale);

  // Compute live outlier count
  const outlierCount = useMemo(() => {
    return detectOutliers(dataset).size;
  }, [dataset]);

  const handleFilterOutliers = () => {
    const { removedCount } = removeOutliers();
    if (removedCount > 0) {
      setNotification({
        title: 'Outliers Filtered',
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
    { value: 'linear', label: t.regression.datasets.linear, description: t.regression.datasets.linearDesc },
    { value: 'quadratic', label: t.regression.datasets.quadratic, description: t.regression.datasets.quadraticDesc },
    { value: 'sine', label: t.regression.datasets.sine, description: t.regression.datasets.sineDesc },
    { value: 'stock', label: t.regression.datasets.stock, description: t.regression.datasets.stockDesc },
  ];

  const optimizerOptions: SelectOption[] = [
    { value: 'adam', label: 'Adam', description: 'Adaptive moment estimation' },
    { value: 'sgd', label: 'SGD', description: 'Stochastic gradient descent' },
    { value: 'momentum', label: 'Momentum', description: 'SGD with 0.9 momentum' },
  ];

  const regularizationOptions: SelectOption[] = [
    { value: 'none', label: t.regression.regTypes.none, description: t.regression.regTypes.noneDesc },
    { value: 'l1', label: t.regression.regTypes.l1, description: t.regression.regTypes.l1Desc },
    { value: 'l2', label: t.regression.regTypes.l2, description: t.regression.regTypes.l2Desc },
  ];

  // Highlight high-risk explosion zone
  const isHighRisk = params.learningRate > 0.15 || (params.degree >= 3 && params.learningRate > 0.08);

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl p-5 gap-5 shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="text-accent-blue" size={18} />
          <h2 className="text-sm font-semibold text-ink-primary tracking-wide uppercase">
            {t.regression.title}
          </h2>
        </div>

        {/* Dataset Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV */}
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => openImportModal('regression')}
            icon={<Upload size={14} />}
            title={t.common.importCsv}
          >
            CSV
          </ActionButton>

          {/* Remove / Filter Outliers */}
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

          {/* Inject Outliers */}
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

      {/* Dataset & Optimizer Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label={t.regression.datasetLabel}
          value={datasetType}
          options={datasetOptions}
          onChange={(val) => setDatasetType(val as any)}
        />
        <CustomSelect
          label={t.regression.optimizerLabel}
          value={params.optimizer}
          options={optimizerOptions}
          onChange={(val) => updateParams({ optimizer: val as any })}
        />
      </div>

      {/* Sliders Grid */}
      <div className="flex flex-col gap-4">
        {/* Polynomial Degree */}
        <PrecisionSlider
          label={t.regression.degreeLabel}
          value={params.degree}
          min={1}
          max={5}
          step={1}
          onChange={(val) => updateParams({ degree: Math.round(val) })}
          tooltip={t.regression.degreeTooltip}
        />

        {/* Learning Rate with Explosion Cue */}
        <PrecisionSlider
          label={t.regression.lrLabel}
          value={params.learningRate}
          min={0.001}
          max={0.5}
          step={0.005}
          isExplosionZone={isHighRisk}
          onChange={(val) => updateParams({ learningRate: Number(val.toFixed(3)) })}
          tooltip={
            isHighRisk
              ? t.regression.lrExplosionWarning
              : t.regression.lrTooltip
          }
        />

        {/* Total Epochs */}
        <PrecisionSlider
          label={t.regression.epochsLabel}
          value={params.epochs}
          min={20}
          max={500}
          step={10}
          onChange={(val) => updateParams({ epochs: Math.round(val) })}
          tooltip={t.regression.epochsTooltip}
        />

        {/* Regularization Type & Strength */}
        <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border/60">
          <CustomSelect
            label={t.regression.regularizationLabel}
            value={params.regularization || 'none'}
            options={regularizationOptions}
            onChange={(val) => updateParams({ regularization: val as any })}
          />

          {params.regularization && params.regularization !== 'none' && (
            <PrecisionSlider
              label={t.regression.regStrengthLabel}
              value={params.regStrength || 0.01}
              min={0.001}
              max={0.15}
              step={0.005}
              onChange={(val) => updateParams({ regStrength: Number(val.toFixed(3)) })}
              tooltip={t.regression.regStrengthTooltip}
            />
          )}
        </div>
      </div>

      {/* Training Playback Bar */}
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
