import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { FaQrcode, FaCamera, FaStop, FaCheck, FaTimes, FaUser, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../Helpers/axiosInstance';

const QRCodeScanner = ({ onScan, onScanSuccess, onClose, courseId, liveMeetingId, isModal = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanLocation, setScanLocation] = useState('');
  const [notes, setNotes] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);

  const isValidQrPayload = (data) => {
    if (!data || typeof data !== 'object') return false;
    const hasType = data.type === 'attendance';
    const hasIdOrPhone = !!(data.userId || data.phoneNumber);
    return hasType && hasIdOrPhone;
  };

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      } catch (error) {
        console.error('Error checking camera:', error);
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsScanning(true);
      setScannedData(null);
      
      // Start QR code detection
      detectQRCode();
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('لا يمكن الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureAndAnalyze = async () => {
    if (!isScanning || !videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      if (!canvasRef.current) canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) {
        toast.error('تعذر التقاط الصورة');
        return;
      }

      const form = new FormData();
      form.append('image', blob, 'frame.jpg');
      if (courseId) form.append('courseId', courseId);
      if (liveMeetingId) form.append('liveMeetingId', liveMeetingId);
      if (scanLocation) form.append('scanLocation', scanLocation);
      if (notes) form.append('notes', notes);

      setIsProcessing(true);
      try {
        const res = await axiosInstance.post('/attendance/analyze-photo', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.data?.success && res.data.data?.qrData) {
          // Use returned qr-like data path
          const data = res.data.data.qrData;
          setScannedData(data);
          toast.success('تم تحليل الصورة');
        } else {
          toast.error(res?.data?.message || 'فشل تحليل الصورة');
        }
      } finally {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('Capture analyze error:', e);
      toast.error('حدث خطأ أثناء تحليل الصورة');
    }
  };

  const detectQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let found = false;

    const loop = async () => {
      if (!isScanning || !videoRef.current) return;
      try {
        const vw = videoRef.current.videoWidth || 1280;
        const vh = videoRef.current.videoHeight || 720;
        canvas.width = vw;
        canvas.height = vh;
        ctx.drawImage(videoRef.current, 0, 0, vw, vh);
        const imageData = ctx.getImageData(0, 0, vw, vh);
        const result = jsQR(imageData.data, vw, vh, { inversionAttempts: 'dontInvert' });

        if (result && result.data && !found) {
          found = true;
          let payload = null;
          try { payload = JSON.parse(result.data); } catch { payload = { qrRaw: result.data }; }

          if (!isValidQrPayload(payload)) {
            toast.error('كود QR غير صالح للحضور');
            found = false;
            requestAnimationFrame(loop);
            return;
          }

          try {
            if (onScan) {
              await onScan(payload);
              toast.success('تم مسح QR وتسجيل الحضور');
            } else {
              await axiosInstance.post('/attendance/scan-qr', {
                qrData: payload,
                courseId: courseId || null,
                liveMeetingId: liveMeetingId || null,
                scanLocation: scanLocation || null,
                notes: notes || null
              });
              toast.success('تم تسجيل الحضور');
            }
            stopScanning();
            onScanSuccess && onScanSuccess(payload);
            return;
          } catch (err) {
            found = false; // allow retry on failure
            console.error('QR attendance error:', err);
          }
        }
      } catch (error) {
        // ignore frame errors
      }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  };

  const handleManualQRInput = () => {
    const qrData = prompt('أدخل بيانات QR يدوياً (JSON):');
    if (qrData) {
      try {
        const parsedData = JSON.parse(qrData);
        setScannedData(parsedData);
      } catch (error) {
        toast.error('بيانات QR غير صحيحة');
      }
    }
  };

  const processAttendance = async () => {
    if (!scannedData) return;

    setIsProcessing(true);
    try {
      // If onScan prop is provided, use it instead of direct API call
      if (onScan) {
        await onScan(scannedData);
        toast.success('تم مسح البيانات بنجاح');
        setScannedData(null);
        setIsProcessing(false);
        return;
      }

      // Original API call logic for backward compatibility
      const response = await axiosInstance.post('/attendance/scan-qr', {
        qrData: scannedData,
        courseId: courseId || null,
        liveMeetingId: liveMeetingId || null,
        scanLocation: scanLocation || null,
        notes: notes || null
      });

      if (response.data.success) {
        toast.success('تم تسجيل الحضور بنجاح');
        onScanSuccess && onScanSuccess(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error processing attendance:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تسجيل الحضور';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose && onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const content = (
    <div className={`${isModal ? 'bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto' : 'w-full'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FaQrcode className="text-blue-500" />
            مسح رمز الحضور
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Camera Section */}
          {hasCamera && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-72 md:h-[60vh] lg:h-[70vh] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="text-center text-white">
                      <FaCamera size={48} className="mx-auto mb-2" />
                      <p>اضغط على "بدء المسح" لتفعيل الكاميرا</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <FaCamera size={16} />
                    بدء المسح
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <FaStop size={16} />
                    إيقاف المسح
                  </button>
                )}

                {isScanning && (
                  <button
                    onClick={captureAndAnalyze}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isProcessing ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                  >
                    التقاط صورة وتحليل
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Manual Input Section */}
          {!hasCamera && (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FaCamera size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                الكاميرا غير متاحة. يمكنك إدخال بيانات QR يدوياً.
              </p>
              <button
                onClick={handleManualQRInput}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mx-auto"
              >
                <FaQrcode size={16} />
                إدخال يدوي
              </button>
            </div>
          )}

          {/* Scanned Data Display */}
          {scannedData && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <FaCheck className="text-green-600" />
                تم مسح البيانات بنجاح
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  <span className="font-medium">الاسم:</span>
                  <span>{scannedData.fullName || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  <span className="font-medium">اسم المستخدم:</span>
                  <span>{scannedData.username || 'غير متوفر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span className="font-medium">وقت إنشاء الرمز:</span>
                  <span>
                    {scannedData.timestamp 
                      ? new Date(scannedData.timestamp).toLocaleString('ar-EG') 
                      : 'غير متوفر'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaMapMarkerAlt className="inline mr-2" />
                موقع المسح (اختياري)
              </label>
              <input
                type="text"
                value={scanLocation}
                onChange={(e) => setScanLocation(e.target.value)}
                placeholder="مثال: الفصل الدراسي الأول"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={processAttendance}
              disabled={!scannedData || isProcessing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                !scannedData || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <FaCheck size={16} />
                  تسجيل الحضور
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <FaTimes size={16} />
              إلغاء
            </button>
          </div>
        </div>
      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default QRCodeScanner;
