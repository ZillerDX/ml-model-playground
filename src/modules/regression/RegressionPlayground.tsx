import React, { useState } from 'react';
import { useRegressionStore } from '../../store/useRegressionStore';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { RegressionCanvas } from './RegressionCanvas';
import { RegressionControls } from './RegressionControls';
import { LossContour } from './LossContour';
import { LossCurve } from '../../components/common/LossCurve';
import { Code, HelpCircle, Activity, Compass } from 'lucide-react';
import { getTranslation } from '../../utils/i18n';

export const RegressionPlayground: React.FC = () => {
  const { lossHistory, isDiverged, weights, params } = useRegressionStore();
  const { locale } = usePlaygroundStore();
  const t = getTranslation(locale);

  const [activeMetricView, setActiveMetricView] = useState<'curve' | 'contour'>('curve');

  const formattedEquation = React.useMemo(() => {
    if (!weights || !weights.weights || weights.weights.length === 0) {
      return 'y = 0.0000x + 0.0000 (Untrained)';
    }

    const terms: string[] = [];
    weights.weights.forEach((w, idx) => {
      const pow = idx + 1;
      const coeff = w >= 0 ? `+ ${w.toFixed(3)}` : `- ${Math.abs(w).toFixed(3)}`;
      terms.push(`${coeff}x${pow > 1 ? `^${pow}` : ''}`);
    });

    const biasTerm =
      weights.bias >= 0
        ? `+ ${weights.bias.toFixed(3)}`
        : `- ${Math.abs(weights.bias).toFixed(3)}`;

    return `y = ${terms.join(' ')} ${biasTerm}`.replace(/^y = \+ /, 'y = ');
  }, [weights]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Visual Canvas & Learned Equation (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <RegressionCanvas />

        {/* Learned Parameters / Equation Card */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-ink-secondary">
              <Code size={14} className="text-accent-blue" />
              {t.regression.hypothesisTitle}
            </span>
            <span className="font-mono text-[11px]">Degree: {params.degree}</span>
          </div>
          <div className="p-3 bg-ground rounded-lg border border-border/70 font-mono text-sm text-accent-blue font-semibold overflow-x-auto select-all">
            {formattedEquation}
          </div>
        </div>
      </div>

      {/* Right Column: Controls, Loss Curve / Contour & Aha Moment Insight (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <RegressionControls />

        {/* View Switcher Bar for Metrics */}
        <div className="flex items-center justify-between p-1 bg-surface border border-border rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMetricView('curve')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeMetricView === 'curve'
                ? 'bg-accent-blue text-white shadow-sm font-semibold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
            }`}
          >
            <Activity size={14} />
            <span>{t.regression.lossHistoryTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricView('contour')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeMetricView === 'contour'
                ? 'bg-accent-blue text-white shadow-sm font-semibold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
            }`}
          >
            <Compass size={14} />
            <span>{t.regression.lossContourTab}</span>
          </button>
        </div>

        {/* Dynamic Metric Display */}
        {activeMetricView === 'curve' ? (
          <LossCurve
            history={lossHistory}
            isDiverged={isDiverged}
            title={t.regression.lossHistoryTab}
          />
        ) : (
          <LossContour />
        )}

        {/* Aha Moment Intuition Box */}
        <div className="bg-surface-subtle border border-border rounded-xl p-4 flex items-start gap-3 text-xs">
          <HelpCircle size={18} className="text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary font-medium">Gradient Descent Intuition:</strong>
            <p>
              {locale === 'th'
                ? 'ลองปรับ Learning Rate (α) ให้เกิน 0.15 ร่วมกับพหุนามดีกรีสูง คุณจะเห็นค่า Loss ระเบิดเป็นล้านหรือกลายเป็น NaN ทันที'
                : 'Try turning the Learning Rate (α) up above 0.15 with higher polynomial degree. You will see the loss spike into millions or become NaN.'}
            </p>
            <p className="mt-1">
              {locale === 'th'
                ? 'กด "จำลองจุดรบกวน (Inject Outliers)" เพื่อดูว่า L2 MSE ดึงเส้นโค้งจนเสียทรงอย่างไร และกด "กรองจุดผิดปกติ (Filter Outliers)" เพื่อดูการฟื้นตัว'
                : 'Click "Inject Outliers" to observe how L2 squared error warps the curve, then click "Filter Outliers" to watch it recover.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
