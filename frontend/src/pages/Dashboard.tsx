import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useTotalAdoptions,
  useCatsStatus,
  useIncomingCats,
  useNeuteredCats,
  useCampaign,
} from '../hooks/useStats';
import LoginModal from '../components/LoginModal';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import AdoptionChart from '../components/AdoptionChart';
import MultiLineChart from '../components/MultiLineChart';
import FundraisingProgress from '../components/FundraisingProgress';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';

const Dashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');
  const [medicalTimeframe, setMedicalTimeframe] = useState<'month' | 'year' | 'all'>('month');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  // Calculate date range based on timeframe
  React.useEffect(() => {
    const now = new Date();
    if (timeframe === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else {
      const start = new Date(now.getFullYear(), 0, 1);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  }, [timeframe]);

  // Fetch data using SWR hooks
  const {
    data: adoptionsData,
    error: adoptionsError,
    isLoading: adoptionsLoading,
    mutate: mutateAdoptions,
  } = useTotalAdoptions(startDate, endDate);

  const {
    data: catsStatusData,
    error: catsStatusError,
    isLoading: catsStatusLoading,
    mutate: mutateCatsStatus,
  } = useCatsStatus();

  const {
    data: incomingCatsData,
    error: incomingCatsError,
    isLoading: incomingCatsLoading,
    mutate: mutateIncomingCats,
  } = useIncomingCats();

  const {
    data: neuteredCatsData,
    error: neuteredCatsError,
    isLoading: neuteredCatsLoading,
    mutate: mutateNeuteredCats,
  } = useNeuteredCats();

  // Only show errors for staff/admin endpoints if user has permission
  const isStaffOrAdmin = user?.role === 'clinic_staff' || user?.role === 'super_admin';

  const {
    data: campaignData,
    error: campaignError,
    isLoading: campaignLoading,
    mutate: mutateCampaign,
  } = useCampaign();

  // Set up Socket.IO for real-time updates
  React.useEffect(() => {
    const socket = getSocket();

    // Listen for campaign updates
    const handleCampaignUpdate = (data: {
      campaignId: number;
      currentAmount: number;
      targetAmount: number;
      currency: string;
    }) => {
      console.log('Campaign updated:', data);
      // Refresh campaign data
      mutateCampaign();
      toast.success(`Campaign updated: ${data.currentAmount} ${data.currency} of ${data.targetAmount} ${data.currency}`);
    };

    // Listen for adoption updates
    const handleAdoptionUpdate = () => {
      console.log('Adoption updated');
      mutateAdoptions();
    };

    // Listen for cat status updates
    const handleCatStatusUpdate = () => {
      console.log('Cat status updated');
      mutateCatsStatus();
    };

    // Listen for incoming cats updates (staff/admin only)
    const handleIncomingCatsUpdate = () => {
      if (isStaffOrAdmin) {
        console.log('Incoming cats updated');
        mutateIncomingCats();
      }
    };

    // Listen for medical procedures updates (staff/admin only)
    const handleMedicalProceduresUpdate = () => {
      if (isStaffOrAdmin) {
        console.log('Medical procedures updated');
        mutateNeuteredCats();
      }
    };

    // Register event listeners
    socket.on('campaign:updated', handleCampaignUpdate);
    socket.on('adoption:created', handleAdoptionUpdate);
    socket.on('adoption:updated', handleAdoptionUpdate);
    socket.on('cat:created', handleCatStatusUpdate);
    socket.on('cat:updated', handleCatStatusUpdate);
    socket.on('cat:status_changed', handleCatStatusUpdate);
    socket.on('incoming:cat', handleIncomingCatsUpdate);
    socket.on('medical:procedure', handleMedicalProceduresUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('campaign:updated', handleCampaignUpdate);
      socket.off('adoption:created', handleAdoptionUpdate);
      socket.off('adoption:updated', handleAdoptionUpdate);
      socket.off('cat:created', handleCatStatusUpdate);
      socket.off('cat:updated', handleCatStatusUpdate);
      socket.off('cat:status_changed', handleCatStatusUpdate);
      socket.off('incoming:cat', handleIncomingCatsUpdate);
      socket.off('medical:procedure', handleMedicalProceduresUpdate);
    };
  }, [mutateCampaign, mutateAdoptions, mutateCatsStatus, mutateIncomingCats, mutateNeuteredCats, isStaffOrAdmin]);

  // Show errors
  React.useEffect(() => {
    if (adoptionsError) toast.error('Failed to load adoptions data');
    if (catsStatusError) toast.error('Failed to load cats status');
    if (incomingCatsError && isStaffOrAdmin) {
      toast.error('Failed to load incoming cats data');
    }
    if (neuteredCatsError && isStaffOrAdmin) {
      toast.error('Failed to load neutered cats data');
    }
    if (campaignError) toast.error('Failed to load campaign data');
  }, [adoptionsError, catsStatusError, incomingCatsError, neuteredCatsError, campaignError, isStaffOrAdmin]);

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      setIsLoginModalOpen(false);
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const isLoading =
    adoptionsLoading ||
    catsStatusLoading ||
    (isStaffOrAdmin && (incomingCatsLoading || neuteredCatsLoading)) ||
    campaignLoading;

  if (isLoading && !adoptionsData && !catsStatusData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Total Adoptions Section */}
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
                title={`Total Adoptions ${timeframe === 'month' ? 'This Month' : 'This Year'}`}
                value={adoptionsData?.total}
                min={adoptionsData?.min}
                max={adoptionsData?.max}
              />
            </div>

            {adoptionsData?.series && adoptionsData.series.length > 0 && (
              <div className="h-80">
                <AdoptionChart data={adoptionsData.series} />
              </div>
            )}
          </div>

          {/* Cats Status Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cats Status Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard
                title="Available Cats"
                value={catsStatusData?.available}
                subtitle="Ready for adoption"
                min={catsStatusData?.min}
                max={catsStatusData?.max}
              />
              <MetricCard
                title="Booked Cats"
                value={catsStatusData?.booked}
                subtitle="In adoption process"
              />
              <MetricCard
                title="Kittens"
                value={catsStatusData?.available_breakdown?.kittens}
                subtitle="Available kittens"
              />
              <MetricCard
                title="Adults"
                value={catsStatusData?.available_breakdown?.adults}
                subtitle="Available adults"
              />
              <MetricCard
                title="Seniors"
                value={catsStatusData?.available_breakdown?.seniors}
                subtitle="Available seniors"
              />
            </div>
            
            {/* Cats Status Chart */}
            {catsStatusData?.series && (() => {
              // Merge available and booked series by month
              const allMonths = new Set([
                ...catsStatusData.series.available.map(item => item.month),
                ...catsStatusData.series.booked.map(item => item.month)
              ]);
              const mergedData = Array.from(allMonths).sort().map(month => ({
                month,
                available: catsStatusData.series.available.find(item => item.month === month)?.count || 0,
                booked: catsStatusData.series.booked.find(item => item.month === month)?.count || 0,
              }));
              
              return (
                <div className="h-80 mt-6">
                  <MultiLineChart
                    data={mergedData}
                    lines={[
                      { dataKey: 'available', name: 'Available', color: '#10b981' },
                      { dataKey: 'booked', name: 'Booked', color: '#f59e0b' },
                    ]}
                    title="Cats Status History"
                  />
                </div>
              );
            })()}
          </div>

          {/* Staff-only metrics */}
          {isStaffOrAdmin && (
            <>
              {/* Incoming Cats Section */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Incoming Cats This Month
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <MetricCard
                    title="Rescued This Month"
                    value={incomingCatsData?.rescued_this_month}
                    subtitle="Cats rescued"
                    min={incomingCatsData?.min}
                    max={incomingCatsData?.max}
                  />
                  <MetricCard
                    title="Surrendered This Month"
                    value={incomingCatsData?.surrendered_this_month}
                    subtitle="Cats surrendered"
                  />
                </div>
                
                {/* Incoming Cats Chart */}
                {incomingCatsData?.series && (() => {
                  // Merge rescued and surrendered series by month
                  const allMonths = new Set([
                    ...incomingCatsData.series.rescued.map(item => item.month),
                    ...incomingCatsData.series.surrendered.map(item => item.month)
                  ]);
                  const mergedData = Array.from(allMonths).sort().map(month => ({
                    month,
                    rescued: incomingCatsData.series.rescued.find(item => item.month === month)?.count || 0,
                    surrendered: incomingCatsData.series.surrendered.find(item => item.month === month)?.count || 0,
                  }));
                  
                  return (
                    <div className="h-80 mt-6">
                      <MultiLineChart
                        data={mergedData}
                        lines={[
                          { dataKey: 'rescued', name: 'Rescued', color: '#3b82f6' },
                          { dataKey: 'surrendered', name: 'Surrendered', color: '#ef4444' },
                        ]}
                        title="Incoming Cats History"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Medical Procedures Section */}
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                    Medical Procedures
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMedicalTimeframe('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        medicalTimeframe === 'month'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => setMedicalTimeframe('year')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        medicalTimeframe === 'year'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Last Year
                    </button>
                    <button
                      onClick={() => setMedicalTimeframe('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        medicalTimeframe === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All Time
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <MetricCard
                    title="Neutered This Month"
                    value={neuteredCatsData?.neutered_this_month}
                    subtitle="Neutering procedures"
                    min={neuteredCatsData?.min}
                    max={neuteredCatsData?.max}
                  />
                  <MetricCard
                    title="Spayed This Month"
                    value={neuteredCatsData?.spayed_this_month}
                    subtitle="Spaying procedures"
                  />
                </div>
                
                {/* Medical Procedures Chart */}
                {neuteredCatsData?.series && (() => {
                  // Filter data based on timeframe
                  const now = new Date();
                  let filteredNeutered = neuteredCatsData.series.neutered;
                  let filteredSpayed = neuteredCatsData.series.spayed;
                  
                  if (medicalTimeframe === 'month') {
                    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                    filteredNeutered = neuteredCatsData.series.neutered.filter(item => item.month === monthStr);
                    filteredSpayed = neuteredCatsData.series.spayed.filter(item => item.month === monthStr);
                  } else if (medicalTimeframe === 'year') {
                    const yearStr = now.getFullYear().toString();
                    filteredNeutered = neuteredCatsData.series.neutered.filter(item => item.month.startsWith(yearStr));
                    filteredSpayed = neuteredCatsData.series.spayed.filter(item => item.month.startsWith(yearStr));
                  }
                  
                  // Merge the series data
                  const allMonths = new Set([
                    ...filteredNeutered.map(item => item.month),
                    ...filteredSpayed.map(item => item.month)
                  ]);
                  const mergedData = Array.from(allMonths).sort().map(month => ({
                    month,
                    neutered: filteredNeutered.find(item => item.month === month)?.count || 0,
                    spayed: filteredSpayed.find(item => item.month === month)?.count || 0,
                  }));
                  
                  return (
                    <div className="h-80 mt-6">
                      <MultiLineChart
                        data={mergedData}
                        lines={[
                          { dataKey: 'neutered', name: 'Neutered', color: '#8b5cf6' },
                          { dataKey: 'spayed', name: 'Spayed', color: '#ec4899' },
                        ]}
                        title="Medical Procedures History"
                      />
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Fundraising Campaign Section */}
          {campaignData && (
            <div className="card">
              <FundraisingProgress
                campaign={{
                  title: 'Active Campaign',
                  currentAmount: campaignData.current_donated,
                  targetAmount: campaignData.campaign_goal,
                  currency: 'SEK',
                  progress:
                    (campaignData.current_donated / campaignData.campaign_goal) * 100,
                }}
              />
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