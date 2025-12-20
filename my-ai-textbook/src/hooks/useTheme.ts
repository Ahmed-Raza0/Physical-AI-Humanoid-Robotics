import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

/**
 * Hook to manage and detect theme (light/dark mode)
 * Works with Docusaurus theme system
 * @returns UseThemeReturn object with theme state and controls
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return 'light';

    // Try to get theme from Docusaurus
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme');

    if (dataTheme === 'dark' || dataTheme === 'light') {
      return dataTheme;
    }

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe changes to the data-theme attribute (Docusaurus changes this)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          if (newTheme === 'dark' || newTheme === 'light') {
            setThemeState(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Also listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if Docusaurus hasn't set a specific theme
      const currentDataTheme = document.documentElement.getAttribute('data-theme');
      if (!currentDataTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      observer.disconnect();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    // Set the theme on the HTML element (Docusaurus way)
    document.documentElement.setAttribute('data-theme', newTheme);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Unable to save theme to localStorage:', e);
    }

    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

export default useTheme;
