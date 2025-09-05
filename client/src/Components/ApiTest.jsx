import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../Helpers/axiosInstance';

const ApiTest = () => {
  const [apiInfo, setApiInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Log API configuration
    console.log('🔧 API Test Component Mounted');
    console.log('Axios Instance Base URL:', axiosInstance.defaults.baseURL);
    console.log('Current Location:', window.location.href);
    console.log('Environment:', import.meta.env.MODE);
    console.log('Is Dev:', import.meta.env.DEV);

    setApiInfo({
      baseURL: axiosInstance.defaults.baseURL,
      currentLocation: window.location.href,
      environment: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
      hostname: window.location.hostname,
      port: window.location.port
    });
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing API connection...');
      // Test the base API endpoint
      const baseUrl = axiosInstance.defaults.baseURL.replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      
      setTestResult({
        success: true,
        data: data,
        status: response.status
      });
      console.log('✅ API test successful:', data);
    } catch (error) {
      console.error('❌ API test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: error.status,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  const testCaptcha = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing CAPTCHA endpoint...');
      const response = await axiosInstance.get('/captcha/generate');
      setTestResult({
        success: true,
        data: response.data,
        status: response.status,
        endpoint: 'captcha/generate'
      });
      console.log('✅ CAPTCHA test successful:', response.data);
    } catch (error) {
      console.error('❌ CAPTCHA test failed:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        endpoint: 'captcha/generate'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 API Configuration Test</h1>
      
      {/* API Configuration Info */}
      {apiInfo && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">API Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Base URL:</strong> {apiInfo.baseURL}
            </div>
            <div>
              <strong>Environment:</strong> {apiInfo.environment}
            </div>
            <div>
              <strong>Is Dev:</strong> {apiInfo.isDev ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Hostname:</strong> {apiInfo.hostname}
            </div>
            <div>
              <strong>Port:</strong> {apiInfo.port}
            </div>
            <div>
              <strong>Current Location:</strong> {apiInfo.currentLocation}
            </div>
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Health'}
        </button>
        <button
          onClick={testCaptcha}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test CAPTCHA'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold mb-2">
            {testResult.success ? '✅ Test Successful' : '❌ Test Failed'}
            {testResult.endpoint && ` - ${testResult.endpoint}`}
          </h3>
          <div className="text-sm">
            <div><strong>Status:</strong> {testResult.status}</div>
            {testResult.error && <div><strong>Error:</strong> {testResult.error}</div>}
            {testResult.data && (
              <div>
                <strong>Response:</strong>
                <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
