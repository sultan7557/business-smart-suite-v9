import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderVariant = 'primary' | 'secondary' | 'overlay';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: string; // Tailwind color class or custom
  message?: string;
  overlay?: boolean;
  ariaLabel?: string;
  backgroundColor?: string; // For overlay background
  className?: string;
  spinnerClassName?: string;
}

/**
 * Loader - A reusable, accessible loading spinner for all async operations.
 *
 * @param size - Loader size (sm, md, lg)
 * @param variant - Loader style (primary, secondary, overlay)
 * @param color - Spinner color (Tailwind class or custom)
 * @param message - Optional loading message
 * @param overlay - If true, shows a fullscreen overlay
 * @param ariaLabel - ARIA label for accessibility
 * @param backgroundColor - Overlay background color
 * @param className - Additional wrapper classes
 * @param spinnerClassName - Additional spinner classes
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'primary',
  color = '',
  message,
  overlay = false,
  ariaLabel = 'Loading',
  backgroundColor = 'bg-black/40',
  className = '',
  spinnerClassName = '',
}) => {
  // Overlay variant always sets overlay true
  const isOverlay = overlay || variant === 'overlay';

  const spinner = (
    <Spinner
      size={size}
      className={cn(
        color ||
          (variant === 'primary'
            ? 'text-primary'
            : variant === 'secondary'
            ? 'text-secondary'
            : 'text-white'),
        spinnerClassName
      )}
      aria-label={ariaLabel}
      role="status"
    />
  );

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {spinner}
      {message && (
        <span className="mt-2 text-sm text-muted-foreground" role="status">
          {message}
        </span>
      )}
      {/* Visually hidden for screen readers if no visible message */}
      {!message && (
        <span className="sr-only">{ariaLabel}</span>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          backgroundColor,
          'transition-opacity animate-fade-in',
          'backdrop-blur-sm'
        )}
        aria-live="polite"
        aria-busy="true"
        role="alertdialog"
      >
        {content}
      </div>
    );
  }

  return content;
}; 