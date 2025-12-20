import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TableOfContents.module.css';

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  headings?: TOCHeading[];
  activeId?: string;
  onHeadingClick?: (id: string) => void;
  className?: string;
  maxLevel?: number; // Only show headings up to this level
}

/**
 * Auto-generated table of contents component
 * Extracts headings from page and provides navigation
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings: providedHeadings,
  activeId: providedActiveId,
  onHeadingClick,
  className = '',
  maxLevel = 3,
}) => {
  const [headings, setHeadings] = useState<TOCHeading[]>(providedHeadings || []);
  const [activeId, setActiveId] = useState<string>(providedActiveId || '');
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-detect headings from page if not provided
  useEffect(() => {
    if (providedHeadings) return;

    const extractHeadings = () => {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extracted: TOCHeading[] = [];

      elements.forEach((element) => {
        const level = parseInt(element.tagName.substring(1));
        if (level <= maxLevel) {
          const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
          if (!element.id) {
            element.id = id;
          }
          extracted.push({
            id,
            text: element.textContent || '',
            level,
          });
        }
      });

      setHeadings(extracted);
    };

    // Extract on mount and when content changes
    extractHeadings();

    // Optional: Re-extract if content changes (using MutationObserver)
    const observer = new MutationObserver(extractHeadings);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [providedHeadings, maxLevel]);

  // Track active heading based on scroll position
  useEffect(() => {
    if (providedActiveId !== undefined) return;

    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);

      // Find the heading closest to the top of the viewport
      let current = '';
      for (const element of headingElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = element.id;
          }
        }
      }

      if (current) {
        setActiveId(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, providedActiveId]);

  const handleClick = (id: string) => {
    if (onHeadingClick) {
      onHeadingClick(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={`${styles.toc} ${className}`} aria-label="Table of contents">
      <div className={styles.header}>
        <h4 className={styles.title}>On this page</h4>
        <button
          className={styles.toggle}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.ul
            className={styles.list}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={styles.item}
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`${styles.link} ${activeId === heading.id ? styles.active : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(heading.id);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default TableOfContents;
