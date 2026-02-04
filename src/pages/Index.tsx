
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';
import Auth from './Auth';

const Index = () => {
  const { isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--error)' }}>Authentication error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Auth />;
};

export default Index;
