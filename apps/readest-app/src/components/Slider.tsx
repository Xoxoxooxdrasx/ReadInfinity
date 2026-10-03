import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

interface SliderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  heightPx?: number;
  minLabel?: string;
  maxLabel?: string;
  minIcon?: React.ReactNode;
  maxIcon?: React.ReactNode;
  bubbleElement?: React.ReactNode;
  bubbleLabel?: string;
  className?: string;
  minClassName?: string;
  maxClassName?: string;
  bubbleClassName?: string;
  onChange?: (value: number) => void;
  valueToPosition?: (value: number, min: number, max: number) => number;
  positionToValue?: (position: number, min: number, max: number) => number;
}

const Slider: React.FC<SliderProps> = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  initialValue = 50,
  heightPx = 44,
  minLabel = '',
  maxLabel = '',
  minIcon,
  maxIcon,
  bubbleElement,
  bubbleLabel = '',
  className = '',
  minClassName = '',
  maxClassName = '',
  bubbleClassName = '',
  onChange,
  valueToPosition,
  positionToValue,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isRtl, setIsRtl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Default linear mapping functions
  const defaultValueToPosition = (val: number, minVal: number, maxVal: number) => {
    return ((val - minVal) / (maxVal - minVal)) * 100;
  };

  const defaultPositionToValue = (pos: number, minVal: number, maxVal: number) => {
    return minVal + (pos / 100) * (maxVal - minVal);
  };

  const valueToPos = valueToPosition || defaultValueToPosition;
  const posToValue = positionToValue || defaultPositionToValue;

  const handleChange = (e: React.ChangeEvent) => {
    const position = parseInt((e.target as HTMLInputElement).value, 10);
    const newValue = Math.round(posToValue(position, min, max) / step) * step;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    let node: HTMLElement | null = sliderRef.current;
    while (node) {
      if (node.getAttribute('dir') === 'rtl') {
        setIsRtl(true);
        break;
      }
      node = node.parentElement;
    }
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const percentage = valueToPos(value, min, max);
  const visualPercentage = (percentage / 100) * 95;

  return (
    <div
      ref={sliderRef}
      aria-label={label}
      className={clsx('slider mx-auto w-full select-none', className)}
      dir={isRtl ? 'rtl' : undefined}
    >
      <div className='relative' style={{ height: `${heightPx}px` }}>
        {/* M3 Inactive Track Surface */}
        <div className='absolute inset-0 h-full w-full rounded-full border border-neutral-300/40 bg-neutral-200/80 transition-colors dark:border-neutral-700/50 dark:bg-neutral-800/80' />

        {/* M3 Active Tonal / Primary Fill */}
        <div
          className='absolute h-full rounded-full bg-primary/20 dark:bg-primary/25 transition-all duration-75'
          style={{
            width:
              visualPercentage > 0
                ? `max(calc(${visualPercentage}% + ${heightPx / 2}px), ${heightPx}px)`
                : '0px',
            [isRtl ? 'right' : 'left']: 0,
          }}
        />

        {/* Min/Max Ambient Labels & Icons */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400'>
          {minIcon ? minIcon : <span className={clsx('ml-1', minClassName)}>{minLabel}</span>}
          {maxIcon ? maxIcon : <span className={clsx('mr-1', maxClassName)}>{maxLabel}</span>}
        </div>

        {/* M3 Floating Thumb Bubble Handle */}
        <div
          className='pointer-events-none absolute top-0 z-10 transition-transform duration-75'
          style={{
            [isRtl ? 'right' : 'left']: `max(${heightPx / 2}px, calc(${visualPercentage}%))`,
            transform: isRtl ? 'translateX(calc(50%))' : 'translateX(calc(-50%))',
            height: '100%',
          }}
        >
          <div
            className={clsx(
              'flex h-full items-center justify-center rounded-full text-xs font-semibold tracking-tight transition-all duration-150',
              'bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100',
              'border border-neutral-300/50 dark:border-neutral-700/60 shadow-md',
              isDragging && 'scale-105 shadow-lg ring-4 ring-primary/20',
              bubbleClassName,
            )}
            style={{ width: `${heightPx}px` }}
          >
            {bubbleElement || bubbleLabel}
          </div>
        </div>

        {/* Hidden Accessible Native Range Control */}
        <input
          type='range'
          min={0}
          max={100}
          step={step}
          value={percentage}
          className='slider-input absolute inset-0 h-full min-h-12 w-full cursor-pointer opacity-0'
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value}`}
          aria-orientation='horizontal'
        />
      </div>
    </div>
  );
};

export default Slider;