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
  FaVideo,
  FaSpinner,
  FaCog,
  FaClosedCaptioning,
  FaDownload,
  FaShare,
  FaHeart,
  FaBookmark
} from 'react-icons/fa';

const VideoPlayer = ({ 
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
  const [isYouTube, setIsYouTube] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [playerId] = useState(`youtube-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true);
      setCurrentTime(0);
      setIsPlaying(false);
      setShowControls(true);
      setPlayerReady(false);
      
      // Check if it's a YouTube video
      const isYouTubeVideo = video?.lecture?.youtubeUrl;
      setIsYouTube(!!isYouTubeVideo);
      
      if (isYouTubeVideo) {
        // Small delay to ensure DOM element is ready
        setTimeout(() => {
          initializeYouTubePlayer();
        }, 100);
      } else {
        setIsLoading(false);
      }
      
      // Auto-hide controls after 3 seconds
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, video]);

  // Cleanup effect to destroy YouTube player
  useEffect(() => {
    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [player]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Destroy player when modal closes
      if (player && typeof player.destroy === 'function') {
        player.destroy();
        setPlayer(null);
      }
      // Reset states
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      setShowControls(false);
      setPlayerReady(false);
    }
  }, [isOpen, player]);

  const initializeYouTubePlayer = () => {
    if (window.YT && window.YT.Player) {
      const videoId = extractYouTubeVideoId(video.lecture.youtubeUrl);
      if (videoId) {
        console.log('Initializing YouTube player with video ID:', videoId);
        
        // Wait for YouTube API to be fully ready
        if (window.YT.PlayerState) {
          createPlayer();
        } else {
          console.log('YouTube API not fully ready, waiting...');
          setTimeout(initializeYouTubePlayer, 100);
        }
      }
    } else {
      console.log('YouTube API not ready, retrying...');
      setTimeout(initializeYouTubePlayer, 100);
    }
  };

  const createPlayer = () => {
    const videoId = extractYouTubeVideoId(video.lecture.youtubeUrl);
    const newPlayer = new window.YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        fs: 0,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
    setPlayer(newPlayer);
  };

  const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const onPlayerReady = (event) => {
    console.log('YouTube player ready!');
    console.log('Player object:', event.target);
    console.log('Available methods:', {
      playVideo: typeof event.target.playVideo,
      pauseVideo: typeof event.target.pauseVideo,
      seekTo: typeof event.target.seekTo,
      setVolume: typeof event.target.setVolume,
      mute: typeof event.target.mute,
      unMute: typeof event.target.unMute
    });
    
    // Wait a bit more to ensure all methods are available
    setTimeout(() => {
      setIsLoading(false);
      setPlayerReady(true);
      setDuration(event.target.getDuration());
      setVolume(event.target.getVolume() / 100);
      setIsMuted(event.target.isMuted());
      console.log('Player fully initialized and ready for controls');
    }, 500);
  };

  const onPlayerStateChange = (event) => {
    const state = event.data;
    console.log('Player state changed:', state);
    switch (state) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        break;
    }
    
    // Update current time
    if (player) {
      setCurrentTime(player.getCurrentTime());
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    setPlayerReady(false);
  };

  // Update current time for YouTube videos
  useEffect(() => {
    let interval;
    if (isYouTube && player && isPlaying && !isDragging) {
      interval = setInterval(() => {
        if (player.getCurrentTime) {
          setCurrentTime(player.getCurrentTime());
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isYouTube, player, isPlaying, isDragging]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
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
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, volume, isMuted, player]);

  const togglePlay = () => {
    if (isYouTube && player && playerReady) {
      console.log('Toggling play/pause, current state:', isPlaying);
      console.log('Player object:', player);
      console.log('Player methods:', typeof player.playVideo, typeof player.pauseVideo);
      
      // Check if player methods are available
      if (typeof player.playVideo === 'function' && typeof player.pauseVideo === 'function') {
        if (isPlaying) {
          player.pauseVideo();
        } else {
          player.playVideo();
        }
      } else {
        console.error('Player methods not available yet, trying postMessage fallback');
        // Fallback: try to access the iframe directly using postMessage
        const iframe = document.getElementById(playerId);
        if (iframe && iframe.contentWindow) {
          try {
            const command = isPlaying ? 'pauseVideo' : 'playVideo';
            console.log('Sending postMessage command:', command);
            iframe.contentWindow.postMessage(
              JSON.stringify({
                event: 'command',
                func: command,
                args: []
              }),
              '*'
            );
            // Update state manually since we can't rely on the API
            setIsPlaying(!isPlaying);
          } catch (error) {
            console.error('Failed to control iframe via postMessage:', error);
          }
        } else {
          console.error('Iframe not found for postMessage fallback');
        }
      }
    } else {
      console.log('Player not ready or not YouTube video');
      console.log('isYouTube:', isYouTube, 'player:', !!player, 'playerReady:', playerReady);
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (isYouTube && player && playerReady) {
      console.log('Toggling mute, current state:', isMuted);
      if (typeof player.mute === 'function' && typeof player.unMute === 'function') {
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
        } else {
          player.mute();
          setIsMuted(true);
        }
      } else {
        console.error('Mute methods not available');
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const seek = (seconds) => {
    if (isYouTube && player && playerReady) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      console.log('Seeking to:', newTime);
      if (typeof player.seekTo === 'function') {
        player.seekTo(newTime);
        setCurrentTime(newTime);
      } else {
        console.error('Seek method not available');
      }
    } else {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      setCurrentTime(newTime);
    }
  };

  const seekTo = (time) => {
    if (isYouTube && player && playerReady) {
      const newTime = Math.max(0, Math.min(duration, time));
      console.log('Seeking to:', newTime);
      if (typeof player.seekTo === 'function') {
        player.seekTo(newTime);
        setCurrentTime(newTime);
      } else {
        console.error('Seek method not available');
      }
    } else {
      const newTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(newTime);
    }
  };

  const adjustVolume = (change) => {
    if (isYouTube && player && playerReady) {
      const newVolume = Math.max(0, Math.min(100, (volume * 100) + (change * 100)));
      console.log('Setting volume to:', newVolume);
      if (typeof player.setVolume === 'function') {
        player.setVolume(newVolume);
        setVolume(newVolume / 100);
        if (newVolume === 0) {
          setIsMuted(true);
        } else if (isMuted) {
          setIsMuted(false);
        }
      } else {
        console.error('Volume method not available');
      }
    } else {
      const newVolume = Math.max(0, Math.min(1, volume + change));
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (isYouTube && player && playerReady) {
      const volumePercent = newVolume * 100;
      console.log('Setting volume to:', volumePercent);
      if (typeof player.setVolume === 'function') {
        player.setVolume(volumePercent);
        setVolume(newVolume);
        if (newVolume === 0) {
          setIsMuted(true);
        } else if (isMuted) {
          setIsMuted(false);
        }
      } else {
        console.error('Volume method not available');
      }
    } else {
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
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

  const handleMouseMove = () => {
    setShowControls(true);
    // Auto-hide controls after 3 seconds of no movement
    clearTimeout(window.controlsTimer);
    window.controlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || 'Course Video',
        text: video?.description || 'Check out this video from the course!',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const getVideoUrl = (video) => {
    if (video?.lecture?.youtubeUrl) {
      // Extract video ID from YouTube URL and create embed URL
      const videoId = extractYouTubeVideoId(video.lecture.youtubeUrl);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : video.lecture.youtubeUrl;
    }
    return video?.lecture?.secure_url || '';
  };

  const handleClose = () => {
    // Ensure player is destroyed before closing
    if (player && typeof player.destroy === 'function') {
      player.destroy();
      setPlayer(null);
    }
    onClose();
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
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
                <p className="text-white">Loading video...</p>
                {isYouTube && !playerReady && (
                  <p className="text-white text-sm mt-2">Initializing YouTube player...</p>
                )}
              </div>
            </div>
          )}

          {/* Player Ready Indicator (for debugging) */}
          {isYouTube && playerReady && !isLoading && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
              Player Ready
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isYouTube ? (
              <div
                id={playerId}
                className="absolute top-0 left-0 w-full h-full"
              ></div>
            ) : (
              <iframe
                ref={iframeRef}
                src={getVideoUrl(video)}
                title={video?.title || "Video Player"}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                onLoad={() => setIsLoading(false)}
              ></iframe>
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
                    <h3 className="font-semibold text-lg">{video?.title || "Video Player"}</h3>
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
                  className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors"
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
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
                      style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
                      </button>
                      <input
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
                                if (isYouTube && player) {
                                  player.setPlaybackRate(rate);
                                }
                                setPlaybackRate(rate);
                                setShowSettings(false);
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
          {showControls && video?.description && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white pointer-events-auto">
              <h4 className="font-semibold mb-2">{video.title}</h4>
              <p className="text-sm text-gray-300">{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 