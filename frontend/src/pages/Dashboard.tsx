import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { metricsService } from '../services/api';
import { DashboardMetrics, AdoptionHistory } from '../types';
import LoginModal from '../components/LoginModal';
import MetricCard from '../components/MetricCard';
import AdoptionChart from '../components/AdoptionChart';
import FundraisingProgress from '../components/FundraisingProgress';
import { LogIn, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adoptionHistory, setAdoptionHistory] = useState<AdoptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [metricsResponse, historyResponse] = await Promise.all([
        metricsService.getDashboardMetrics(),
        metricsService.getAdoptionHistory()
      ]);

      if (metricsResponse.success) {
        setMetrics(metricsResponse.data);
      }

      if (historyResponse.success) {
        setAdoptionHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      setIsLoginModalOpen(false);
      // Refresh data after login to show role-specific metrics
      fetchData();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🐱 Cat Shelter Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.username} ({user.role.replace('_', ' ')})
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Adoptions Section */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                Total Adoptions
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeframe('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === 'month'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeframe('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === 'year'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  This Year
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <MetricCard
                title={`Adoptions ${timeframe === 'month' ? 'This Month' : 'This Year'}`}
                value={timeframe === 'month' ? metrics?.adoptions.thisMonth : metrics?.adoptions.thisYear}
                min={metrics?.adoptions.min}
                max={metrics?.adoptions.max}
              />
            </div>
            
            <div className="h-80">
              <AdoptionChart data={adoptionHistory} />
            </div>
          </div>

          {/* Cats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Available Cats"
              value={metrics?.cats.totalAvailable}
              subtitle="Ready for adoption"
            />
            <MetricCard
              title="Booked Cats"
              value={metrics?.cats.totalBooked}
              subtitle="In adoption process"
            />
            <MetricCard
              title="Kittens"
              value={metrics?.cats.kittens}
              subtitle="Available kittens"
            />
            <MetricCard
              title="Seniors"
              value={metrics?.cats.seniors}
              subtitle="Available seniors"
            />
          </div>

          {/* Staff-only metrics */}
          {(user?.role === 'clinic_staff' || user?.role === 'super_admin') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Incoming Cats This Month"
                value={metrics?.incomingCats?.thisMonth}
                subtitle="Rescues, surrenders, strays"
              />
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medical Procedures This Month
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {metrics?.medicalProcedures?.neuteredThisMonth || 0}
                    </div>
                    <div className="text-sm text-gray-600">Neutered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary-600">
                      {metrics?.medicalProcedures?.spayedThisMonth || 0}
                    </div>
                    <div className="text-sm text-gray-600">Spayed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fundraising Progress */}
          {metrics?.fundraising && (
            <div className="card">
              <FundraisingProgress campaign={metrics.fundraising} />
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Dashboard;
