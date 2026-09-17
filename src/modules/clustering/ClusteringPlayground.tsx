import React, { useEffect } from 'react';
import { useClusteringStore } from '../../store/useClusteringStore';
import { ClusteringCanvas } from './ClusteringCanvas';
import { ClusteringControls } from './ClusteringControls';
import { InertiaChart } from './InertiaChart';
import { HelpCircle, Target } from 'lucide-react';

export const ClusteringPlayground: React.FC = () => {
  const { centroids, inertiaHistory, converged, initKMeans } = useClusteringStore();

  useEffect(() => {
    // Initialise K-Means when playground mounts
    if (centroids.length === 0) {
      initKMeans();
    }
  }, [centroids.length, initKMeans]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Canvas & Centroid Table (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <ClusteringCanvas />

        {/* Centroids Coordinate Table */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-ink-secondary">
              <Target size={14} className="text-accent-coral" />
              Active Centroid Coordinates
            </span>
            <span className="font-mono text-[11px]">{centroids.length} Clusters</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {centroids.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-ground/50 border border-border/70 text-xs"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <div className="flex flex-col font-mono text-[11px] leading-tight">
                  <span className="text-ink-secondary font-semibold">Cluster {c.id + 1}</span>
                  <span className="text-ink-muted">
                    ({c.x.toFixed(2)}, {c.y.toFixed(2)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Controls, Inertia Chart & Aha Moment (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <ClusteringControls />

        <InertiaChart history={inertiaHistory} converged={converged} />

        {/* Aha Moment Box */}
        <div className="bg-surface-subtle border border-border rounded-xl p-4 flex items-start gap-3 text-xs">
          <HelpCircle size={18} className="text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary font-medium">K-Means Centroid Intuition:</strong>
            <p>
              Click <span className="text-accent-blue font-medium">Step</span> repeatedly to observe the two phases of Lloyd's Algorithm in action:
            </p>
            <ol className="list-decimal pl-4 space-y-1 mt-1">
              <li>Points find their closest centroid (Voronoi partition).</li>
              <li>Centroids shift to the geometric average of their members.</li>
            </ol>
            <p className="mt-1">
              Select <span className="text-accent-orange font-medium">Anisotropic Clusters</span> to see where standard K-means fails: because it assumes spherical clusters, elongated patterns get split incorrectly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
