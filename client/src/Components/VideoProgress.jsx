import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getVideoProgress, 
  updateVideoProgress,
  resetVideoProgress 
} from '../Redux/Slices/VideoProgressSlice';
import { 
  FaPlay, 
  FaPause, 
  FaClock, 
  FaUser, 
  FaCheckCircle, 
  FaCircle,
  FaUndo,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaList
} from 'react-icons/fa';
import CheckpointDetails from './CheckpointDetails';

const VideoProgress = ({ 
  videoId, 
  courseId, 
  currentTime = 0, 
  duration = 0, 
  isPlaying = false,
  onSeek,
  showProgress = true 
}) => {
  const dispatch = useDispatch();
  const { currentVideoProgress, loading } = useSelector((state) => state.videoProgress);
  const { data: userData } = useSelector((state) => state.auth);
  const [showDetails, setShowDetails] = useState(false);
  const [showCheckpointDetails, setShowCheckpointDetails] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [progressRestored, setProgressRestored] = useState(false);
  const progressRestoredRef = useRef(false);

  // Get video progress when component mounts
  useEffect(() => {
    if (videoId && courseId) {
      console.log('Getting video progress for:', { courseId, videoId });
      // Reset progress restoration flag when video changes
      progressRestoredRef.current = false;
      dispatch(getVideoProgress({ courseId, videoId }));
    }
  }, [dispatch, videoId, courseId]);

  // Smart checkpoint tracking system
  const [nextCheckpointIndex, setNextCheckpointIndex] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  // Generate checkpoints based on video duration
  const generateCheckpoints = (duration) => {
    if (!duration || duration <= 0) return [];
    
    const percentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    return percentages.map(percentage => ({
      percentage,
      time: Math.round((duration * percentage) / 100),
      reached: false
    }));
  };

  // Get current checkpoints
  const currentCheckpoints = generateCheckpoints(duration);

  // Smart algorithm to calculate accurate watch time and progress
  const calculateAccurateProgress = (currentTime, duration, isPlaying) => {
    if (!duration || duration <= 0) return { progress: 0, watchTime: 0 };

    // Calculate progress percentage
    let progress = Math.round((currentTime / duration) * 100);
    
    // Prevent progress from going backwards (use stored progress as minimum)
    const storedProgress = currentVideoProgress?.progress || 0;
    if (progress < storedProgress && currentTime > 0) {
      console.log(`Progress protection: preventing regression from ${storedProgress}% to ${progress}%. Using stored progress.`);
      progress = storedProgress;
    }
    
    // Additional validation: if currentTime is 0 but we have stored progress, don't regress
    if (currentTime === 0 && storedProgress > 0) {
      console.log(`Progress protection: currentTime is 0 but stored progress is ${storedProgress}%. Maintaining stored progress.`);
      progress = storedProgress;
    }
    
    // Calculate watch time (only count when actually playing)
    let watchTime = 0;
    if (isPlaying) {
      const now = Date.now();
      if (lastUpdateTime > 0) {
        // Only count time if user is actively watching (not paused, not seeking)
        const timeDiff = (now - lastUpdateTime) / 1000; // Convert to seconds
        if (timeDiff <= 1.5) { // Allow small gaps for network delays
          watchTime = timeDiff;
        }
      }
      setLastUpdateTime(now);
    }

    return { progress, watchTime };
  };

  // Alternative: Calculate watch time based on current time if duration is available
  const calculateWatchTimeFromProgress = (currentTime, duration) => {
    if (!duration || duration <= 0) return 0;
    
    // Estimate watch time based on current position (minimum of current time)
    return Math.max(currentTime, totalWatchTime);
  };

  // Smart checkpoint detection - only check the next checkpoint
  const checkNextCheckpoint = (currentTime) => {
    if (nextCheckpointIndex >= currentCheckpoints.length) return null;
    
    const nextCheckpoint = currentCheckpoints[nextCheckpointIndex];
    
    // Validate that current time is reasonable before marking checkpoint as reached
    if (currentTime >= nextCheckpoint.time && nextCheckpoint.time > 0) {
      // Additional validation: ensure we have meaningful watch time
      if (totalWatchTime >= 10) { // At least 10 seconds watched
        // Mark this checkpoint as reached and move to next
        setNextCheckpointIndex(prev => prev + 1);
        return nextCheckpoint.percentage;
      } else {
        console.log('Checkpoint not reached: insufficient watch time', { currentTime, checkpointTime: nextCheckpoint.time, totalWatchTime });
      }
    }
    
    return null;
  };

  // Initialize checkpoint tracking when video loads
  useEffect(() => {
    if (duration > 0 && currentVideoProgress && !progressRestoredRef.current) {
      console.log('Initializing video progress from saved data:', currentVideoProgress);
      
      // Mark that we've restored progress to prevent infinite loop
      progressRestoredRef.current = true;
      
      // Find the next unreached checkpoint
      const reachedPercentages = currentVideoProgress.reachedPercentages || [];
      const reachedPercentageValues = reachedPercentages.map(rp => rp.percentage);
      
      // Validate checkpoint data - if progress is 0% but checkpoints are reached, reset them
      const currentProgress = Math.round((currentVideoProgress.currentTime / duration) * 100);
      if (currentProgress === 0 && reachedPercentageValues.length > 0) {
        console.log('Data inconsistency detected: 0% progress but checkpoints reached. Resetting checkpoints.');
        // Reset the inconsistent data by not setting any reached checkpoints
        setNextCheckpointIndex(0);
      } else {
        let nextIndex = 0;
        for (let i = 0; i < currentCheckpoints.length; i++) {
          if (!reachedPercentageValues.includes(currentCheckpoints[i].percentage)) {
            nextIndex = i;
            break;
          }
        }
        setNextCheckpointIndex(nextIndex);
      }
      
      // Initialize total watch time from backend data
      if (currentVideoProgress.totalWatchTime) {
        setTotalWatchTime(currentVideoProgress.totalWatchTime);
      }
      
      // If user has existing progress, seek to that position
      if (currentVideoProgress.currentTime > 0 && onSeek) {
        console.log('Seeking to saved position:', currentVideoProgress.currentTime, 'seconds');
        // Small delay to ensure player is ready
        setTimeout(() => {
          onSeek(currentVideoProgress.currentTime);
          // Show notification to user
          const minutes = Math.floor(currentVideoProgress.currentTime / 60);
          const seconds = Math.floor(currentVideoProgress.currentTime % 60);
          console.log(`✅ Progress restored! Resuming from ${minutes}:${seconds.toString().padStart(2, '0')}`);
          setProgressRestored(true);
          // Hide notification after 3 seconds
          setTimeout(() => setProgressRestored(false), 3000);
        }, 500);
      }
      
      // Special case: If video is completed but watch time is low, estimate it
      if (currentProgress >= 90 && (!currentVideoProgress.totalWatchTime || currentVideoProgress.totalWatchTime < duration * 0.8)) {
        console.log('Video completed but watch time seems low, estimating...');
        const estimatedWatchTime = Math.max(duration * 0.8, currentTime); // At least 80% of duration
        setTotalWatchTime(estimatedWatchTime);
        
        // Update backend with estimated watch time
        dispatch(updateVideoProgress({
          courseId,
          videoId,
          progressData: {
            currentTime,
            duration,
            progress: currentProgress,
            watchTime: estimatedWatchTime - (currentVideoProgress.totalWatchTime || 0)
          }
        }));
      }
    }
  }, [duration, currentVideoProgress, currentCheckpoints, dispatch, courseId, videoId, currentTime]);

  // Smart progress tracking - ensures continuous progress accumulation
  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        if (isPlaying) {
          const { progress, watchTime } = calculateAccurateProgress(currentTime, duration, isPlaying);
          const newReachedPercentage = checkNextCheckpoint(currentTime);
          
          // Always accumulate watch time (never reset)
          if (watchTime > 0) {
            setTotalWatchTime(prev => {
              const newTotal = prev + watchTime;
              console.log('Accumulating watch time:', prev, '+', watchTime, '=', newTotal);
              return newTotal;
            });
          }
          
          // Ensure watch time is at least as much as current time (for completed videos)
          const estimatedWatchTime = calculateWatchTimeFromProgress(currentTime, duration);
          if (estimatedWatchTime > totalWatchTime) {
            console.log('Updating watch time to match current progress:', totalWatchTime, '->', estimatedWatchTime);
            setTotalWatchTime(estimatedWatchTime);
          }
          
          // Only update backend if significant change or new checkpoint reached
          const currentBackendProgress = currentVideoProgress?.progress || 0;
          const progressChanged = Math.abs(progress - currentBackendProgress) > 1;
          const checkpointReached = newReachedPercentage !== null;
          const watchTimeIncreased = watchTime > 0;
          const estimatedTimeIncreased = estimatedWatchTime > totalWatchTime;
          
          // Additional safety: prevent sending regressive progress updates
          const isProgressRegressive = progress < currentBackendProgress;
          
          const shouldUpdate = (progressChanged || checkpointReached || watchTimeIncreased || estimatedTimeIncreased) && !isProgressRegressive;
          
          if (shouldUpdate) {
            console.log('Updating backend progress:', {
              progress: `${currentBackendProgress}% -> ${progress}%`,
              watchTime: watchTime,
              checkpoint: newReachedPercentage,
              totalWatchTime: totalWatchTime
            });
            
            dispatch(updateVideoProgress({
              courseId,
              videoId,
              progressData: {
                currentTime,
                duration,
                progress,
                watchTime: Math.max(watchTime, estimatedWatchTime - totalWatchTime),
                reachedPercentage: newReachedPercentage
              }
            }));
          } else if (isProgressRegressive) {
            console.log('Skipping regressive progress update:', {
              currentBackendProgress: `${currentBackendProgress}%`,
              calculatedProgress: `${progress}%`,
              currentTime,
              reason: 'Progress would go backwards'
            });
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dispatch, courseId, videoId, currentTime, duration, isPlaying, currentVideoProgress, nextCheckpointIndex, lastUpdateTime, totalWatchTime]);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your progress for this video?')) {
      dispatch(resetVideoProgress({ courseId, videoId })).then(() => {
        setNextCheckpointIndex(0);
        setTotalWatchTime(0);
        setLastUpdateTime(0);
        dispatch(getVideoProgress({ courseId, videoId }));
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-500';
    if (progress >= 70) return 'text-blue-500';
    if (progress >= 50) return 'text-blue-500';
    return 'text-red-500';
  };



  if (!showProgress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      {/* Progress Restored Notification */}
      {progressRestored && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span className="text-sm font-medium">
            ✅ Progress restored! Video will resume from where you left off.
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaUser className="text-blue-500" />
                  <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {userData?.fullName || 'User'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Video Progress
            {currentVideoProgress?.isCompleted && (
              <span className="ml-2 text-green-500 font-medium">✓ Completed</span>
            )}
          </p>
        </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showDetails ? "Hide Details" : "Show Details"}
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
          </button>
          
          <button
            onClick={() => setShowCheckpointDetails(!showCheckpointDetails)}
            className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
            title={showCheckpointDetails ? "Hide Checkpoint Details" : "Show Checkpoint Details"}
          >
            <FaList />
          </button>
          
          <button
            onClick={handleResetProgress}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Reset Progress"
          >
            <FaUndo />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span className={`font-semibold ${getProgressColor(currentVideoProgress?.progress || 0)}`}>
            {currentVideoProgress?.progress || 0}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" dir="ltr">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentVideoProgress?.progress || 0}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Smart Checkpoints Display */}
      {currentCheckpoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FaClock />
            Progress Checkpoints
            <span className="text-xs text-blue-500">
              (Next: {nextCheckpointIndex < currentCheckpoints.length ? `${currentCheckpoints[nextCheckpointIndex]?.percentage}%` : 'Complete'})
            </span>
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {currentCheckpoints.map((checkpoint, index) => {
              const isReached = index < nextCheckpointIndex;
              const isNext = index === nextCheckpointIndex;
              const isFuture = index > nextCheckpointIndex;
              
              let icon, color;
              if (isReached) {
                icon = FaCheckCircle;
                color = 'text-green-500';
              } else if (isNext) {
                icon = FaClock;
                color = 'text-blue-500';
              } else {
                icon = FaCircle;
                color = 'text-gray-400';
              }
              
              const Icon = icon;
              const hasValidTime = checkpoint.time > 0;
              
              return (
                <div key={index} className={`text-center ${isNext ? 'ring-2 ring-blue-300 rounded-lg p-1' : ''}`}>
                  <Icon className={`mx-auto mb-1 ${color}`} />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {checkpoint.percentage}%
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {hasValidTime ? formatTime(checkpoint.time) : 'Loading...'}
                  </div>
                </div>
              );
            })}
          </div>
          {duration === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Video duration will be available once video loads
            </div>
          )}
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 font-semibold ${
                currentVideoProgress?.isCompleted ? 'text-green-500' : 'text-blue-500'
              }`}>
                {currentVideoProgress?.isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Watch Time:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {formatTime(currentVideoProgress?.totalWatchTime || 0)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Watched:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {currentVideoProgress?.lastWatched ? 
                  new Date(currentVideoProgress.lastWatched).toLocaleDateString() : 
                  'Never'
                }
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Checkpoints Reached:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {nextCheckpointIndex} / {currentCheckpoints.length}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Next Checkpoint:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {nextCheckpointIndex < currentCheckpoints.length 
                  ? `${currentCheckpoints[nextCheckpointIndex]?.percentage}% (${formatTime(currentCheckpoints[nextCheckpointIndex]?.time || 0)})`
                  : 'All Complete!'
                }
              </span>
            </div>

            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Watch Time:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {formatTime(Math.round(currentVideoProgress?.totalWatchTime || totalWatchTime))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Checkpoint View */}
      {showCheckpointDetails && currentCheckpoints.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <CheckpointDetails 
            checkpoints={currentCheckpoints}
            currentTime={currentTime}
            reachedCheckpoints={currentVideoProgress?.reachedPercentages || []}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Updating progress...</span>
        </div>
      )}
    </div>
  );
};

export default VideoProgress; 