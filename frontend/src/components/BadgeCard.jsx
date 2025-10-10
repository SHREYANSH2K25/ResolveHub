const BadgeCard = ({ badge, count = 0, isActive = false }) => {
  return (
    <div 
      className={`relative p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
        isActive 
          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50' 
          : 'bg-gray-800/50 border-gray-700/50'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3 ${
            isActive 
              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50' 
              : 'bg-gray-700/50 border-2 border-gray-600/50'
          }`}
        >
          {badge.icon}
        </div>
        
        <h4 className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
          {badge.name}
        </h4>
        
        <div className="text-sm text-gray-400 mb-2">
          {badge.minPoints ? `${badge.minPoints}+ points` : badge.description}
        </div>
        
        {count > 0 && (
          <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            {count} staff
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;