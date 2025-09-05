import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaExpand, 
  FaCompress, 
  FaVolumeUp, 
  FaVolumeMute,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaSpinner,
  FaCog,
  FaClosedCaptioning,
  FaShare,
  FaHeart,
  FaBookmark,
  FaStepBackward,
  FaStepForward,
  FaVideo
} from 'react-icons/fa';

const VideoController = ({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  courseTitle = "Course Video"
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);

  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const controlsTimerRef = useRef(null);

  // Simulated video state
  const [videoState, setVideoState] = useState({
    ready: false,
    canPlay: false,
    seeking: false,
    error: null
  });

  useEffect(() => {
    if (isOpen && video) {
      initializeVideo();
      startControlsTimer();
    }
    
    return () => {
      clearControlsTimer();
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isOpen, video]);

  const initializeVideo = () => {
    setIsLoading(true);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowControls(true);
    setVideoState({ ready: false, canPlay: false, seeking: false, error: null });
    
    // Debug: Log video data
    console.log('Video data received:', video);
    console.log('Video URL:', getVideoUrl(video));
    console.log('Video title:', getVideoTitle(video));
    
    // Check if it's a YouTube video
    const videoUrl = getVideoUrl(video);
    const videoId = extractYouTubeVideoId(videoUrl);
    
    if (videoId) {
      console.log('YouTube video detected with ID:', videoId);
      setIsYouTube(true);
      setYoutubeVideoId(videoId);
      setVideoState(prev => ({ ...prev, ready: true, canPlay: true }));
      setIsLoading(false);
    } else {
      console.log('Not a YouTube video, using simulated player');
      setIsYouTube(false);
      setYoutubeVideoId(null);
      // Simulate video loading for non-YouTube videos
      setTimeout(() => {
        setIsLoading(false);
        setVideoState(prev => ({ ...prev, ready: true, canPlay: true }));
        setDuration(180); // Simulate 3 minutes duration
      }, 2000);
    }
  };

  const startControlsTimer = () => {
    clearControlsTimer();
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const clearControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  };

  // Simulate video progress
  useEffect(() => {
    let interval;
    if (isPlaying && !isDragging && videoState.canPlay) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isDragging, videoState.canPlay, duration]);

  // Simulate buffering
  useEffect(() => {
    if (isPlaying && videoState.canPlay) {
      const interval = setInterval(() => {
        setBuffered(prev => Math.min(prev + Math.random() * 5, 100));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, videoState.canPlay]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'Home':
          e.preventDefault();
          seekTo(0);
          break;
        case 'End':
          e.preventDefault();
          seekTo(duration);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, volume, isMuted, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    startControlsTimer();
  };

  const togglePlay = () => {
    if (!videoState.canPlay) return;
    
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate play action
      console.log('Playing video...');
    } else {
      // Simulate pause action
      console.log('Pausing video...');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      console.log('Unmuting video...');
    } else {
      console.log('Muting video...');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const seek = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  const seekTo = (time) => {
    const newTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(newTime);
    setVideoState(prev => ({ ...prev, seeking: true }));
    
    // Simulate seeking
    setTimeout(() => {
      setVideoState(prev => ({ ...prev, seeking: false }));
    }, 500);
    
    console.log(`Seeking to ${formatTime(newTime)}`);
  };

  const adjustVolume = (change) => {
    const newVolume = Math.max(0, Math.min(1, volume + change));
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    console.log(`Volume set to ${Math.round(newVolume * 100)}%`);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    console.log(`Volume set to ${Math.round(newVolume * 100)}%`);
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const clickPercent = clickX / progressWidth;
    const newTime = clickPercent * duration;
    
    seekTo(newTime);
  };

  const handleProgressDrag = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const progressWidth = rect.width;
    const clickPercent = clickX / progressWidth;
    const newTime = clickPercent * duration;
    
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: getVideoTitle(video),
        text: getVideoDescription(video) || 'Check out this video from the course!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getVideoUrl = (video) => {
    // Handle lesson data structure from DisplayLecture
    if (video?.lecture?.youtubeUrl) {
      return video.lecture.youtubeUrl;
    }
    // Handle direct video object structure
    if (video?.youtubeUrl) {
      return video.youtubeUrl;
    }
    return video?.lecture?.secure_url || video?.secure_url || '';
  };

  const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return '';
    // Simple embed URL that should work
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('Generated YouTube embed URL:', embedUrl);
    return embedUrl;
  };

  const getVideoTitle = (video) => {
    return video?.title || video?.lecture?.title || "Video Player";
  };

  const getVideoDescription = (video) => {
    return video?.description || video?.lecture?.description || "";
  };

  if (!isOpen || !video) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 ${isFullscreen ? 'z-[9999]' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-90" onClick={handleClose}></div>
      
      {/* Video Container */}
      <div className={`relative w-full h-full flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
        <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full max-h-[80vh]'}`}>
          
          {/* Debug Panel - Remove this in production */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-20 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
              <h4 className="font-bold mb-2">Debug Info:</h4>
              <div className="space-y-1">
                <p><strong>Video URL:</strong> {getVideoUrl(video)}</p>
                <p><strong>Video Title:</strong> {getVideoTitle(video)}</p>
                <p><strong>Is YouTube:</strong> {isYouTube ? 'Yes' : 'No'}</p>
                <p><strong>YouTube ID:</strong> {youtubeVideoId || 'None'}</p>
                <p><strong>Has YouTube URL:</strong> {!!video?.lecture?.youtubeUrl ? 'Yes' : 'No'}</p>
                <p><strong>Has Secure URL:</strong> {!!video?.lecture?.secure_url ? 'Yes' : 'No'}</p>
                <p><strong>Embed URL:</strong> {youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId) : 'None'}</p>
                {youtubeVideoId && (
                  <button 
                    onClick={() => window.open(getYouTubeEmbedUrl(youtubeVideoId), '_blank')}
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    Test YouTube URL
                  </button>
                )}
              </div>
            </div>
          )} */}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
                <p className="text-white">Loading video...</p>
                <p className="text-white text-sm mt-2">Initializing player...</p>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isYouTube && youtubeVideoId ? (
              <div className="absolute inset-0">
                <iframe
                  src={getYouTubeEmbedUrl(youtubeVideoId)}
                  title={getVideoTitle(video)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={() => {
                    console.log('YouTube iframe loaded successfully');
                    setIsLoading(false);
                    setVideoState(prev => ({ ...prev, ready: true, canPlay: true }));
                  }}
                  onError={() => {
                    console.error('YouTube iframe failed to load');
                    setIsLoading(false);
                    setVideoState(prev => ({ ...prev, error: 'Failed to load video' }));
                  }}
                />
                {/* Fallback link in case iframe doesn't work */}
                <div className="absolute bottom-4 right-4">
                  <a 
                    href={getVideoUrl(video)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Open in YouTube
                  </a>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaVideo className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">{getVideoTitle(video)}</h3>
                  <p className="text-gray-300">{courseTitle}</p>
                  {getVideoUrl(video) && (
                    <div className="mt-4 p-3 bg-black/30 rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">Video Source:</p>
                      <p className="text-xs text-blue-400 break-all">{getVideoUrl(video)}</p>
                    </div>
                  )}
                  {videoState.seeking && (
                    <div className="mt-4">
                      <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto" />
                      <p className="text-sm text-gray-400 mt-2">Seeking...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
              
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                  <div className="text-white">
                    <h3 className="font-semibold text-lg">{getVideoTitle(video)}</h3>
                    <p className="text-sm text-gray-300">{courseTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-lg transition-colors ${
                      isLiked ? 'text-red-500 bg-red-500/20' : 'text-white hover:bg-black/30'
                    }`}
                  >
                    <FaHeart className="text-lg" />
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked ? 'text-blue-500 bg-blue-500/20' : 'text-white hover:bg-black/30'
                    }`}
                  >
                    <FaBookmark className="text-lg" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                  >
                    <FaShare className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button
                  onClick={togglePlay}
                  disabled={!videoState.canPlay}
                  className={`bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors ${
                    !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPlaying ? (
                    <FaPause className="text-white text-4xl" />
                  ) : (
                    <FaPlay className="text-white text-4xl ml-2" />
                  )}
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-auto">
                {hasPrevious && (
                  <button
                    onClick={onPrevious}
                    className="bg-black/50 text-white p-3 rounded-r-lg hover:bg-black/70 transition-colors"
                  >
                    <FaChevronLeft className="text-xl" />
                  </button>
                )}
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-auto">
                {hasNext && (
                  <button
                    onClick={onNext}
                    className="bg-black/50 text-white p-3 rounded-l-lg hover:bg-black/70 transition-colors"
                  >
                    <FaChevronRight className="text-xl" />
                  </button>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div 
                    ref={progressBarRef}
                    className="w-full bg-white/30 rounded-full h-1 cursor-pointer relative"
                    onClick={handleProgressClick}
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      handleProgressDrag(e);
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        handleProgressDrag(e);
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* Buffered progress */}
                    <div 
                      className="bg-white/50 h-1 rounded-full absolute top-0 left-0"
                      style={{ width: `${buffered}%` }}
                    ></div>
                    {/* Played progress */}
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200 relative z-10"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg z-20"
                      style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                    </button>
                    
                    <button
                      onClick={() => seek(-10)}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaStepBackward className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => seek(10)}
                      disabled={!videoState.canPlay}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !videoState.canPlay ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaStepForward className="text-lg" />
                    </button>
                    
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                      </button>
                      
                      <div 
                        className={`absolute bottom-full left-0 mb-2 bg-black/90 rounded-lg p-2 transition-opacity ${
                          showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <input
                          ref={volumeSliderRef}
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            handleVolumeChange(parseFloat(e.target.value));
                          }}
                          className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                          }}
                        />
                        <div className="text-white text-xs text-center mt-1">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white text-sm">
                      <FaClock className="text-gray-400" />
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`p-2 rounded-lg transition-colors ${
                        showCaptions ? 'text-blue-500 bg-blue-500/20' : 'text-white hover:bg-black/30'
                      }`}
                    >
                      <FaClosedCaptioning className="text-lg" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                      >
                        <FaCog className="text-lg" />
                      </button>
                      
                      {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 text-white rounded-lg p-2 min-w-[120px]">
                          <div className="text-sm mb-2">Playback Speed</div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => {
                                setPlaybackRate(rate);
                                setShowSettings(false);
                                console.log(`Playback rate set to ${rate}x`);
                              }}
                              className={`block w-full text-left px-2 py-1 rounded text-sm ${
                                playbackRate === rate ? 'bg-blue-500' : 'hover:bg-white/20'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/30 rounded-lg"
                    >
                      {isFullscreen ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Info Panel */}
          {showControls && getVideoDescription(video) && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white pointer-events-auto">
              <h4 className="font-semibold mb-2">{getVideoTitle(video)}</h4>
              <p className="text-sm text-gray-300">{getVideoDescription(video)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoController; 