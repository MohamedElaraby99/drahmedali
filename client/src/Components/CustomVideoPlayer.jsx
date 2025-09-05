import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
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
  FaVideo,
  FaExternalLinkAlt
} from 'react-icons/fa';
import VideoProgress from './VideoProgress';
import VideoUserProgress from './VideoUserProgress';

const CustomVideoPlayer = ({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  courseTitle = "Course Video",
  userName = "User",
  courseId = null,
  showProgress = true,
  savedProgress = null
}) => {
  const { role } = useSelector((state) => state.auth);
  const userData = useSelector((state) => state.auth.data);
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
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [displayUserName, setDisplayUserName] = useState('');
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [manualDurationInput, setManualDurationInput] = useState('');
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const iframeRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const watermarkTimerRef = useRef(null);

  // Simulated video state for custom controls
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
      checkDeviceType();
      startWatermarkTimer();
    }
    
    return () => {
      clearControlsTimer();
      clearTimeUpdateInterval();
      clearWatermarkTimer();
    };
  }, [isOpen, video]);

  // YouTube IFrame API implementation
  useEffect(() => {
    // Function to load YouTube API if not already loaded
    const loadYouTubeAPI = () => {
      return new Promise((resolve, reject) => {
        if (typeof YT !== 'undefined' && YT.Player) {
          console.log('YouTube API already loaded');
          resolve();
          return;
        }

        console.log('Loading YouTube IFrame API...');
        
        // Check if script is already loading
        if (window.YTLoading) {
          console.log('YouTube API already loading, waiting...');
          const checkLoaded = setInterval(() => {
            if (typeof YT !== 'undefined' && YT.Player) {
              clearInterval(checkLoaded);
              console.log('YouTube API loaded successfully');
              resolve();
            }
          }, 100);
          return;
        }

        window.YTLoading = true;
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        
        script.onload = () => {
          console.log('YouTube API script loaded');
          // Wait for YT object to be available
          const checkYT = setInterval(() => {
            if (typeof YT !== 'undefined' && YT.Player) {
              clearInterval(checkYT);
              window.YTLoading = false;
              console.log('YouTube API ready');
              resolve();
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkYT);
            window.YTLoading = false;
            reject(new Error('YouTube API failed to load'));
          }, 10000);
        };
        
        script.onerror = () => {
          window.YTLoading = false;
          reject(new Error('Failed to load YouTube API script'));
        };
        
        document.head.appendChild(script);
      });
    };

    // Load API and create player
    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (youtubeVideoId && !player) {
          console.log('Creating YouTube player for video:', youtubeVideoId);
          
          const newPlayer = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: youtubeVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
              fs: 0,
              playsinline: 1,
              enablejsapi: 1,
              origin: window.location.origin
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange,
              'onError': onPlayerError
            }
          });
          
          setPlayer(newPlayer);
        }
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        setVideoState(prev => ({ ...prev, error: 'Failed to load video player' }));
        setIsLoading(false);
      }
    };

    if (youtubeVideoId) {
      initializePlayer();
    }

    return () => {
      if (player) {
        console.log('Destroying YouTube player');
        try {
          player.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
        setPlayer(null);
        setPlayerReady(false);
      }
    };
  }, [youtubeVideoId]);

  // YouTube player event handlers
  const onPlayerReady = (event) => {
    console.log('YouTube player ready');
    setPlayerReady(true);
    setIsLoading(false);
    setShowThumbnail(false);
    
    // Get the real duration with retry mechanism
    const getDurationWithRetry = () => {
      const videoDuration = event.target.getDuration();
      console.log('Attempting to get duration:', videoDuration, 'seconds');
      
      if (videoDuration > 0 && videoDuration < 7200) {
        setDuration(videoDuration);
        console.log('Duration set successfully:', videoDuration);
        return true;
      } else {
        console.log('Invalid duration received:', videoDuration);
        return false;
      }
    };
    
    // Try to get duration immediately
    if (!getDurationWithRetry()) {
      // If failed, retry after a short delay
      setTimeout(() => {
        if (!getDurationWithRetry()) {
          // If still failed, try again after longer delay
          setTimeout(() => {
            if (!getDurationWithRetry()) {
              console.log('Failed to get duration after multiple attempts');
              // For live videos, set a default duration or show as live
              setDuration(0);
            }
          }, 2000);
        }
      }, 1000);
    }
    
    // Set initial volume
    event.target.setVolume(volume * 100);
    if (isMuted) {
      event.target.mute();
    }
    
    // Restore saved progress position if available
    if (savedProgress && savedProgress.currentTime > 0) {
      console.log('Restoring saved progress:', savedProgress.currentTime, 'seconds');
      // Seek to saved position
      event.target.seekTo(savedProgress.currentTime, true);
      setCurrentTime(savedProgress.currentTime);
      
      // Show a notification to user
      console.log(`Resumed from ${Math.floor(savedProgress.currentTime / 60)}:${(savedProgress.currentTime % 60).toString().padStart(2, '0')}`);
    }
  };

  const onPlayerStateChange = (event) => {
    console.log('YouTube player state changed:', event.data);
    
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case YT.PlayerState.PAUSED:
        setIsPlaying(false);
        break;
      case YT.PlayerState.ENDED:
        setIsPlaying(false);
        setCurrentTime(duration);
        break;
      case YT.PlayerState.BUFFERING:
        // Handle buffering if needed
        break;
    }
  };

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data);
    setVideoState(prev => ({ ...prev, error: 'Failed to load video' }));
    setIsLoading(false);
  };



  // Check if device is mobile and handle orientation
  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        // Request fullscreen and landscape on mobile
        requestFullscreenAndLandscape();
      }
    };

    const handleOrientationChange = () => {
      setIsLandscape(window.orientation === 90 || window.orientation === -90);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    checkDeviceType();
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const initializeVideo = () => {
    console.log('Initializing video with object:', video);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setShowControls(true);
    setVideoState({ ready: false, canPlay: false, seeking: false, error: null });
    setPlayerReady(false);
    setShowThumbnail(true);
    
    // Extract YouTube video ID
    const videoUrl = getVideoUrl(video);
    console.log('Extracted video URL:', videoUrl);
    const videoId = extractYouTubeVideoId(videoUrl);
    console.log('Extracted YouTube video ID:', videoId);
    
    if (videoId) {
      console.log('YouTube video detected with ID:', videoId);
      setYoutubeVideoId(videoId);
      
      // Set thumbnail URL
      const thumbnail = getYouTubeThumbnail(videoId);
      setThumbnailUrl(thumbnail);
      console.log('Thumbnail URL set:', thumbnail);
      
      // The YouTube IFrame API will handle player creation and duration fetching
      console.log('Video ID detected, YouTube IFrame API will handle duration');
    } else {
      console.log('No YouTube video found');
      console.log('Video object structure:', JSON.stringify(video, null, 2));
      setYoutubeVideoId(null);
      setThumbnailUrl('');
      setIsLoading(false);
      setVideoState(prev => ({ ...prev, error: 'No valid YouTube URL found' }));
    }
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) {
      console.log('No URL provided to extractYouTubeVideoId');
      return null;
    }
    
    console.log('Extracting YouTube ID from URL:', url);
    
    // Handle different YouTube URL formats including live URLs
    const patterns = [
      // Regular YouTube URLs
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      // YouTube Live URLs
      /youtube\.com\/live\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+).*&si=/,
      // YouTube Shorts
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      // Specific pattern for live URLs with si parameter
      /youtube\.com\/live\/([^&\n?#]+)\?si=/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const match = url.match(patterns[i]);
      if (match) {
        const videoId = match[1];
        console.log(`Pattern ${i + 1} matched, extracted video ID:`, videoId);
        return videoId;
      }
    }
    
    console.log('No YouTube video ID found in URL:', url);
    return null;
  };

  const getVideoUrl = (video) => {
    console.log('Getting video URL from object:', video);
    
    // Check for different possible URL properties
    if (video?.url) {
      console.log('Found URL in video.url:', video.url);
      return video.url;
    }
    if (video?.youtubeUrl) {
      console.log('Found URL in video.youtubeUrl:', video.youtubeUrl);
      return video.youtubeUrl;
    }
    if (video?.lecture?.youtubeUrl) {
      console.log('Found URL in video.lecture.youtubeUrl:', video.lecture.youtubeUrl);
      return video.lecture.youtubeUrl;
    }
    if (video?.lecture?.secure_url) {
      console.log('Found URL in video.lecture.secure_url:', video.lecture.secure_url);
      return video.lecture.secure_url;
    }
    if (video?.secure_url) {
      console.log('Found URL in video.secure_url:', video.secure_url);
      return video.secure_url;
    }
    
    console.log('No URL found in video object');
    return '';
  };

  const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return '';
    // Create embed URL with API enabled and proper parameters
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}`;
  };

  const changePlaybackRate = (rate) => {
    if (!playerReady || !player) return;
    
    setPlaybackRate(rate);
    setShowSettings(false);
    
    // Send playback rate command to YouTube player
    player.setPlaybackRate(rate);
    console.log(`Playback rate set to ${rate}x`);
  };

  const getVideoTitle = (video) => {
    return video?.title || video?.lecture?.title || "Video Player";
  };

  const getVideoDescription = (video) => {
    return video?.description || video?.lecture?.description || "";
  };

  const getCleanVideoId = (video) => {
    // First try to get the extracted YouTube video ID
    if (youtubeVideoId) {
      return youtubeVideoId;
    }
    
    // Fallback: extract from YouTube URL
    const videoUrl = getVideoUrl(video);
    if (videoUrl) {
      return extractYouTubeVideoId(videoUrl);
    }
    
    return null;
  };

  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Manual function to request duration (can be called if duration is still 0)
  const requestDuration = () => {
    if (youtubeVideoId && player) {
      console.log('Manually requesting duration from YouTube player...');
      const videoDuration = player.getDuration();
      if (videoDuration > 0 && videoDuration < 7200) {
        setDuration(videoDuration);
        console.log('Manual duration request successful:', videoDuration);
      }
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

  const clearTimeUpdateInterval = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  // Get real time updates from YouTube player
  useEffect(() => {
    if (isPlaying && !isDragging && playerReady && player) {
      timeUpdateIntervalRef.current = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime !== undefined && currentTime >= 0) {
          setCurrentTime(currentTime);
        }
      }, 1000);
    } else {
      clearTimeUpdateInterval();
    }

    return () => clearTimeUpdateInterval();
  }, [isPlaying, isDragging, playerReady, player]);

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
    if (!playerReady || !player) return;
    
    if (isPlaying) {
      // Pause video
      player.pauseVideo();
      console.log('Pause command sent to YouTube player');
    } else {
      // Play video
      player.playVideo();
      console.log('Play command sent to YouTube player');
    }
  };

  const toggleMute = () => {
    if (!playerReady || !player) return;
    
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
      console.log('Unmute command sent to YouTube player');
    } else {
      player.mute();
      setIsMuted(true);
      console.log('Mute command sent to YouTube player');
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen toggle failed:', error);
    }
  };

  const seek = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  const seekTo = (time) => {
    if (!playerReady || !player) return;
    
    const newTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(newTime);
    setVideoState(prev => ({ ...prev, seeking: true }));
    
    // Send seek command to YouTube player
    player.seekTo(newTime, true);
    console.log('Seek command sent to YouTube player:', newTime);
    
    setTimeout(() => {
      setVideoState(prev => ({ ...prev, seeking: false }));
    }, 500);
  };

  const adjustVolume = (change) => {
    if (!playerReady || !player) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + change));
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    // Send volume command to YouTube player
    player.setVolume(newVolume * 100);
    console.log('Volume command sent to YouTube player:', newVolume * 100);
  };

  const handleVolumeChange = (newVolume) => {
    if (!playerReady || !player) return;
    
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    // Send volume command to YouTube player
    player.setVolume(newVolume * 100);
    console.log('Volume command sent to YouTube player:', newVolume * 100);
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
        title: 'Video Player',
        text: getVideoDescription(video) || 'Check out this video!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    // Exit fullscreen if in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    onClose();
  };

  const checkDeviceType = () => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
    
    if (isMobileDevice) {
      // Request fullscreen and landscape on mobile
      requestFullscreenAndLandscape();
    }
  };

  const requestFullscreenAndLandscape = async () => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      
      // Try to lock orientation to landscape (works on some mobile browsers)
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (error) {
          console.log('Orientation lock not supported');
        }
      }
    } catch (error) {
      console.log('Fullscreen request failed:', error);
    }
  };

  // Watermark system for video protection
  const startWatermarkTimer = () => {
    clearWatermarkTimer();
    // Use fullName from userData, fallback to userName prop, then to 'User'
    const displayName = userData?.fullName || userName || 'User';
    setDisplayUserName(displayName);
    
    // Change watermark position every 5 seconds
    watermarkTimerRef.current = setInterval(() => {
      setWatermarkPosition(prev => (prev + 1) % 8); // 8 different positions
    }, 5000);
    
    // Cleanup timestamp interval when component unmounts
    return () => {
      clearInterval(watermarkTimerRef.current);
    };
  };

  const clearWatermarkTimer = () => {
    if (watermarkTimerRef.current) {
      clearInterval(watermarkTimerRef.current);
      watermarkTimerRef.current = null;
    }
  };

  const getWatermarkStyle = () => {
    const positions = [
      { top: '10%', left: '10%' },
      { top: '10%', right: '10%' },
      { bottom: '10%', left: '10%' },
      { bottom: '10%', right: '10%' },
      { top: '50%', left: '10%', transform: 'translateY(-50%)' },
      { top: '50%', right: '10%', transform: 'translateY(-50%)' },
      { left: '50%', top: '10%', transform: 'translateX(-50%)' },
      { left: '50%', bottom: '10%', transform: 'translateX(-50%)' }
    ];
    
    return positions[watermarkPosition];
  };

  const handleManualDurationSubmit = () => {
    if (manualDurationInput) {
      let seconds = 0;
      if (manualDurationInput.includes(':')) {
        // Format: MM:SS or HH:MM:SS
        const parts = manualDurationInput.split(':');
        if (parts.length === 2) {
          // MM:SS
          seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (parts.length === 3) {
          // HH:MM:SS
          seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
      } else {
        // Just seconds
        seconds = parseInt(manualDurationInput);
      }
      if (seconds > 0) {
        setDuration(seconds);
        console.log('Manual duration set:', seconds, 'seconds');
        setShowDurationModal(false);
        setManualDurationInput('');
      }
    }
  };

  const handleStartVideo = () => {
    if (player && playerReady) {
      setShowThumbnail(false);
      player.playVideo();
      setIsPlaying(true);
    }
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
      <div className="relative w-full h-full flex flex-col items-center justify-start p-4 overflow-y-auto">
        <div className="relative bg-black rounded-lg overflow-hidden w-full h-[85vh] flex-shrink-0">
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-4" />
                <p className="text-white">Loading video...</p>
                <p className="text-white text-sm mt-2">Initializing player...</p>
                {isMobile && (
                  <p className="text-white text-sm mt-2">Rotate device for better viewing</p>
                )}
              </div>
            </div>
          )}

          {/* Mobile Rotation Indicator */}
          {isMobile && !isLandscape && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
              <div className="text-center">
                <FaVideo className="text-white text-4xl mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">Rotate Device</p>
                <p className="text-white text-sm">Please rotate your device to landscape mode for the best viewing experience</p>
                <button
                  onClick={requestFullscreenAndLandscape}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Enter Fullscreen
                </button>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full h-full">
            {youtubeVideoId ? (
              <div className="absolute inset-0">
                {/* YouTube Player */}
                <div id="youtube-player" className="w-full h-full"></div>
                
                {/* Thumbnail Overlay */}
                {showThumbnail && thumbnailUrl && (
                  <div className="absolute inset-0 z-30">
                    <div className="relative w-full h-full">
                      {/* Thumbnail Image */}
                      <img 
                        src={thumbnailUrl} 
                        alt={getVideoTitle(video)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Thumbnail failed to load, using fallback');
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Thumbnail Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-center">
                          {/* Play Button */}
                          <button
                            onClick={handleStartVideo}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-8 mb-6 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                          >
                            <FaPlay className="text-white text-6xl ml-3" />
                          </button>
                          
                          {/* Video Title */}
                          <h3 className="text-white text-2xl font-bold mb-2">
                            {getVideoTitle(video)}
                          </h3>
                          
                          {/* Video Description */}
                          {getVideoDescription(video) && (
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">
                              {getVideoDescription(video)}
                            </p>
                          )}
                          
                          {/* Click to Play Text */}
                          <p className="text-white/60 text-sm mt-4">
                            انقر للبدء في مشاهدة الفيديو
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Dynamic Watermark */}
                {playerReady && !showThumbnail && (
                  <div 
                    className="absolute pointer-events-none z-25 select-none"
                    style={{
                      ...getWatermarkStyle(),
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                      fontFamily: 'Arial, sans-serif',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    <div className="bg-black bg-opacity-60 px-3 py-1 rounded">
                      {displayUserName}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaVideo className="text-6xl mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Video Player</h3>
                  <p className="text-sm text-gray-400 mt-2">No video source available</p>
                </div>
              </div>
            )}
          </div>

          {/* Always Visible Close Button */}
          <div className="absolute top-4 left-4 z-40 pointer-events-auto">
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-black/50 rounded-lg bg-black/30 backdrop-blur-sm"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Always Visible Play Button (Fallback) */}
          {!showControls && playerReady && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-30">
              <button
                onClick={() => {
                  console.log('Fallback play button clicked! Player ready:', playerReady, 'Is playing:', isPlaying);
                  togglePlay();
                }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors"
              >
                <FaPlay className="text-white text-4xl ml-2" />
              </button>
            </div>
          )}

          {/* Custom Video Controls Overlay */}
          {showControls && playerReady && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-30">
              
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    <h3 className="font-semibold text-lg">Video Player</h3>
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
                  onClick={() => {
                    console.log('Play button clicked! Player ready:', playerReady, 'Is playing:', isPlaying);
                    togglePlay();
                  }}
                  disabled={!playerReady}
                  className={`bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors ${
                    !playerReady ? 'opacity-50 cursor-not-allowed' : ''
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
                    dir="ltr"
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
                      style={{ width: `${duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0}%` }}
                    ></div>
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg z-20"
                      style={{ left: `${duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0}%`, marginLeft: '-6px' }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        console.log('Bottom play button clicked! Player ready:', playerReady, 'Is playing:', isPlaying);
                        togglePlay();
                      }}
                      disabled={!playerReady}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !playerReady ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                    </button>
                    
                    <button
                      onClick={() => seek(-10)}
                      disabled={!playerReady}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !playerReady ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaStepBackward className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => seek(10)}
                      disabled={!playerReady}
                      className={`text-white hover:text-gray-300 transition-colors ${
                        !playerReady ? 'opacity-50 cursor-not-allowed' : ''
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
                      <span>
                        {duration === 0 ? (
                          <span className="text-red-400 font-semibold">LIVE</span>
                        ) : (
                          `${formatTime(currentTime)} / ${formatTime(duration)}`
                        )}
                      </span>
                      {duration === 0 && youtubeVideoId && (
                        <button
                          onClick={requestDuration}
                          className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          title="Fetch Duration"
                        >
                          Get Duration
                        </button>
                      )}
                      {duration === 0 && youtubeVideoId && (
                        <button
                          onClick={() => {
                            setShowDurationModal(true);
                            setManualDurationInput('');
                          }}
                          className="ml-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          title="Manual Duration"
                        >
                          Set Duration
                        </button>
                      )}
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
                              onClick={() => changePlaybackRate(rate)}
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
        </div>
        
        {/* Video Progress Component (Hidden for Users - Background Tracking Only) */}
        {showProgress && courseId && getCleanVideoId(video) && role === 'USER' && (
          <div className="hidden">
            <VideoProgress
              videoId={getCleanVideoId(video)}
              courseId={courseId}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={(time) => {
                if (player && playerReady) {
                  player.seekTo(time, true);
                }
              }}
              savedProgress={savedProgress}
            />
          </div>
        )}

        {/* All Users Progress Component (Admin Only) */}
        {showProgress && courseId && getCleanVideoId(video) && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
          <div className="w-full max-w-6xl mt-6 flex-shrink-0">
            <VideoUserProgress
              videoId={getCleanVideoId(video)}
              courseId={courseId}
            />
          </div>
        )}

        {/* Duration Modal */}
        {showDurationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Set Video Duration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Enter the video duration in one of these formats:
                <br />• MM:SS (e.g., 3:45)
                <br />• HH:MM:SS (e.g., 1:23:45)
                <br />• Seconds (e.g., 225)
              </p>
              <input
                type="text"
                value={manualDurationInput}
                onChange={(e) => setManualDurationInput(e.target.value)}
                placeholder="e.g., 3:45"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualDurationSubmit();
                  }
                }}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleManualDurationSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Set Duration
                </button>
                <button
                  onClick={() => {
                    setShowDurationModal(false);
                    setManualDurationInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomVideoPlayer; 