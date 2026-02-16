import { useEffect, useState } from 'react';
import { seedData } from '../utils/api';

export function InitializeData() {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await seedData();
      } catch (err) {
        console.error('Failed to initialize data:', err);
        setError(true);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Initialization Error</h2>
          <p className="text-gray-600 mb-4">
            Failed to connect to the database. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing System</h2>
          <p className="text-gray-600">Setting up your credit score database...</p>
        </div>
      </div>
    );
  }

  return null;
}
