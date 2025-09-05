// Device detection and mobile inspection prevention utility

// Detect if user is on desktop
export const isDesktop = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'blackberry', 'windows phone'];
  
  // Check if it's a mobile device
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check screen size (desktop typically has larger screens)
  const isLargeScreen = window.innerWidth > 768 && window.innerHeight > 600;
  
  // Check if it's a desktop browser
  const isDesktopBrowser = !isMobile && isLargeScreen;
  
  return isDesktopBrowser;
};

// Detect if user is on mobile
export const isMobile = () => {
  return !isDesktop();
};

// Prevent mobile inspection on desktop (neutralized)
export const preventMobileInspection = () => {
  // No-op: allow context menu and devtools
  return;
};

// Initialize device detection and prevention (neutralized)
export const initializeDeviceProtection = () => {
  // No-op: do not attach any listeners or disable console
  return;
};

// Get device type for conditional rendering
export const getDeviceType = () => {
  return isDesktop() ? 'desktop' : 'mobile';
};

// Check if we should show mobile-specific features
export const shouldShowMobileFeatures = () => {
  return isMobile();
};

// Check if we should show desktop-specific features
export const shouldShowDesktopFeatures = () => {
  return isDesktop();
};

// Temporarily disable protection for debugging (kept for API compatibility)
export const disableProtection = () => {
  localStorage.setItem('disableProtection', 'true');
  console.log('🔓 Device protection DISABLED');
};

// Re-enable protection (kept for API compatibility)
export const enableProtection = () => {
  localStorage.removeItem('disableProtection');
  console.log('🔒 Device protection ENABLED');
};

// Check if protection is currently disabled
export const isProtectionDisabled = () => {
  return localStorage.getItem('disableProtection') === 'true';
}; 