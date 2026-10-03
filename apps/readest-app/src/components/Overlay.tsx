import clsx from 'clsx';
import React from 'react';

interface OverlayProps {
  onDismiss: () => void;
  dismissLabel?: string;
  className?: string;
  /** Whether this mounted layer covers reader pixels and blocks native capture. */
  captureBlocking?: boolean;
}

export const Overlay: React.FC<OverlayProps> = ({
  onDismiss,
  className,
  captureBlocking = true,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDismiss();
    }
  };

  return (
    <div
      data-capture-blocking-overlay={captureBlocking ? 'true' : undefined}
      className={clsx(
        // Base Layout & Touch Target
        'overlay fixed inset-0 cursor-default transition-opacity duration-200 ease-out',
        // Default M3 Scrim (applied unless overridden by caller e.g. 'bg-transparent')
        !className?.includes('bg-') && 'bg-neutral-950/40 backdrop-blur-[1px]',
        className,
      )}
      role='none'
      // Pointer-only dismiss layer: hide it from screen readers so TalkBack /
      // VoiceOver don't land on an unlabeled full-screen node whose activation
      // dismisses the popup (Escape and the system back gesture still dismiss).
      aria-hidden='true'
      tabIndex={-1}
      onClick={onDismiss}
      onContextMenu={onDismiss}
      onKeyDown={handleKeyDown}
    />
  );
};