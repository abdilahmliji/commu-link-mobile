import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Home from './Home';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If user doesn't have a community, show communities page
    if (user?.role === 'user' && !user?.communityId) {
      navigate('/communities');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // If authenticated and has community (or is admin), show home
  if (isAuthenticated && (user?.role === 'admin' || user?.communityId)) {
    return <Home />;
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="animate-pulse-soft text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
