import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Activity,
  Target,
  Filter
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const StatisticsPage = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Fetch statistics data
  const fetchStatistics = async (params = {}) => {
    try {
      setLoading(true);
      console.log('Fetching statistics with params:', { timeRange, ...params });
      const response = await apiService.getStatistics({
        timeRange,
        ...params
      });
      console.log('Statistics response:', response.data);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCustomRange && customDateRange.start && customDateRange.end) {
      fetchStatistics({
        startDate: customDateRange.start,
        endDate: customDateRange.end
      });
    } else if (!showCustomRange) {
      fetchStatistics({ timeRange });
    }
  }, [timeRange, customDateRange, showCustomRange]);

  // Export functionality
  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {
        format: 'csv',
        timeRange: showCustomRange ? undefined : timeRange,
        ...(showCustomRange && customDateRange.start && customDateRange.end ? {
          startDate: customDateRange.start,
          endDate: customDateRange.end
        } : {})
      };

      const response = await apiService.exportStatistics(params);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = showCustomRange ? 
        `${customDateRange.start}_to_${customDateRange.end}` : 
        timeRange;
      link.download = `complaints_statistics_${dateStr}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Statistics exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export statistics');
    } finally {
      setExporting(false);
    }
  };

  // Helper components
  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${
                  trend.startsWith('+') ? 'text-green-400' : trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {trend.startsWith('+') ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : trend.startsWith('-') ? (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  ) : null}
                  <span>{trend}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button 
            onClick={() => fetchStatistics()}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          padding: 20
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <p>Failed to load statistics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Statistics & Analytics"
            subtitle={`Monitor performance and track complaint resolution trends${statistics.city ? ` - ${statistics.city}` : ''}`}
          >
            <div className="flex flex-wrap gap-3 items-center">
              {/* Time Range Selector */}
              <div className="flex gap-2">
                <select 
                  value={showCustomRange ? 'custom' : timeRange}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomRange(true);
                    } else {
                      setShowCustomRange(false);
                      setTimeRange(e.target.value);
                    }
                  }}
                  className="px-4 py-2 bg-gray-800/40 border border-gray-600/40 rounded-xl text-white text-sm backdrop-blur-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 3 months</option>
                  <option value="1year">Last year</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {/* Custom Date Range */}
                {showCustomRange && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 bg-gray-800/40 border border-gray-600/40 rounded-xl text-white text-sm backdrop-blur-sm focus:outline-none focus:border-purple-500/50"
                    />
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 bg-gray-800/40 border border-gray-600/40 rounded-xl text-white text-sm backdrop-blur-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                )}
              </div>
              
              {/* Export Button */}
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gray-800/40 rounded-xl text-white text-sm backdrop-blur-sm border border-gray-600/40 hover:bg-gray-700/40 transition-colors">
                  {exporting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
                </div>
              </button>
              
              {/* Refresh Button */}
              <button 
                onClick={() => fetchStatistics()}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gray-800/40 rounded-xl text-white text-sm backdrop-blur-sm border border-gray-600/40 hover:bg-gray-700/40 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </div>
              </button>
            </div>
          </PageHeader>

          {/* Overview Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard
              title="Total Complaints"
              value={statistics.overview.totalComplaints.toLocaleString()}
              icon={BarChart3}
              color="blue"
            />
            <StatCard
              title="Resolved"
              value={statistics.overview.resolvedComplaints.toLocaleString()}
              subtitle={`${statistics.overview.resolutionRate}% resolution rate`}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Pending"
              value={statistics.overview.pendingComplaints.toLocaleString()}
              subtitle="Awaiting resolution"
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="In Progress"
              value={statistics.overview.inProgressComplaints.toLocaleString()}
              subtitle="Being handled"
              icon={Activity}
              color="purple"
            />
            <StatCard
              title="Avg Resolution"
              value={`${statistics.overview.avgResolutionTime} days`}
              subtitle="Average time"
              icon={Target}
              color="indigo"
            />
            <StatCard
              title="Active Staff"
              value={statistics.overview.activeStaff}
              subtitle="Available"
              icon={Users}
              color="green"
            />
          </div>

          {/* Charts Row */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trend Chart */}
            <ChartCard title="Daily Complaints Trend" className="h-96">
              {statistics.trends && statistics.trends.length > 0 ? (
                <Line 
                  data={{
                    labels: statistics.trends.map(item => format(parseISO(item._id), 'MMM dd')),
                    datasets: [
                      {
                        label: 'New Complaints',
                        data: statistics.trends.map(item => item.complaints),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Resolved',
                        data: statistics.trends.map(item => item.resolved),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                    <p>No trend data available</p>
                  </div>
                </div>
              )}
            </ChartCard>

            {/* Category Breakdown */}
            <ChartCard title="Complaints by Category" className="h-96">
              {statistics.categories && statistics.categories.length > 0 ? (
                <Doughnut
                  data={{
                    labels: statistics.categories.map(cat => cat._id || 'Unknown'),
                    datasets: [{
                      data: statistics.categories.map(cat => cat.count),
                      backgroundColor: [
                        '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', 
                        '#3B82F6', '#8B5A2B', '#EC4899', '#6B7280'
                      ],
                      borderWidth: 0
                    }]
                  }}
                  options={doughnutOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Filter className="w-16 h-16 mx-auto mb-2" />
                    <p>No category data available</p>
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Staff Performance (if available) */}
          {statistics.staffPerformance && statistics.staffPerformance.length > 0 && (
            <ChartCard title="Staff Performance" className="mt-8">
              <div className="space-y-4">
                {statistics.staffPerformance.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-900/20 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{staff.name}</p>
                      <p className="text-gray-400 text-sm">{staff.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{staff.resolved}/{staff.assigned}</p>
                      <p className={`text-sm font-medium ${
                        staff.percentage >= 80 ? 'text-green-400' : 
                        staff.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {staff.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {/* Status Breakdown */}
          <ChartCard title="Status Summary" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{statistics.overview.totalComplaints}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{statistics.overview.resolvedComplaints}</div>
                <div className="text-sm text-gray-400">Resolved</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{statistics.overview.pendingComplaints}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{statistics.overview.inProgressComplaints}</div>
                <div className="text-sm text-gray-400">In Progress</div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob { 
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-5000 { animation-delay: 5s; }
      `}</style>
    </div>
  );
};

export default StatisticsPage;
