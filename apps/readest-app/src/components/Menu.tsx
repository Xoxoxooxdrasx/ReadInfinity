import clsx from 'clsx';
import React, { useRef } from 'react';
import { useKeyDownActions } from '@/hooks/useKeyDownActions';

interface MenuProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onCancel?: () => void;
}

const Menu: React.FC<MenuProps> = ({ children, className, style, onCancel }) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useKeyDownActions({ onCancel, elementRef: menuRef });

  return (
    <div
      ref={menuRef}
      role='none'
      className={clsx(
        // Core Layout & Sizing
        'menu-container max-h-[calc(100vh-96px)] overflow-y-auto',
        // Material 3 Surface & Shape
        'rounded-2xl p-1.5 shadow-xl transition-all duration-200',
        'bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xl',
        'border border-neutral-200/50 dark:border-neutral-800/60',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default Menu;