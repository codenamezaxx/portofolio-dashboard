import React, { useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

/**
 * Toast Component
 * A single toast notification with auto-dismiss functionality
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with customizable duration
 * - Optional action button
 * - Accessible with proper ARIA attributes
 * - Smooth animations
 * - Dark mode support
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  action,
  onClose,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, duration, onClose]);

  // Reset timer on mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Restart timer on mouse leave
  const handleMouseLeave = () => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        onClose(id);
      }, duration);
    }
  };

  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: '✓',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: '✕',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-200',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '⚠',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-800 dark:text-yellow-200',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'ℹ',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        ${style.bg}
        ${style.border}
        border rounded-lg p-4 shadow-lg
        flex items-start gap-3
        animate-in fade-in slide-in-from-right-4 duration-300
        transition-all
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-lg font-bold ${style.iconColor}`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${style.textColor}`}>{message}</p>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={`
            flex-shrink-0 ml-2 text-sm font-medium
            ${style.textColor}
            hover:opacity-75 transition-opacity
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-offset-transparent
          `}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className={`
          flex-shrink-0 ml-2 text-lg font-bold
          ${style.iconColor}
          hover:opacity-75 transition-opacity
          focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-offset-transparent
          p-0 w-5 h-5 flex items-center justify-center
        `}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

Toast.displayName = 'Toast';

/**
 * Toast Container Component
 * Displays multiple toasts in a stack
 */
export interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // Limit number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <div
      className={`
        fixed ${positionStyles[position]}
        flex flex-col gap-2
        pointer-events-none
        z-50
      `}
      role="region"
      aria-label="Notifications"
    >
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
