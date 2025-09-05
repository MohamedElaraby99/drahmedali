import React from 'react';
import { FaCheckCircle, FaCircle, FaClock, FaPercent } from 'react-icons/fa';

const CheckpointDetails = ({ checkpoints = [], currentTime = 0, reachedCheckpoints = new Set() }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCheckpointStatus = (checkpoint, index) => {
    if (checkpoint.reached) {
      return { icon: FaCheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    }
    if (reachedCheckpoints.has(index) || currentTime >= checkpoint.time) {
      return { icon: FaCheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    }
    return { icon: FaCircle, color: 'text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' };
  };

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        No checkpoints available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <FaClock />
        Detailed Progress Checkpoints
      </h4>
      
      <div className="grid grid-cols-1 gap-2">
        {checkpoints.map((checkpoint, index) => {
          const { icon: Icon, color, bgColor } = getCheckpointStatus(checkpoint, index);
          const isReached = checkpoint.reached || reachedCheckpoints.has(index) || currentTime >= checkpoint.time;
          
          return (
            <div 
              key={index} 
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isReached 
                  ? 'border-green-200 dark:border-green-700' 
                  : 'border-gray-200 dark:border-gray-600'
              } ${bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`text-lg ${color}`} />
                  <div className="flex items-center gap-2">
                    <FaPercent className="text-xs text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {checkpoint.percentage}%
                    </span>
                  </div>
                </div>
                
                                 <div className="flex items-center gap-2 text-sm">
                   <FaClock className="text-gray-500 dark:text-gray-400" />
                   <span className="text-gray-700 dark:text-gray-300">
                     {checkpoint.time > 0 ? formatTime(checkpoint.time) : 'Loading...'}
                   </span>
                 </div>
              </div>
              
              {checkpoint.reached && checkpoint.reachedAt && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Reached: {new Date(checkpoint.reachedAt).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Progress Summary:</strong>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          • {checkpoints.filter(cp => cp.reached).length} of {checkpoints.length} checkpoints reached
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-300">
          • Current progress: {(() => {
            const maxTime = checkpoints[checkpoints.length - 1]?.time || 1;
            return maxTime > 0 ? Math.round((currentTime / maxTime) * 100) : 0;
          })()}%
        </div>
      </div>
    </div>
  );
};

export default CheckpointDetails; 