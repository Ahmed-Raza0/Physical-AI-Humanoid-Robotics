import React, { ReactNode } from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import ScrollToTop from '../components/UI/ScrollToTop';
import ReadingProgress from '../components/UI/ReadingProgress';

export interface RootProps {
  children: ReactNode;
}

/**
 * Root component that wraps the entire application
 * Provides global features like toast notifications, scroll-to-top, reading progress
 * This is a Docusaurus theme component that gets loaded automatically
 */
export default function Root({ children }: RootProps): JSX.Element {
  return (
    <ToastProvider position="top-right">
      {children}
      <ReadingProgress position="top" height={3} />
      <ScrollToTop showAfter={300} position="bottom-right" />
    </ToastProvider>
  );
}
