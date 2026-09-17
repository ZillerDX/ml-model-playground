import React from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { PlaygroundTab } from '../../types/playground';
import { workerBridge } from '../../workers/workerBridge';
import { LineChart, Binary, Compass, Download, Sun, Moon, Languages } from 'lucide-react';
import { ActionButton } from './CustomControls';
import { getTranslation } from '../../utils/i18n';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme, locale, toggleLocale } = usePlaygroundStore();
  const t = getTranslation(locale);

  const handleExport = () => {
    workerBridge.post({ type: 'EXPORT_WEIGHTS' });
  };

  const tabs: { id: PlaygroundTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'regression',
      label: t.header.tabRegression,
      icon: <LineChart size={16} />,
      desc: t.header.tabRegressionDesc,
    },
    {
      id: 'classification',
      label: t.header.tabClassification,
      icon: <Binary size={16} />,
      desc: t.header.tabClassificationDesc,
    },
    {
      id: 'clustering',
      label: t.header.tabClustering,
      icon: <Compass size={16} />,
      desc: t.header.tabClusteringDesc,
    },
  ];

  return (
    <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-accent-blue shadow-sm">
            <svg
              className="w-5 h-5 text-accent-blue"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3m12 0h3M12 3v3m0 12v3" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-normal text-ink-primary flex items-center gap-2">
              {t.header.title}
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-ink-secondary">
                {t.header.studioBadge}
              </span>
            </h1>
            <p className="text-[11px] text-ink-muted">
              {t.header.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Navigation Tabs + Export Action + Language Switcher + Dark/Light Mode Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Module Navigation Tabs */}
          <nav className="flex items-center p-1 bg-surface-subtle border border-border rounded-xl shadow-inner">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.desc}
                  className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium transition-all duration-150 select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-accent-blue text-white shadow-md font-semibold'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Export Weights Button */}
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={<Download size={14} className="text-accent-blue" />}
          >
            {t.header.exportWeights}
          </ActionButton>

          {/* Language Toggle (EN / TH) */}
          <button
            type="button"
            onClick={toggleLocale}
            title={t.header.langToggle}
            aria-label="Switch language"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-surface-subtle border border-border text-xs font-semibold text-ink-secondary hover:text-accent-blue hover:bg-surface-hover transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue whitespace-nowrap"
          >
            <Languages size={15} className="text-accent-blue" />
            <span className="font-mono tracking-wider">{locale.toUpperCase()}</span>
          </button>

          {/* Theme Mode Toggle (Icon at Top Right) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? t.header.themeToggleLight : t.header.themeToggleDark}
            aria-label="Toggle theme mode"
            className="size-8 flex items-center justify-center rounded-xl bg-surface-subtle border border-border text-ink-secondary hover:text-accent-blue hover:bg-surface-hover transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
            ) : (
              <Moon size={16} className="text-accent-blue hover:-rotate-12 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
