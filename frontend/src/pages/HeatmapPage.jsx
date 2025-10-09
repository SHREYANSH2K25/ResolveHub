import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import HeatmapView from '../components/GoogleMaps/HeatmapView';
import { 
  MapPin, 
  Info, 
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

const HeatmapPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Complaint Heatmap"
          subtitle="Visualize complaint distribution and density across the city"
        />

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Active Areas</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">High Complaint Density</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Red zones indicate areas with multiple unresolved complaints
            </p>
          </Card>
          
          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Data Insights</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pattern Analysis</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Identify trends and hotspots for better resource allocation
            </p>
          </Card>
          
          <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Real-time</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Updates</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Heatmap updates as new complaints are submitted and resolved
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-8">
          <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Time Range:</label>
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="water">Water Issues</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="roads">Road Problems</option>
                    <option value="lighting">Street Lighting</option>
                    <option value="general">General Issues</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Heatmap */}
        <div className="mt-8">
          <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
            <HeatmapView height="600px" />
          </Card>
        </div>

        {/* Legend and Instructions */}
        <div className="mt-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How to Read the Heatmap</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Color Legend</h4>
                <div className="space-y-3">
                  {[
                    { color: 'bg-blue-300', label: 'Low complaint density (1-2 complaints)' },
                    { color: 'bg-yellow-400', label: 'Medium complaint density (3-5 complaints)' },
                    { color: 'bg-orange-500', label: 'High complaint density (6-10 complaints)' },
                    { color: 'bg-red-600', label: 'Very high complaint density (10+ complaints)' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Usage Tips</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {[
                    'Zoom in to see individual complaint locations more clearly',
                    'Use filters to analyze specific time periods or categories',
                    'Red zones indicate areas requiring immediate attention',
                    'Use map controls to switch between different view types',
                    'Click refresh to get the latest complaint data'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Summary */}
        <div className="mt-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analytics Summary</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">Active</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Data Source</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">Live</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Updates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Geographic</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Visualization</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
