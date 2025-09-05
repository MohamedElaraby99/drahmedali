import React from 'react';
import { FaPlay, FaEye, FaLock } from 'react-icons/fa';

const WatchButton = ({ 
  lesson, 
  onWatchClick, 
  userRole,
  isLoggedIn,
  className = "",
  showIcon = true,
  variant = "primary" // primary, secondary, outline
}) => {

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  
  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors";
    
    if (!isLoggedIn) {
      return `${baseStyles} bg-gray-400 text-white cursor-not-allowed`;
    }
    
    switch (variant) {
      case "primary":
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
      case "secondary":
        return `${baseStyles} bg-[#9b172a] hover:bg-[#7d1324] text-white`;
      case "outline":
        return `${baseStyles} border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`;
      default:
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    if (!isLoggedIn) {
      return <FaLock className="text-sm" />;
    }
    
    switch (variant) {
      case "outline":
        return <FaEye className="text-sm" />;
      default:
        return <FaPlay className="text-sm" />;
    }
  };

  const getText = () => {
    if (!isLoggedIn) {
      return 'تسجيل الدخول للمشاهدة';
    }
    return 'مشاهدة المحتوى';
  };

  const handleClick = () => {
    if (!isLoggedIn) {
      return; // Do nothing if not logged in
    }
    if (onWatchClick) {
      onWatchClick(lesson);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isLoggedIn}
      className={`${getButtonStyles()} ${className}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
};

export default WatchButton;