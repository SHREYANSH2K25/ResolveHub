import { Users, Trophy, Target, TrendingUp, Award, Star } from 'lucide-react';
import BadgeCard from './BadgeCard';

const GamificationStats = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 animate-pulse">
              <div className="h-12 bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Staff',
      value: stats?.totalStaff || 0,
      icon: Users,
      color: 'blue',
      subtitle: 'Active members'
    },
    {
      title: 'Total Points',
      value: stats?.totalPoints || 0,
      icon: Star,
      color: 'yellow',
      subtitle: 'Points awarded'
    },
    {
      title: 'Average Points',
      value: stats?.averagePoints || 0,
      icon: Target,
      color: 'green',
      subtitle: 'Per staff member'
    },
    {
      title: 'Top Performer',
      value: stats?.topPerformer?.points || 0,
      icon: Trophy,
      color: 'purple',
      subtitle: stats?.topPerformer?.name || 'None yet'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-600 to-blue-700 text-blue-400 border-blue-500/30',
      yellow: 'from-yellow-600 to-yellow-700 text-yellow-400 border-yellow-500/30',
      green: 'from-green-600 to-green-700 text-green-400 border-green-500/30',
      purple: 'from-purple-600 to-purple-700 text-purple-400 border-purple-500/30',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-500" />
          Gamification Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = getColorClasses(stat.color);
            
            return (
              <div key={stat.title} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
                <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 hover:border-opacity-50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 mb-1">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Distribution */}
      {stats?.availableBadges && stats.availableBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-500" />
            Badge Distribution
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.availableBadges.map((badge) => (
              <BadgeCard
                key={badge.name}
                badge={badge}
                count={stats.badgeDistribution?.[badge.name] || 0}
                isActive={stats.badgeDistribution?.[badge.name] > 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Performer Highlight */}
      {stats?.topPerformer && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">🏆 Top Performer</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-yellow-400 font-semibold">{stats.topPerformer.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-white font-bold">{stats.topPerformer.points} points</span>
                  <span 
                    className="px-2 py-1 text-xs rounded-full font-medium border"
                    style={{
                      backgroundColor: `${stats.topPerformer.badge.color}20`,
                      borderColor: `${stats.topPerformer.badge.color}40`,
                      color: stats.topPerformer.badge.color
                    }}
                  >
                    {stats.topPerformer.badge.icon} {stats.topPerformer.badge.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationStats;