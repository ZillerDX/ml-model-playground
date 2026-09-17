import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// -------------------------------------------------------------
// 1. CUSTOM POPOVER SELECT (Ban on unstyled native <select>)
// -------------------------------------------------------------
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-ink-secondary tracking-wide uppercase">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 bg-surface-subtle hover:bg-surface-hover border border-border focus:border-accent-blue rounded-lg text-sm text-ink-primary transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
      >
        <span className="truncate font-medium">{selected?.label}</span>
        <ChevronDown
          size={16}
          className={`text-ink-muted transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-accent-blue' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 py-1 bg-surface border border-border rounded-lg shadow-2xl backdrop-blur-md max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150 ${
                  isSelected
                    ? 'bg-accent-blue/15 text-accent-blue font-semibold'
                    : 'text-ink-primary hover:bg-surface-hover'
                }`}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.description && (
                    <span className="text-xs text-ink-muted">{opt.description}</span>
                  )}
                </div>
                {isSelected && <Check size={16} className="text-accent-blue flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 2. PRECISION SLIDER (With Zero-Stuck Bug Prevention)
// -------------------------------------------------------------
interface PrecisionSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit?: string;
  isExplosionZone?: boolean;
  tooltip?: string;
}

export const PrecisionSlider: React.FC<PrecisionSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  isExplosionZone = false,
  tooltip,
}) => {
  const [textVal, setTextVal] = useState<string>(value.toString());

  useEffect(() => {
    setTextVal(value.toString());
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextVal(raw);
    if (raw === '') return;
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    setTextVal(num.toString());
    onChange(num);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-ink-secondary tracking-wide uppercase">{label}</span>
          {isExplosionZone && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-rose/15 text-accent-rose border border-accent-rose/30 font-medium">
              High Risk
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={textVal}
            onChange={handleTextChange}
            min={min}
            max={max}
            step={step}
            className="w-16 px-1.5 py-0.5 text-right font-mono text-xs tabular-nums bg-surface-subtle border border-border focus:border-accent-blue rounded text-ink-primary focus:outline-none"
          />
          {unit && <span className="text-ink-muted text-xs font-mono">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full cursor-pointer"
      />

      {tooltip && <span className="text-[11px] text-ink-muted leading-relaxed">{tooltip}</span>}
    </div>
  );
};

// -------------------------------------------------------------
// 3. ACTION BUTTON (4-State Micro-Interactions & Uniform Heights)
// -------------------------------------------------------------
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none whitespace-nowrap leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ground disabled:opacity-40 disabled:pointer-events-none';

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-11 px-5 text-base rounded-xl',
  };

  const variantClasses = {
    primary:
      'bg-accent-blue text-white hover:bg-accent-blueHover hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] shadow-md hover:shadow-accent-blue/30 font-semibold',
    secondary:
      'bg-surface-subtle text-ink-primary border border-border hover:bg-surface-hover hover:border-accent-blue/40 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98]',
    danger:
      'bg-accent-rose/15 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/25 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98]',
    ghost:
      'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0 size-4 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
