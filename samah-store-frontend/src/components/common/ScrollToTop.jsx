/**
 * ScrollToTop Component
 * Scrolls to top on route change (pathname change)
 * Preserves hash anchor behavior for in-page navigation
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash (e.g., #section), let the browser handle scrolling to that element
    if (hash) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
      return;
    }

    // Otherwise, scroll to top instantly on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
