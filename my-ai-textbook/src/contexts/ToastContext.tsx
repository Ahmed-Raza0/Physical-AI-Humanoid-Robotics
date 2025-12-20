import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '../components/UI/Toast';
import { useToast, UseToastReturn } from '../hooks/useToast';

const ToastContext = createContext<UseToastReturn | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Toast context provider
 * Provides global toast notification system
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const toastUtils = useToast();

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <ToastContainer
        toasts={toastUtils.toasts}
        position={position}
        onRemove={toastUtils.removeToast}
      />
    </ToastContext.Provider>
  );
};

/**
 * Hook to access toast notifications
 * Must be used within ToastProvider
 */
export const useToastContext = (): UseToastReturn => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
