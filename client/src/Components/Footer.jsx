import React, { useState, useEffect } from "react";
import { BsFacebook, BsLinkedin } from "react-icons/bs";
import { FaShieldAlt, FaUnlock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { disableProtection, enableProtection, isProtectionDisabled } from "../utils/deviceDetection";
import logo from "../assets/logo.png";

export default function Footer() {
  const curDate = new Date();
  const year = curDate.getFullYear();
  
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  
  useEffect(() => {
    // Check initial protection status
    setProtectionEnabled(!isProtectionDisabled());
  }, []);
  
  const handleProtectionToggle = () => {
    if (protectionEnabled) {
      // Disable protection
      disableProtection();
      setProtectionEnabled(false);
    } else {
      // Enable protection
      enableProtection();
      setProtectionEnabled(true);
    }
  };
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-8 lg:px-16 bg-slate-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between justify-center items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 dark:text-white text-center sm:text-right">
            حقوق النشر {year} | جميع الحقوق محفوظة
          </span>
          <div className="flex gap-4 sm:gap-5 items-center">
            <a
              href="https://www.facebook.com/people/MrMahmoud-Abdel-Aziz/100070094625467/?mibextid=ZbWKwL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl text-gray-900 dark:text-slate-50 hover:text-gray-500 dark:hover:text-slate-300 transition-colors duration-300 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
              aria-label="Facebook"
            >
              <BsFacebook />
            </a>
          </div>
        </div>
        
        {/* Legal Links */}
        <div className="flex justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base">
            <Link 
              to="/terms" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium text-center hover:underline"
            >
              شروط الخدمة
            </Link>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">|</span>
            <Link 
              to="/privacy" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium text-center hover:underline"
            >
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
