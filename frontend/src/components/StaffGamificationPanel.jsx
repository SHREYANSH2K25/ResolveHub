import React, { useState, useEffect } from 'react';
import { Star, Award, Trophy, TrendingUp, Target, Calendar, Zap, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const StaffGamificationPanel = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    badges: [],
    rank: 0,
    complaintsResolved: 0,
    currentStreak: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    achievements: []
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGamificationData();
    fetchLeaderboard();
  }, []);

  const fetchUserGamificationData = async () => {
    try {
      // This would be a dedicated endpoint for individual user stats
      const response = await apiService.getUserGamificationStats(user._id);
      setUserStats(response.data || {});
    } catch (error) {
      console.error('Error fetching user gamification data:', error);
      // Fallback to mock data for demonstration
      setUserStats({
        totalPoints: 850,
        badges: [
          { name: 'Quick Responder', icon: '⚡', color: '#3b82f6', earned: '2 days ago' },
          { name: 'Problem Solver', icon: '🔧', color: '#10b981', earned: '1 week ago' },
          { name: 'Streak Master', icon: '🔥', color: '#f59e0b', earned: '2 weeks ago' }
        ],
        rank: 3,
        complaintsResolved: 45,
        currentStreak: 7,
        weeklyPoints: 120,
        monthlyPoints: 480,
        achievements: [
          { name: 'First Resolution', date: '2024-01-15', points: 50 },
          { name: '10 Day Streak', date: '2024-01-20', points: 100 },
          { name: 'Speed Demon', date: '2024-01-22', points: 75 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await apiService.getLeaderboard(5);
      setLeaderboard(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className={`${bgColor} backdrop-blur-xl rounded-xl p-4 border border-gray-700/40`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const BadgeCard = ({ badge }) => (
    <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/40 text-center">
      <div className="text-2xl mb-1">{badge.icon}</div>
      <h4 className="font-medium text-white text-sm">{badge.name}</h4>
      <p className="text-xs text-gray-400 mt-1">Earned {badge.earned}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/40 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-purple-500/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Performance</h2>
              <p className="text-blue-200">Keep up the great work, {user?.fullname}!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">#{userStats.rank}</div>
            <p className="text-blue-200 text-sm">Current Rank</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          title="Total Points"
          value={userStats.totalPoints?.toLocaleString() || '0'}
          subtitle="All time"
          color="bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Trophy}
          title="Complaints Resolved"
          value={userStats.complaintsResolved || '0'}
          subtitle="This month"
          color="bg-gradient-to-r from-green-500/20 to-emerald-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Zap}
          title="Current Streak"
          value={`${userStats.currentStreak || 0} days`}
          subtitle="Keep it up!"
          color="bg-gradient-to-r from-orange-500/20 to-red-500/20"
          bgColor="bg-gray-800/40"
        />
        
        <StatCard
          icon={Award}
          title="Badges Earned"
          value={userStats.badges?.length || '0'}
          subtitle="Achievements"
          color="bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          bgColor="bg-gray-800/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Your Badges
          </h3>
          
          {userStats.badges?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {userStats.badges.map((badge, index) => (
                <BadgeCard key={index} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No badges earned yet</p>
              <p className="text-gray-500 text-sm">Complete more tasks to earn your first badge!</p>
            </div>
          )}
        </div>

        {/* Recent Performance */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Recent Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700/30">
              <div>
                <p className="text-white font-medium">Weekly Points</p>
                <p className="text-gray-400 text-sm">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">+{userStats.weeklyPoints}</p>
                <p className="text-xs text-gray-500">+12% vs last week</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-700/30">
              <div>
                <p className="text-white font-medium">Monthly Points</p>
                <p className="text-gray-400 text-sm">This month</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">{userStats.monthlyPoints}</p>
                <p className="text-xs text-gray-500">On track for goal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Top Performers
        </h3>
        
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((staff, index) => (
            <div 
              key={staff._id || staff.id} 
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                user._id === (staff._id || staff.id)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                  : 'bg-gray-700/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <p className="text-white font-medium">
                  {staff.fullname || staff.name}
                  {user._id === (staff._id || staff.id) && (
                    <span className="ml-2 text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </p>
                <p className="text-gray-400 text-sm">{staff.department}</p>
              </div>
              
              <div className="text-right">
                <p className="text-yellow-400 font-bold">
                  {staff.totalPoints || staff.points || 0}
                </p>
                <p className="text-gray-500 text-xs">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement History */}
      {userStats.achievements?.length > 0 && (
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Recent Achievements
          </h3>
          
          <div className="space-y-3">
            {userStats.achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{achievement.name}</p>
                    <p className="text-gray-400 text-sm">{achievement.date}</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+{achievement.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffGamificationPanel;