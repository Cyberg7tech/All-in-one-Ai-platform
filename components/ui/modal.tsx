'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={handleOverlayClick} />

      {/* Modal */}
      <Card
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden shadow-2xl ${className}`}>
        {(title || showCloseButton) && (
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div>
              {title && <CardTitle className='text-xl'>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {showCloseButton && (
              <Button variant='ghost' size='sm' className='size-8 px-0' onClick={onClose}>
                <X className='size-4' />
                <span className='sr-only'>Close</span>
              </Button>
            )}
          </CardHeader>
        )}

        <CardContent className='overflow-y-auto max-h-[calc(90vh-8rem)]'>{children}</CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className='space-y-4'>
        <div className='flex items-start space-x-3'>
          {variant === 'destructive' ? (
            <AlertTriangle className='size-6 text-red-500 mt-0.5' />
          ) : (
            <Info className='size-6 text-blue-500 mt-0.5' />
          )}
          <div>
            <h3 className='text-lg font-semibold'>{title}</h3>
            <p className='text-muted-foreground mt-1'>{message}</p>
          </div>
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button variant='outline' onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Alert Modal
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='size-6 text-green-500' />;
      case 'error':
        return <AlertCircle className='size-6 text-red-500' />;
      case 'warning':
        return <AlertTriangle className='size-6 text-yellow-500' />;
      default:
        return <Info className='size-6 text-blue-500' />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className='space-y-4'>
        <div className='flex items-start space-x-3'>
          {getIcon()}
          <div>
            <h3 className='text-lg font-semibold'>{getTitle()}</h3>
            {message && <p className='text-muted-foreground mt-1'>{message}</p>}
          </div>
        </div>

        <div className='flex justify-end pt-4'>
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </Modal>
  );
}
