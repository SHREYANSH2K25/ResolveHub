import { Trophy, Medal, Award, Star } from 'lucide-react';

const Leaderboard = ({ leaderboardData, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">{index + 1}</span>;
    }
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
    <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-white">Staff Leaderboard</h3>
      </div>

      {leaderboardData?.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No staff members with points yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboardData?.map((staff, index) => (
            <div
              key={staff.id}
              className={`relative p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${getRankBg(index)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankIcon(index)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{staff.name}</h4>
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
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-400">{staff.department}</p>
                      {staff.resolutionStreak > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-orange-400">
                            {staff.resolutionStreak} streak
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{staff.points}</div>
                  <div className="text-sm text-gray-400">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;