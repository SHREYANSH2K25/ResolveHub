import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, TrendingUp, Users, Target, Calendar, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/apiService';
import Leaderboard from './Leaderboard';

const GamificationDashboard = ({ userRole = 'admin' }) => {
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalBadges: 0,
    totalStaff: 0,
    avgResolutionTime: 0,
    topPerformers: [],
    recentAchievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationStats();
  }, []);

  const fetchGamificationStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGamificationStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      toast.error('Failed to load gamification statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend, color, bgColor }) => (
    <div className={`${bgColor} backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const AchievementBadge = ({ badge, isRecent = false }) => (
    <div className={`p-3 rounded-xl border transition-all duration-300 ${
      isRecent 
        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-lg shadow-purple-500/10' 
        : 'bg-gray-800/40 border-gray-700/40'
    }`}>
      <div className="text-center">
        <div className={`text-3xl mb-2 ${isRecent ? 'animate-bounce' : ''}`}>
          {badge.icon || '🏅'}
        </div>
        <h4 className="font-medium text-white text-sm">{badge.name}</h4>
        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
        {badge.rarity && (
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
            badge.rarity === 'rare' ? 'bg-purple-500/20 text-purple-300' :
            badge.rarity === 'epic' ? 'bg-orange-500/20 text-orange-300' :
            badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {badge.rarity}
          </span>
        )}
      </div>
    </div>
  );

  const mockBadges = [
    { icon: '🏆', name: 'Problem Solver', description: 'Resolved 100+ complaints', rarity: 'epic' },
    { icon: '⚡', name: 'Speed Demon', description: 'Fastest resolution time', rarity: 'rare' },
    { icon: '🎯', name: 'Accuracy Expert', description: '95% resolution accuracy', rarity: 'legendary' },
    { icon: '🔥', name: 'Streak Master', description: '10 day resolution streak', rarity: 'rare' },
    { icon: '👑', name: 'Department Leader', description: 'Top performer this month', rarity: 'epic' },
    { icon: '🌟', name: 'Rising Star', description: 'Most improved performer', rarity: 'common' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/40 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Star}
          title="Total Points Awarded"
          value={stats.totalPoints?.toLocaleString() || '0'}
          trend={12}
          color="bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Award}
          title="Badges Earned"
          value={stats.totalBadges || '0'}
          trend={8}
          color="bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Users}
          title="Active Staff"
          value={stats.totalStaff || '0'}
          trend={5}
          color="bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Target}
          title="Avg Resolution Time"
          value={stats.avgResolutionTime ? `${stats.avgResolutionTime}h` : '0h'}
          trend={-15}
          color="bg-gradient-to-r from-green-500/20 to-emerald-500/20"
          bgColor="bg-gray-800/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="space-y-4">
          <Leaderboard limit={5} />
          
          {/* Quick Actions */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={fetchGamificationStats}
                className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 transition-all duration-300"
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Refresh Stats</span>
              </button>
              
              <button className="p-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-all duration-300">
                <Award className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Award Badge</span>
              </button>
              
              <button className="p-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 hover:text-green-200 transition-all duration-300">
                <Star className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Bonus Points</span>
              </button>
              
              <button className="p-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 hover:text-orange-200 transition-all duration-300">
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">View Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Achievement Gallery */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Achievement Gallery
              </h3>
              <p className="text-gray-400 text-sm">Available badges and achievements</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockBadges.map((badge, index) => (
              <AchievementBadge 
                key={index} 
                badge={badge} 
                isRecent={index < 2} // Mark first 2 as recent for demo
              />
            ))}
          </div>

          {/* Recent Achievements */}
          {stats.recentAchievements?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700/40">
              <h4 className="text-md font-medium text-white mb-3">Recent Achievements</h4>
              <div className="space-y-2">
                {stats.recentAchievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30">
                    <span className="text-2xl">{achievement.icon || '🏅'}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{achievement.staffName}</p>
                      <p className="text-gray-400 text-xs">earned "{achievement.badgeName}"</p>
                    </div>
                    <span className="text-xs text-gray-500">{achievement.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-gray-700/30">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {stats.weeklyGrowth || '+12%'}
            </div>
            <p className="text-sm text-gray-400">Weekly Point Growth</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gray-700/30">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {stats.activeStreaks || '8'}
            </div>
            <p className="text-sm text-gray-400">Active Streaks</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gray-700/30">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {stats.topDepartment || 'Engineering'}
            </div>
            <p className="text-sm text-gray-400">Leading Department</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;