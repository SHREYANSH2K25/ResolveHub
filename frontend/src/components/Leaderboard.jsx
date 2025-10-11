import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Trophy, Medal, Award, Star, TrendingUp, Users, Crown, Zap, RefreshCw, CheckCircle } from 'lucide-react';

const Leaderboard = ({ leaderboardData: propData, loading: propLoading = false, limit = 10 }) => {
  const [leaderboardData, setLeaderboardData] = useState(propData || []);
  const [loading, setLoading] = useState(propLoading);
  const { user } = useAuth();

  useEffect(() => {
    if (!propData) {
      fetchLeaderboard();
    } else {
      setLeaderboardData(propData);
      setLoading(propLoading);
    }
  }, [propData, propLoading]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLeaderboard(limit);
      setLeaderboardData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard data');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold text-sm">{index + 1}</span>;
    }
  };

  const getBadgeIcon = (badge) => {
    return <span className="text-lg">{badge.icon}</span>;
  };

  const getBadgeColor = (badge) => {
    return {
      backgroundColor: badge.color + '20',
      borderColor: badge.color,
      color: badge.color
    };
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 2:
        return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30';
      default:
        return 'bg-gray-800/50 border-gray-700/50';
    }
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Leaderboard</h3>
            <p className="text-gray-400 text-sm">Top performing staff members</p>
          </div>
        </div>
        
        {!propData && (
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {loading && !propData ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Loading leaderboard...</p>
          </div>
        </div>
      ) : leaderboardData?.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-gray-800/40 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gray-600" />
          </div>
          <h4 className="text-gray-300 font-medium mb-2">No Data Available</h4>
          <p className="text-gray-500 text-sm">Staff performance data will appear here once available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboardData?.slice(0, 4).map((staff, index) => (
            <div
              key={staff._id || staff.id}
              className={`relative group p-4 rounded-xl transition-all duration-300 ${
                user && (user._id === staff._id || user._id === staff.id)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                  : `${getRankBg(index)} hover:scale-[1.02]`
              }`}
            >
              {/* Rank indicator */}
              <div className="absolute -left-1 top-4 flex items-center">
                {getRankIcon(index)}
              </div>
              
              <div className="ml-8 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold truncate ${
                      user && (user._id === staff._id || user._id === staff.id) ? 'text-white' : 'text-gray-200'
                    }`}>
                      {staff.fullname || staff.name}
                    </h4>
                    
                    {user && (user._id === staff._id || user._id === staff.id) && (
                      <span className="px-2 py-1 text-xs bg-blue-500/30 text-blue-200 rounded-full border border-blue-500/30">
                        You
                      </span>
                    )}
                    
                    {/* Top performer indicator */}
                    {index < 3 && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                        'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      }`}>
                        {index === 0 ? '🏆 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    {staff.department} {staff.city && `• ${staff.city}`}
                  </p>
                  
                  {/* Performance metrics */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-yellow-500/20">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-yellow-400">
                          {staff.totalPoints || staff.points || 0}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">points</span>
                      </div>
                    </div>
                    
                    {(staff.complaintsResolved || staff.complaintsResolved === 0) && (
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-green-500/20">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-400">
                            {staff.complaintsResolved}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">resolved</span>
                        </div>
                      </div>
                    )}
                    
                    {(staff.badges?.length || staff.badges?.length === 0) && (
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-purple-500/20">
                          <Award className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-purple-400">
                            {staff.badges?.length || 0}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">badges</span>
                        </div>
                      </div>
                    )}
                    
                    {((staff.currentStreak && staff.currentStreak > 0) || (staff.resolutionStreak && staff.resolutionStreak > 0)) && (
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-orange-500/20">
                          <span className="text-orange-400 text-xs">🔥</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-orange-400">
                            {staff.currentStreak || staff.resolutionStreak}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">streak</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Badges preview */}
                  {staff.badges && staff.badges.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Badges:</span>
                      <div className="flex gap-1 flex-wrap">
                        {staff.badges.slice(0, 3).map((badge, badgeIndex) => (
                          <span 
                            key={badgeIndex}
                            className="px-2 py-1 text-xs rounded border"
                            style={{
                              backgroundColor: badge.color ? `${badge.color}20` : '#8b5cf620',
                              borderColor: badge.color ? `${badge.color}40` : '#8b5cf640',
                              color: badge.color || '#a78bfa'
                            }}
                            title={badge.name || badge.title}
                          >
                            {badge.icon || '🏅'} {badge.name || badge.title}
                          </span>
                        ))}
                        {staff.badges.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{staff.badges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Single badge display for staff.badge (original mock data) */}
                  {staff.badge && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Current badge:</span>
                      <span 
                        className="px-2 py-1 text-xs rounded-full font-medium border"
                        style={{
                          backgroundColor: `${staff.badge.color}20`,
                          borderColor: `${staff.badge.color}40`,
                          color: staff.badge.color
                        }}
                      >
                        {staff.badge.icon} {staff.badge.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  {staff.averageRating && (
                    <div className="text-sm text-gray-400 mt-1">
                      ⭐ {staff.averageRating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Leaderboard footer */}
          {leaderboardData?.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Updated every hour • Top {leaderboardData.length} performers</span>
                {!propData && (
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;