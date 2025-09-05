import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaEye, FaFilePdf, FaSpinner, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { axiosInstance } from '../Helpers/axiosInstance';
import { generateFileUrl } from '../utils/fileUtils';

const PDFViewer = ({ 
  pdfUrl, 
  title = "PDF Document", 
  isOpen, 
  onClose 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
     const [pageImages, setPageImages] = useState([]);
   const [conversionProgress, setConversionProgress] = useState(0);
   const [isMobile, setIsMobile] = useState(false);
   const [useNativePdf, setUseNativePdf] = useState(false);
   const [nativePdfUrl, setNativePdfUrl] = useState('');

     useEffect(() => {
     // Check if device is mobile
     const checkMobile = () => {
       setIsMobile(window.innerWidth < 768);
     };
     
     checkMobile();
     window.addEventListener('resize', checkMobile);
     
     return () => window.removeEventListener('resize', checkMobile);
   }, []);

   useEffect(() => {
     if (isOpen && pdfUrl) {
       console.log('PDFViewer opened with URL:', pdfUrl);
       console.log('Current device type:', isMobile ? 'Mobile' : 'Desktop');
       setIsLoading(true);
       setError(null);
       setCurrentPage(1);
       setConversionProgress(0);
       setUseNativePdf(false);
       setNativePdfUrl('');
       convertPdfToImages();
     }
   }, [isOpen, pdfUrl]);

  const convertPdfToImages = async () => {
    // Get clean URL at the beginning so it's available in catch block
    const cleanUrl = getCleanPdfUrl(pdfUrl);
    
    try {
             console.log('Starting PDF processing...');
      setConversionProgress(10);
      
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

             // Call the backend API to convert PDF to images using axiosInstance for proper auth
       const response = await axiosInstance.post('/pdf-converter/convert', {
         pdfUrl: cleanUrl
       });

      clearInterval(progressInterval);
      setConversionProgress(100);

      // axiosInstance automatically handles response status and throws on errors
      const data = response.data;
      
      if (data.success && data.data) {
        // Filter out failed conversions and use the actual converted image URLs
        const validImages = data.data.filter(page => page.imageUrl !== null);
        
        if (validImages.length > 0) {
          const convertedImages = validImages.map(page => ({
            ...page,
            imageUrl: generateFileUrl(page.imageUrl) // Use utility function instead of hardcoded URL
          }));
          
          setPageImages(convertedImages);
          setTotalPages(convertedImages.length);
          setIsLoading(false);
          setUseNativePdf(false);
          
          console.log('PDF conversion completed successfully');
          console.log('Converted images:', convertedImages);
        } else {
          // Client-side render via pdf.js when server returned empty data
          console.log('Server conversion empty, rendering with pdf.js');
          await renderWithPdfJs(cleanUrl);
        }
      } else {
        // If conversion fails, use the original PDF URL directly
        console.log('Processing failed, rendering with pdf.js fallback');
        await renderWithPdfJs(cleanUrl);
      }
         } catch (error) {
       console.error('Error processing PDF:', error);
       
       // Show user-friendly error message
       console.log('PDF conversion failed:', error.message);
       
        // If API call fails, attempt client-side render; if that fails, iframe fallback
        try {
          await renderWithPdfJs(cleanUrl);
        } catch (e) {
          console.warn('pdf.js fallback failed, using native iframe', e);
          setUseNativePdf(true);
          setNativePdfUrl(cleanUrl);
          setPageImages([]);
          setTotalPages(1);
          setIsLoading(false);
        }
       
       // Show a toast or alert to inform the user
       if (error.message.includes('500')) {
         console.warn('Server error during PDF conversion. Using fallback mode.');
       }
     }
  };

  // Render PDF client-side using pdf.js into images
  const renderWithPdfJs = async (url) => {
    try {
      // Set worker source to the CDN version for compatibility
      GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    } catch (e) {
      // ignore if already set
    }

    const loadingTask = getDocument({ url });
    const pdf = await loadingTask.promise;
    const images = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');
      images.push({
        pageNumber: pageNum,
        imageUrl: dataUrl,
        alt: `Page ${pageNum}`,
        width: viewport.width,
        height: viewport.height,
        filename: `client-rendered-${pageNum}.png`
      });
    }
    setPageImages(images);
    setTotalPages(images.length);
    setIsLoading(false);
    setUseNativePdf(false);
    console.log('Client-side PDF render complete');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : totalPages);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev < totalPages ? prev + 1 : 1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePreviousPage();
    } else if (e.key === 'ArrowRight') {
      handleNextPage();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, currentPage, totalPages]);

  // Clean and encode PDF URL
  const getCleanPdfUrl = (url) => {
    if (!url) return '';
    
    try {
      if (url.includes('%')) {
        return url;
      }
      
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const encodedFilename = encodeURIComponent(filename);
      urlParts[urlParts.length - 1] = encodedFilename;
      const encodedUrl = urlParts.join('/');
      
      return encodedUrl;
    } catch (error) {
      console.error('Error encoding PDF URL:', error);
      return url;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Main Container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <FaFilePdf className="text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-xl font-bold truncate">{title}</h2>
                <div className="flex items-center gap-2">
                  {totalPages > 1 && (
                    <p className="text-gray-300 text-xs sm:text-sm">Page {currentPage} of {totalPages}</p>
                  )}
                  {pageImages[0]?.isFallback && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      Fallback Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 sm:p-3 hover:bg-white/20 rounded-lg transition-all duration-200 ml-2"
              title="Close"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-center text-white max-w-md mx-auto p-8">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <FaFilePdf className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl" />
              </div>
              
                             <h3 className="text-2xl font-bold mb-4" dir="rtl">نحن نجهز ملفك</h3>
               <p className="text-gray-300 mb-6" dir="rtl">يرجى الانتظار، نحن نعد ملفك ...</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-400">
                {conversionProgress}% مكتمل
              </p>
              
                             <div className="mt-6 text-xs text-gray-500" dir="rtl">
                
               </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-center text-white max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaFilePdf className="text-red-400 text-4xl" />
              </div>
                             <h3 className="text-2xl font-bold mb-4">Conversion Error</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  convertPdfToImages();
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
              >
                                 Retry Conversion
              </button>
            </div>
          </div>
        )}

        {/* PDF Content as Images */}
        {!isLoading && !error && pageImages.length > 0 && (
          <div className="flex-1 relative pt-16 sm:pt-20">
            {/* Navigation Arrows */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={handlePreviousPage}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                  title="Previous Page"
                >
                  <FaChevronLeft className="text-lg sm:text-2xl" />
                </button>
                
                <button
                  onClick={handleNextPage}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                  title="Next Page"
                >
                  <FaChevronRight className="text-lg sm:text-2xl" />
                </button>
              </>
            )}

            {/* Page Display */}
            <div className="w-full h-full p-2 sm:p-4">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative max-w-full max-h-full">
                  {/* Current Page PDF Display */}
                  <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    {(() => {
                      console.log('Rendering PDF display. isMobile:', isMobile);
                      if (useNativePdf && nativePdfUrl) {
                        return (
                          <iframe
                            key={`pdf-iframe-${Date.now()}`}
                            src={nativePdfUrl}
                            title={title}
                            className="w-[90vw] max-w-full h-[80vh]"
                            style={{ border: 'none' }}
                          />
                        );
                      }
                      return (
                        <img
                          key={`pdf-image-${currentPage}-${Date.now()}`}
                          src={pageImages[currentPage - 1]?.imageUrl}
                          alt={`Page ${currentPage}`}
                          className="w-full h-auto max-w-full max-h-[80vh] object-contain"
                          style={{
                            minHeight: '400px',
                            maxWidth: '100vw',
                            maxHeight: '80vh'
                          }}
                          onLoad={() => {
                            console.log(`Page ${currentPage} image loaded successfully`);
                          }}
                          onError={(e) => {
                            console.error(`Failed to load page ${currentPage} image:`, e);
                            console.log('Current device type:', isMobile ? 'Mobile' : 'Desktop');
                            console.log('Image URL being loaded:', pageImages[currentPage - 1]?.imageUrl);
                            // Switch to native PDF viewer as a fallback
                            const clean = getCleanPdfUrl(pdfUrl);
                            setUseNativePdf(true);
                            setNativePdfUrl(clean);
                          }}
                        />
                      );
                    })()}
                  </div>
                  
                  {/* Page Counter */}
                  {totalPages > 1 && (
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium text-sm sm:text-base">{currentPage} / {totalPages}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Thumbnails */}
            {totalPages > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-1.5 sm:p-2">
                  {pageImages.map((page, index) => (
                    <button
                      key={page.pageNumber}
                      onClick={() => setCurrentPage(page.pageNumber)}
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded border-2 transition-all duration-200 ${
                        currentPage === page.pageNumber
                          ? 'border-white bg-white/20'
                          : 'border-gray-400 bg-gray-600/50 hover:bg-gray-500/50'
                      }`}
                      title={`Page ${page.pageNumber}`}
                    >
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                        {page.pageNumber}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Instructions */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white/70 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">← → Arrow keys to navigate</span>
            <span className="hidden sm:inline">•</span>
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
