import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const StatisticsPage = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dummy data for charts and statistics
  const stats = {
    overview: {
      totalComplaints: 1247,
      resolvedComplaints: 892,
      avgResolutionTime: '4.2 days',
      satisfactionRate: '87%',
      activeStaff: 24,
      pendingAssignments: 45
    },
    trends: {
      complaints: [120, 135, 148, 132, 156, 171, 165, 189, 201, 187, 195, 210],
      resolutions: [98, 112, 125, 118, 134, 142, 138, 156, 167, 159, 172, 185]
    },
    categories: [
      { name: 'Road Maintenance', count: 324, percentage: 26, trend: '+12%' },
      { name: 'Water Supply', count: 298, percentage: 24, trend: '+8%' },
      { name: 'Waste Management', count: 187, percentage: 15, trend: '-3%' },
      { name: 'Street Lighting', count: 156, percentage: 12, trend: '+15%' },
      { name: 'Parks & Recreation', count: 134, percentage: 11, trend: '+5%' },
      { name: 'Other', count: 148, percentage: 12, trend: '+2%' }
    ],
    locations: [
      { area: 'Downtown', complaints: 234, resolved: 187, percentage: 80 },
      { area: 'North District', complaints: 198, resolved: 171, percentage: 86 },
      { area: 'East Side', complaints: 187, resolved: 145, percentage: 78 },
      { area: 'West End', complaints: 156, resolved: 134, percentage: 86 },
      { area: 'South Valley', complaints: 143, resolved: 121, percentage: 85 }
    ]
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {value}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </div>
            )}
            {trend && (
              <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.startsWith('+') ? 
                  <TrendingUp className="w-3 h-3" /> : 
                  <TrendingDown className="w-3 h-3" />
                }
                {trend}
              </div>
            )}
          </div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  };

  const ChartCard = ({ title, children }) => (
    <Card className="h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {children}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-municipal-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Statistics & Analytics"
          subtitle="Monitor performance and track complaint resolution trends"
        >
          <div className="flex gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-municipal-600 rounded-lg bg-white dark:bg-municipal-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 3 months</option>
              <option value="1year">Last year</option>
            </select>
            <button className="btn-secondary text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </PageHeader>

        {/* Overview Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Complaints"
            value={stats.overview.totalComplaints.toLocaleString()}
            icon={BarChart3}
            trend="+12%"
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={stats.overview.resolvedComplaints.toLocaleString()}
            subtitle={`${Math.round((stats.overview.resolvedComplaints / stats.overview.totalComplaints) * 100)}% resolution rate`}
            icon={CheckCircle}
            trend="+8%"
            color="green"
          />
          <StatCard
            title="Avg Resolution"
            value={stats.overview.avgResolutionTime}
            subtitle="Days to resolve"
            icon={Clock}
            trend="-15%"
            color="yellow"
          />
          <StatCard
            title="Satisfaction"
            value={stats.overview.satisfactionRate}
            subtitle="User rating"
            icon={TrendingUp}
            trend="+5%"
            color="purple"
          />
          <StatCard
            title="Active Staff"
            value={stats.overview.activeStaff}
            subtitle="Currently online"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.overview.pendingAssignments}
            subtitle="Awaiting assignment"
            icon={AlertTriangle}
            trend="+3%"
            color="red"
          />
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Complaints vs Resolutions Trend">
            <div className="w-full h-full bg-gradient-to-t from-primary-50 to-transparent dark:from-primary-900/20 rounded-lg flex items-end justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-primary-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Chart visualization would appear here
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Resolution Time Distribution">
            <div className="w-full h-full bg-gradient-to-t from-green-50 to-transparent dark:from-green-900/20 rounded-lg flex items-end justify-center">
              <div className="text-center">
                <Clock className="w-16 h-16 text-green-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Time distribution chart would appear here
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Category Breakdown */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Complaints by Category
              </h3>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.count}
                        </span>
                        <span className={`text-xs font-medium ${
                          category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.trend}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-municipal-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Location Performance */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance by Location
              </h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.locations.map((location, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-municipal-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {location.area}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      location.percentage >= 85 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : location.percentage >= 70
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {location.percentage}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {location.resolved} of {location.complaints} complaints resolved
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-municipal-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        location.percentage >= 85 ? 'bg-green-500' :
                        location.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">24</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                New complaints today
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">18</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Resolved today
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">3.8h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg response time today
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;