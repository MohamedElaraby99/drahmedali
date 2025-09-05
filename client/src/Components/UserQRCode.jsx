import React, { useState } from 'react';
import { FaQrcode, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { getCairoTimestamp } from '../utils/timezone';

const UserQRCode = ({ userData }) => {
  const [showQR, setShowQR] = useState(false);
  const [qrSize, setQrSize] = useState(200);

  // Generate QR code data with only phone number and user ID
  const generateQRData = () => {
    const qrData = {
      userId: userData?._id,
      phoneNumber: userData?.phoneNumber || "",
      type: 'attendance'
    };
    return JSON.stringify(qrData);
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    try {
      const svg = document.getElementById('user-qr-code');
      if (!svg) {
        toast.error('QR code not found');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, qrSize, qrSize);

        const link = document.createElement('a');
        link.download = `${userData?.fullName || 'user'}_qr_code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('QR code downloaded successfully');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <FaQrcode className="text-blue-500" />
          رمز الاستجابة السريعة للحضور
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {showQR ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            {showQR ? 'إخفاء' : 'عرض'} الرمز
          </button>
          {showQR && (
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <FaDownload size={14} />
              تحميل
            </button>
          )}
        </div>
      </div>

      {showQR && (
        <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              رمز الحضور الشخصي
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              يمكن للمدربين مسح هذا الرمز لتسجيل حضورك
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCode
              id="user-qr-code"
              value={generateQRData()}
              size={qrSize}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>رقم المستخدم:</strong> {userData?._id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>الاسم:</strong> {userData?.fullName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>رقم الهاتف:</strong> {userData?.phoneNumber}
            </p>
            {userData?.studentId && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>رقم الطالب:</strong> {userData?.studentId}
              </p>
            )}
            {userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>المرحلة:</strong> {userData?.stage?.name || userData?.stage || 'غير محدد'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              حجم الرمز:
            </label>
            <input
              type="range"
              min="150"
              max="300"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {qrSize}px
            </span>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
            <p>
              هذا الرمز يحتوي على معلوماتك الشخصية ورقم المستخدم الخاص بك ويستخدم لتسجيل الحضور في الفصول الدراسية.
              يمكن للمدربين استخدام رقم المستخدم ({userData?._id}) لتسجيل الحضور يدوياً أيضاً.
              يرجى عدم مشاركته مع أشخاص آخرين.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserQRCode;
