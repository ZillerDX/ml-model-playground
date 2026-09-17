import React from 'react';
import { Network } from 'lucide-react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

interface NetworkGraphProps {
  hiddenLayers: number[];
  activation: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ hiddenLayers, activation }) => {
  const theme = usePlaygroundStore((s) => s.theme);
  const isDark = theme === 'dark';
  const layerStructure = [2, ...hiddenLayers, 1];

  const width = 340;
  const height = 120;
  const xSpacing = width / (layerStructure.length + 1);

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl p-3.5 gap-2 shadow-md">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-ink-primary font-semibold tracking-wide uppercase">
          <Network size={15} className="text-accent-coral" />
          <span>Network Architecture</span>
        </div>
        <span className="font-mono text-[11px] text-accent-coral px-2 py-0.5 rounded bg-accent-coral/10 border border-accent-coral/20">
          Activation: {activation.toUpperCase()}
        </span>
      </div>

      <div className="w-full flex items-center justify-center bg-ground/60 rounded-lg p-2 border border-border/60">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[100px] overflow-visible">
          {/* Synapses / Connections */}
          {layerStructure.slice(0, -1).map((currentCount, lIdx) => {
            const nextCount = layerStructure[lIdx + 1];
            const x1 = (lIdx + 1) * xSpacing;
            const x2 = (lIdx + 2) * xSpacing;

            return Array.from({ length: currentCount }).map((_, i) => {
              const y1 = ((i + 1) / (currentCount + 1)) * height;
              return Array.from({ length: nextCount }).map((_, j) => {
                const y2 = ((j + 1) / (nextCount + 1)) * height;
                return (
                  <line
                    key={`syn_${lIdx}_${i}_${j}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isDark ? '#244771' : '#DBE2EF'}
                    strokeWidth="1.25"
                    opacity="0.85"
                  />
                );
              });
            });
          })}

          {/* Neurons */}
          {layerStructure.map((count, lIdx) => {
            const x = (lIdx + 1) * xSpacing;
            const isInput = lIdx === 0;
            const isOutput = lIdx === layerStructure.length - 1;

            return Array.from({ length: count }).map((_, nIdx) => {
              const y = ((nIdx + 1) / (count + 1)) * height;
              const color = isInput ? '#3F72AF' : isOutput ? (isDark ? '#5B8EC9' : '#112D4E') : '#3F72AF';

              return (
                <g key={`neu_${lIdx}_${nIdx}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={7}
                    fill={isDark ? '#0B192C' : '#FFFFFF'}
                    stroke={color}
                    strokeWidth="2"
                  />
                  <circle cx={x} cy={y} r={3} fill={color} />
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};
