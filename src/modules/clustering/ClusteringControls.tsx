import React, { useMemo } from 'react';
import { useClusteringStore } from '../../store/useClusteringStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import {
  CustomSelect,
  PrecisionSlider,
  ActionButton,
  SelectOption,
} from '../../components/common/CustomControls';
import { Play, Pause, RotateCcw, StepForward, Sparkles, Compass, Filter, Upload } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';
import { detectOutliers } from '../../utils/datasetGenerators';

export const ClusteringControls: React.FC = () => {
  const {
    dataset,
    datasetType,
    params,
    isRunning,
    converged,
    setDatasetType,
    updateParams,
    injectNoise,
    removeOutliers,
    initKMeans,
    stepKMeans,
    autoRun,
    pauseAutoRun,
  } = useClusteringStore();

  const { locale, openImportModal, setNotification } = usePlaygroundStore();
  const t = getTranslation(locale);

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
    { value: 'gaussian_clusters', label: t.clustering.datasets.gaussian, description: t.clustering.datasets.gaussianDesc },
    { value: 'anisotropic', label: t.clustering.datasets.anisotropic, description: t.clustering.datasets.anisotropicDesc },
    { value: 'varied_density', label: t.clustering.datasets.varied, description: t.clustering.datasets.variedDesc },
  ];

  const initOptions: SelectOption[] = [
    { value: 'kmeans++', label: t.clustering.initKMeansPlus, description: 'Distance-weighted seed selection' },
    { value: 'random', label: t.clustering.initRandom, description: 'Arbitrary point initialisation' },
  ];

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl p-5 gap-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Compass className="text-accent-blue" size={18} />
          <h2 className="text-sm font-semibold text-ink-primary tracking-wide uppercase">
            {t.clustering.title}
          </h2>
        </div>

        {/* Dataset Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV */}
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => openImportModal('clustering')}
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

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomSelect
          label={t.clustering.datasetLabel}
          value={datasetType}
          options={datasetOptions}
          onChange={(val) => setDatasetType(val as any)}
        />
        <CustomSelect
          label={t.clustering.initLabel}
          value={params.initMethod}
          options={initOptions}
          onChange={(val) => updateParams({ initMethod: val as any })}
        />
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        <PrecisionSlider
          label={t.clustering.kLabel}
          value={params.k}
          min={2}
          max={8}
          step={1}
          onChange={(val) => updateParams({ k: Math.round(val) })}
          tooltip={t.clustering.kTooltip}
        />

        <PrecisionSlider
          label="Step Delay (Speed)"
          value={params.stepDelayMs}
          min={100}
          max={800}
          step={50}
          unit="ms"
          onChange={(val) => updateParams({ stepDelayMs: Math.round(val) })}
          tooltip="Delay between auto-iterations for visual observation."
        />
      </div>

      {/* Action Bar */}
      <div className="pt-2 border-t border-border flex items-center gap-2.5">
        {isRunning ? (
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={pauseAutoRun}
            icon={<Pause size={15} />}
          >
            {t.clustering.pauseAuto}
          </ActionButton>
        ) : (
          <ActionButton
            variant="primary"
            className="flex-1"
            disabled={converged}
            onClick={autoRun}
            icon={<Play size={15} />}
          >
            {converged ? 'Converged' : t.clustering.startAuto}
          </ActionButton>
        )}

        <ActionButton
          variant="secondary"
          disabled={isRunning || converged}
          onClick={stepKMeans}
          icon={<StepForward size={15} />}
          title={t.clustering.nextStep}
        >
          {t.common.step}
        </ActionButton>

        <ActionButton
          variant="ghost"
          onClick={initKMeans}
          icon={<RotateCcw size={15} />}
          title={t.clustering.resetCentroids}
        >
          {t.common.reset}
        </ActionButton>
      </div>
    </div>
  );
};
