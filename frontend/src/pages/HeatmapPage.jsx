import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import HeatmapView from '../components/GoogleMaps/HeatmapView';
import { 
  MapPin, 
  Info, 
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

const HeatmapPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-700 via-pink-600 to-blue-600 rounded-full opacity-10 filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-pink-700 via-purple-600 to-blue-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-bl from-blue-700 via-purple-500 to-pink-500 rounded-full opacity-10 filter blur-3xl animate-blob animation-delay-5000"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/40 shadow-2xl text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Complaint Heatmap</h1>
              <p className="text-gray-300 text-lg">Visualize complaint distribution and density across the city</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Active Areas Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full border border-red-500/30 mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">Active Areas</div>
                <div className="text-sm font-medium text-gray-300 mb-2">High Complaint Density</div>
                <p className="text-xs text-gray-400">
                  Red zones indicate areas with multiple unresolved complaints
                </p>
              </div>
            </div>

            {/* Data Insights Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full border border-blue-500/30 mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">Data Insights</div>
                <div className="text-sm font-medium text-gray-300 mb-2">Pattern Analysis</div>
                <p className="text-xs text-gray-400">
                  Identify trends and hotspots for better resource allocation
                </p>
              </div>
            </div>

            {/* Real-time Updates Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full border border-green-500/30 mx-auto mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">Real-time</div>
                <div className="text-sm font-medium text-gray-300 mb-2">Live Updates</div>
                <p className="text-xs text-gray-400">
                  Dynamic visualization updates as new complaints are submitted
                </p>
              </div>
            </div>
          </div>

          {/* Filters with Glass Morphism */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-700/30 pb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <Filter className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Heatmap Filters</h2>
                  <p className="text-sm text-gray-300">Customize the visualization based on time period and complaint type</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Time Period
                  </label>
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Complaint Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="all">All Categories</option>
                    <option value="pothole">Potholes</option>
                    <option value="streetlight">Street Lighting</option>
                    <option value="garbage">Waste Management</option>
                    <option value="water">Water Supply</option>
                    <option value="traffic">Traffic Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Container with Glass Morphism */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 overflow-hidden">
              <div className="flex items-center space-x-3 p-6 border-b border-gray-700/30">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Interactive Heatmap</h2>
                  <p className="text-sm text-gray-300">Click and zoom to explore complaint patterns</p>
                </div>
              </div>

              <div className="h-[600px] bg-gray-800/30">
                <HeatmapView 
                  timeRange={selectedTimeRange}
                  category={selectedCategory}
                />
              </div>
            </div>
          </div>

          {/* Legend with Glass Morphism */}
          <div className="relative group mt-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                  <Info className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Heatmap Legend</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-300">Low Activity (1-5 complaints)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-300">Medium Activity (6-15 complaints)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm text-gray-300">High Activity (16-30 complaints)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-300">Critical Activity (30+ complaints)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;