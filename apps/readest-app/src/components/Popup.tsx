import clsx from 'clsx';
import { Position, isPointInRect } from '@/utils/sel';
import { useEffect, useRef, useState } from 'react';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useKeyDownActions } from '@/hooks/useKeyDownActions';

const getTriangleStyles = (
  trianglePosition: Position | undefined,
  size: number,
  offset: number,
): React.CSSProperties => {
  if (!trianglePosition) {
    return { left: '-999px', top: '-999px' };
  }

  const { dir, point } = trianglePosition;

  let topOffset = 0;
  let leftOffset = 0;
  switch (dir) {
    case 'up':
      topOffset = offset;
      break;
    case 'down':
      topOffset = -offset;
      break;
    case 'left':
      leftOffset = offset;
      break;
    case 'right':
      leftOffset = -offset;
      break;
  }

  return {
    left: `${point.x + leftOffset}px`,
    top: `${point.y + topOffset}px`,
    borderLeft:
      dir === 'right' ? 'none' : dir === 'left' ? `${size}px solid` : `${size}px solid transparent`,
    borderRight:
      dir === 'left' ? 'none' : dir === 'right' ? `${size}px solid` : `${size}px solid transparent`,
    borderTop:
      dir === 'down' ? 'none' : dir === 'up' ? `${size}px solid` : `${size}px solid transparent`,
    borderBottom:
      dir === 'up' ? 'none' : dir === 'down' ? `${size}px solid` : `${size}px solid transparent`,
    transform: dir === 'left' || dir === 'right' ? 'translateY(-50%)' : 'translateX(-50%)',
  };
};

const Popup = ({
  width,
  height,
  minHeight,
  maxHeight,
  position,
  trianglePosition,
  children,
  className = '',
  additionalStyle = {},
  isOpen = true,
  onDismiss,
}: {
  isOpen?: boolean;
  width: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  position?: Position;
  trianglePosition?: Position;
  children: React.ReactNode;
  className?: string;
  additionalStyle?: React.CSSProperties;
  onDismiss?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [childrenHeight, setChildrenHeight] = useState(height || minHeight || 0);

  useKeyDownActions({ onCancel: onDismiss, elementRef: containerRef, enabled: isOpen });

  const popupPadding = useResponsiveSize(10);
  let availableHeight = window.innerHeight - 2 * popupPadding;
  if (trianglePosition?.dir === 'up') {
    availableHeight = trianglePosition.point.y - popupPadding;
  } else if (trianglePosition?.dir === 'down') {
    availableHeight = window.innerHeight - trianglePosition.point.y - popupPadding;
  }
  maxHeight = Math.min(maxHeight || availableHeight, availableHeight);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (newHeight !== childrenHeight) {
          setChildrenHeight(newHeight);
          return;
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!position || !trianglePosition || position.dir !== 'up') {
      setAdjustedPosition(position);
      return;
    }
    const containerHeight = childrenHeight || containerRef.current.offsetHeight;
    const newPosition = {
      ...position,
      point: {
        ...position.point,
        y: Math.max(popupPadding, trianglePosition.point.y - containerHeight),
      },
    };
    setAdjustedPosition(newPosition);
  }, [position, trianglePosition, popupPadding, childrenHeight]);

  const triangleSize = 8;
  const outerTriangleStyles = getTriangleStyles(trianglePosition, triangleSize, 0);
  const innerTriangleStyles = getTriangleStyles(trianglePosition, triangleSize, -1);

  const popupHeight = height ?? childrenHeight;
  const triangleHidden = !!(
    adjustedPosition &&
    trianglePosition &&
    isPointInRect(trianglePosition.point, {
      left: adjustedPosition.point.x,
      top: adjustedPosition.point.y,
      right: adjustedPosition.point.x + width,
      bottom: adjustedPosition.point.y + popupHeight,
    })
  );

  return (
    <div>
      {/* Outer Triangle (Border stroke & shadow) */}
      {trianglePosition && (
        <div
          className={clsx(
            'popup-triangle-outer absolute z-50 text-neutral-300/60 dark:text-neutral-700/60',
            triangleHidden ? 'invisible' : 'not-eink:drop-shadow-lg visible',
          )}
          style={outerTriangleStyles}
        />
      )}

      {/* M3 Floating Popup Surface */}
      <div
        id='popup-container'
        ref={containerRef}
        aria-hidden={!isOpen}
        data-capture-blocking-overlay={isOpen ? 'true' : undefined}
        className={clsx(
          // M3 Container Shape & Elevation
          'popup-container absolute z-50 rounded-2xl font-sans transition-all duration-200',
          'bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-2xl text-neutral-900 dark:text-neutral-100',
          'border border-neutral-200/50 dark:border-neutral-800/60 shadow-2xl',
          className,
        )}
        style={{
          width: `${width}px`,
          height: height ? `${height}px` : 'auto',
          minHeight: minHeight ? `${minHeight}px` : 'none',
          maxHeight: maxHeight ? `${maxHeight}px` : 'none',
          left: `${adjustedPosition ? adjustedPosition.point.x : -999}px`,
          top: `${adjustedPosition ? adjustedPosition.point.y : -999}px`,
          ...additionalStyle,
        }}
      >
        {children}
      </div>

      {/* Inner Triangle (Surface fill matching M3 container background) */}
      {trianglePosition && (
        <div
          className={clsx(
            'popup-triangle-inner absolute z-50 text-neutral-50 dark:text-neutral-900',
            triangleHidden ? 'invisible' : 'visible',
          )}
          style={innerTriangleStyles}
        />
      )}
    </div>
  );
};

export default Popup;