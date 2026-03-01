import { useEffect } from 'react';
import { seedData } from '../utils/api';

interface InitializeDataProps {
  onReady?: () => void;
}

export function InitializeData({ onReady }: InitializeDataProps) {
  useEffect(() => {
    const initialize = async () => {
      try {
        await seedData();
      } catch (err) {
        console.error('Failed to initialize data:', err);
      } finally {
        // Always signal ready so the app never hangs
        onReady?.();
      }
    };

    initialize();
  }, []);

  // No UI — App.tsx handles the loading spinner in the main content area
  return null;
}
