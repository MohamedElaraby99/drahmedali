import React from 'react';
import { FaPlay, FaEye } from 'react-icons/fa';

const WatchButton = ({ 
  item, 
  purchaseType, 
  onWatch, 
  className = "",
  showIcon = true,
  variant = "primary", // primary, secondary, outline
  showButton = true // New prop to control button visibility
}) => {


  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors";
    
    switch (variant) {
      case "primary":
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
      case "secondary":
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white`;
      case "outline":
        return `${baseStyles} border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`;
      default:
        return `${baseStyles} bg-green-600 hover:bg-green-700 text-white`;
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (variant) {
      case "outline":
        return <FaEye className="text-sm" />;
      default:
        return <FaPlay className="text-sm" />;
    }
  };

  const getText = () => {
    return 'مشاهدة المحتوى';
  };

  // Don't render anything if showButton is false
  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={() => onWatch && onWatch(item, purchaseType)}
      className={`${getButtonStyles()} ${className}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
};

export default WatchButton;
