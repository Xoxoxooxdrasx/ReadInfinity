import clsx from 'clsx';
import React from 'react';
import { isTauriAppPlatform } from '@/services/environment';
import { openUrl } from '@tauri-apps/plugin-opener';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  title?: string;
  className?: string;
}

const isTauri = isTauriAppPlatform();

const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTauri) {
      e.preventDefault();
      try {
        await openUrl(href);
      } catch (error) {
        console.info('Failed to open external link:', error);
      }
    }
  };

  return (
    <a
      href={href}
      target={isTauri ? undefined : '_blank'}
      rel='noopener noreferrer'
      onClick={handleClick}
      className={clsx(
        // M3 Link Base Typography & Interaction
        'inline-flex items-center text-primary decoration-primary/40 underline-offset-4',
        'transition-colors duration-150 hover:text-primary/80 hover:decoration-primary',
        'focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:opacity-75',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export default Link;