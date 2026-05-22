import React, { forwardRef, useEffect, useRef } from 'react';
import { Button, type ButtonVariant } from './Button';

export interface ModalAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  actions?: ModalAction[];
  closeButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isDismissible?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
}

/**
 * Modal/Dialog Component
 * A reusable modal component for confirmations, alerts, and custom dialogs
 *
 * Features:
 * - Customizable title, message, and content
 * - Multiple action buttons with different variants
 * - Loading states for async operations
 * - Keyboard navigation (ESC to close)
 * - Focus management and ARIA attributes
 * - Accessible with proper semantic HTML
 * - Responsive sizing
 * - Dark mode support
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      message,
      children,
      actions = [],
      closeButton = true,
      size = 'md',
      isDismissible = true,
      className = '',
      contentClassName = '',
      overlayClassName = '',
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const wasOpen = useRef(false);

    // Handle keyboard events and initial focus
    useEffect(() => {
      if (isOpen && !wasOpen.current) {
        // Modal just opened
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        // Focus the modal for accessibility
        if (modalRef.current) {
          modalRef.current.focus();
        }
        
        wasOpen.current = true;
      } else if (!isOpen && wasOpen.current) {
        // Modal just closed
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
        wasOpen.current = false;
      }

      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isDismissible) {
          onClose();
        }
      };

      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }, [isOpen, isDismissible, onClose]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && isDismissible) {
        onClose();
      }
    };

    // Size styles
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    };

    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className={`
            fixed inset-0 z-40
            bg-black/40 backdrop-blur-sm
            transition-all duration-300
            ${overlayClassName}
          `}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal container */}
        <div
          ref={ref || modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={message ? 'modal-description' : undefined}
          className={`
            fixed inset-0 z-50
            flex items-center justify-center
            p-4 sm:p-0
            ${className}
          `}
          tabIndex={-1}
        >
          {/* Modal content */}
          <div
            className={`
              bg-[var(--surface-card)]
              rounded-xl shadow-2xl
              w-full ${sizeStyles[size]}
              max-h-[90vh] overflow-y-auto
              border border-[var(--hairline)]
              flex flex-col
              ${contentClassName}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--hairline)] bg-[var(--surface-card)] sticky top-0 z-10">
              <h2
                id="modal-title"
                className="text-lg font-bold text-[var(--foreground)]"
              >
                {title}
              </h2>

              {closeButton && (
                <button
                  onClick={onClose}
                  className="
                    text-[var(--mute)]
                    hover:text-[var(--foreground)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                    rounded-md p-1
                    transition-colors duration-200
                  "
                  aria-label="Close modal"
                  type="button"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Content body */}
            <div className="p-6 flex-1 bg-[var(--surface-card)]">
              {message && (
                <p
                  id="modal-description"
                  className="text-[var(--body)] mb-4"
                >
                  {message}
                </p>
              )}

              {children}
            </div>

            {/* Footer with Actions */}
            {actions.length > 0 && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--hairline)] bg-[var(--surface-card)] sticky bottom-0 z-10">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'secondary'}
                    onClick={action.onClick}
                    isLoading={action.isLoading}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * Confirmation Dialog Component
 */
export interface ConfirmationDialogProps
  extends Omit<ModalProps, 'actions' | 'children'> {
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  isConfirming?: boolean;
}

export const ConfirmationDialog = forwardRef<
  HTMLDivElement,
  ConfirmationDialogProps
>(
  (
    {
      isOpen,
      onClose,
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      confirmVariant = 'primary',
      onConfirm,
      isConfirming = false,
      size = 'sm',
      isDismissible = true,
      ...props
    },
    ref
  ) => {
    const actions: ModalAction[] = [
      {
        label: cancelLabel,
        onClick: onClose,
        variant: 'secondary',
        disabled: isConfirming,
      },
      {
        label: confirmLabel,
        onClick: onConfirm,
        variant: confirmVariant,
        isLoading: isConfirming,
      },
    ];

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={message}
        actions={actions}
        size={size}
        isDismissible={isDismissible}
        {...props}
      />
    );
  }
);

ConfirmationDialog.displayName = 'ConfirmationDialog';

/**
 * Delete Confirmation Dialog Component
 */
export interface DeleteConfirmationDialogProps
  extends Omit<ConfirmationDialogProps, 'confirmVariant' | 'title'> {
  itemName?: string;
  title?: string;
}

export const DeleteConfirmationDialog = forwardRef<
  HTMLDivElement,
  DeleteConfirmationDialogProps
>(
  (
    {
      isOpen,
      onClose,
      title = 'Delete Item',
      message,
      itemName,
      confirmLabel = 'Delete',
      cancelLabel = 'Cancel',
      onConfirm,
      isConfirming = false,
      ...props
    },
    ref
  ) => {
    const defaultMessage =
      message ||
      (itemName
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.');

    return (
      <ConfirmationDialog
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={defaultMessage}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        confirmVariant="danger"
        onConfirm={onConfirm}
        isConfirming={isConfirming}
        {...props}
      />
    );
  }
);

DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog';

/**
 * Alert Dialog Component
 */
export interface AlertDialogProps
  extends Omit<ModalProps, 'actions' | 'children'> {
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      message,
      actionLabel = 'OK',
      onAction,
      variant = 'info',
      size = 'sm',
      isDismissible = true,
      ...props
    },
    ref
  ) => {
    const handleAction = () => {
      onAction?.();
      onClose();
    };

    const actions: ModalAction[] = [
      {
        label: actionLabel,
        onClick: handleAction,
        variant: variant === 'error' ? 'danger' : 'primary',
      },
    ];

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={message}
        actions={actions}
        size={size}
        isDismissible={isDismissible}
        {...props}
      />
    );
  }
);

AlertDialog.displayName = 'AlertDialog';
