import React from 'react';
import { useClassificationStore } from '../../store/useClassificationStore';
import { DecisionBoundaryCanvas } from './DecisionBoundaryCanvas';
import { NetworkGraph } from './NetworkGraph';
import { ClassificationControls } from './ClassificationControls';
import { LossCurve } from '../../components/common/LossCurve';
import { HelpCircle } from 'lucide-react';

export const ClassificationPlayground: React.FC = () => {
  const { lossHistory, isDiverged, params } = useClassificationStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Canvas & Architecture Visualizer (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <DecisionBoundaryCanvas />
        <NetworkGraph hiddenLayers={params.hiddenLayers} activation={params.activation} />
      </div>

      {/* Right Column: Controls, Loss/Accuracy Curves & Aha Moment (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <ClassificationControls />

        <LossCurve
          history={lossHistory}
          isDiverged={isDiverged}
          title="Binary Cross-Entropy & Accuracy"
          showAccuracy={true}
        />

        {/* Aha Moment Box */}
        <div className="bg-surface-subtle border border-border rounded-xl p-4 flex items-start gap-3 text-xs">
          <HelpCircle size={18} className="text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary font-medium">
              Decision Boundary Intuition:
            </strong>
            <p>
              Switch topology to <span className="text-accent-blue font-medium">Perceptron (0 Layers)</span> on the <span className="text-accent-blue font-medium">Concentric Circles</span> dataset. Notice how a single layer can only draw a straight line and gets stuck at ~50% accuracy!
            </p>
            <p className="mt-1">
              Then switch to <span className="text-accent-emerald font-medium">2 Hidden Layers</span>: watch how non-linear activations warp the space into a closed circular decision island.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
