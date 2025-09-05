import React, { useState } from 'react';
import { generateFileUrl } from '../utils/fileUtils';

const BackendTest = () => {
  const [testResult, setTestResult] = useState('');
  const [convertResult, setConvertResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPdfAccess = async () => {
    setLoading(true);
    try {
      const testUrl = generateFileUrl('ex_level_1 (1).pdf', 'pdfs');
      const response = await fetch(testUrl);
      
      if (response.ok) {
        setTestResult('✅ PDF access successful!');
      } else {
        setTestResult(`❌ PDF access failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPdfConversion = async () => {
    setLoading(true);
    try {
      const pdfUrl = generateFileUrl('ex_level_1 (1).pdf', 'pdfs');
      const response = await fetch('/api/v1/pdf-converter/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: pdfUrl
        })
      });

      const data = await response.json();
      if (response.ok) {
        setConvertResult(`✅ Conversion successful! Pages: ${data.data.length}`);
      } else {
        setConvertResult(`❌ Conversion failed: ${data.message}`);
      }
    } catch (error) {
      setConvertResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Backend Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testPdfAccess}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test PDF Access
        </button>
        
        <button
          onClick={testPdfConversion}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test PDF Conversion
        </button>
        
        {testResult && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <strong>Test Result:</strong> {testResult}
          </div>
        )}
        
        {convertResult && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <strong>Conversion Result:</strong> {convertResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendTest;
