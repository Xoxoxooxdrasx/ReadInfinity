import clsx from 'clsx';
import React, {
  useState,
  isValidElement,
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useRef,
  useId,
} from 'react';
import { useDropdownContext } from '@/context/DropdownContext';
import { Overlay } from './Overlay';
import MenuItem from './MenuItem';

interface DropdownProps {
  label: string;
  className?: string;
  menuClassName?: string;
  buttonClassName?: string;
  containerClassName?: string;
  toggleButton: React.ReactNode;
  children: ReactElement<{
    setIsDropdownOpen: (isOpen: boolean) => void;
    menuClassName?: string;
    children: ReactNode;
  }>;
  disabled?: boolean;
  onToggle?: (isOpen: boolean) => void;
  showTooltip?: boolean;
}

type MenuItemProps = {
  setIsDropdownOpen?: (open: boolean) => void;
};

const MENU_VIEWPORT_PADDING = 16;

const enhanceMenuItems = (
  children: ReactNode,
  setIsDropdownOpen: (isOpen: boolean) => void,
): ReactNode => {
  const processNode = (node: ReactNode): ReactNode => {
    if (!isValidElement(node)) {
      return node;
    }

    const element = node as React.ReactElement<React.PropsWithChildren<MenuItemProps>>;
    const isMenuItem =
      element.type === MenuItem ||
      (typeof element.type === 'function' && element.type.name === 'MenuItem');

    const clonedElement = isMenuItem
      ? React.cloneElement(element, {
          setIsDropdownOpen,
          ...element.props,
        })
      : element;

    if (clonedElement.props?.children) {
      return React.cloneElement(clonedElement, {
        ...clonedElement.props,
        children: React.Children.map(clonedElement.props.children, processNode),
      });
    }

    return clonedElement;
  };

  return React.Children.map(children, processNode);
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  className,
  menuClassName,
  buttonClassName,
  containerClassName,
  toggleButton,
  children,
  disabled,
  onToggle,
  showTooltip = true,
}) => {
  const dropdownId = useId();
  const context = useDropdownContext();
  const isOpen = context ? context.openDropdownId === dropdownId : false;
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Measure the open menu and shift it back inside the viewport boundaries
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const content = detailsRef.current?.querySelector<HTMLElement>(':scope > :not(summary)');
    if (!content) return undefined;
    const clamp = () => {
      content.style.transform = '';
      const rect = content.getBoundingClientRect();
      let dx = 0;
      if (rect.right > window.innerWidth - MENU_VIEWPORT_PADDING) {
        dx = window.innerWidth - MENU_VIEWPORT_PADDING - rect.right;
      }
      if (rect.left + dx < MENU_VIEWPORT_PADDING) {
        dx = MENU_VIEWPORT_PADDING - rect.left;
      }
      if (dx !== 0) {
        content.style.transform = `translateX(${dx}px)`;
      }
    };
    clamp();
    window.addEventListener('resize', clamp);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(clamp) : null;
    observer?.observe(content);
    return () => {
      window.removeEventListener('resize', clamp);
      observer?.disconnect();
      content.style.transform = '';
    };
  }, [isOpen]);

  const setIsDropdownOpen = (open: boolean) => {
    if (disabled) return;
    if (context) {
      if (open) {
        context.openDropdown(dropdownId);
      } else {
        context.closeDropdown(dropdownId);
      }
    }
    onToggle?.(open);
  };

  const toggleDropdown = () => {
    setIsFocused(!isOpen);
    setIsDropdownOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      e.stopPropagation();
    }
  };

  const childrenWithToggle = isValidElement(children)
    ? React.cloneElement(children, {
        ...(typeof children.type !== 'string' && {
          setIsDropdownOpen,
          menuClassName: clsx(
            // M3 Floating Menu Elevation & Appearance
            'rounded-2xl shadow-xl bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-800/60 p-1.5',
            'animate-in fade-in zoom-in-95 duration-150 ease-out',
            menuClassName,
          ),
        }),
        children: enhanceMenuItems(children.props?.children, setIsDropdownOpen),
      })
    : children;

  return (
    <div ref={containerRef} className={clsx('dropdown-container flex', containerClassName)}>
      {isOpen && (
        <Overlay 
          className='bg-transparent' 
          onDismiss={() => setIsDropdownOpen(false)} 
        />
      )}
      <div className={clsx('relative', isOpen && 'z-50')}>
        <button
          tabIndex={0}
          aria-haspopup='menu'
          aria-expanded={isOpen}
          aria-label={label}
          title={showTooltip ? label : undefined}
          className={clsx(
            'dropdown-toggle touch-target relative inline-flex items-center justify-center rounded-full transition-all duration-200',
            // M3 State layer on toggle active
            isOpen ? 'bg-neutral-500/15 dark:bg-neutral-300/20' : 'hover:bg-neutral-500/10 active:bg-neutral-500/20 dark:hover:bg-neutral-400/15',
            buttonClassName,
          )}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
        >
          {toggleButton}
        </button>
        <details
          ref={detailsRef}
          open={isOpen}
          role='none'
          className={clsx('dropdown flex items-center justify-center', className)}
        >
          <summary aria-hidden='true' tabIndex={-1} className='list-none' />
          {isOpen && childrenWithToggle}
        </details>
      </div>
    </div>
  );
};

export default Dropdown;