// Test script to verify CORS configuration
import { configDotenv } from 'dotenv';
configDotenv();

console.log('=== CORS Configuration Test ===');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5190',
  'http://127.0.0.1:5190',
  'https://almongz.online',
  'https://www.almongz.online',
  'https://api.almongz.online'
];

console.log('\nAllowed Origins:');
allowedOrigins.forEach((origin, index) => {
  console.log(`${index + 1}. ${origin || 'undefined'}`);
});

// Test specific problematic origins
const testOrigins = [
  'https://almongz.online',
  'https://api.almongz.online',
  'https://www.almongz.online'
];

console.log('\nTesting specific origins:');
testOrigins.forEach(origin => {
  const isAllowed = allowedOrigins.includes(origin);
  console.log(`${origin}: ${isAllowed ? '✅ ALLOWED' : '❌ NOT ALLOWED'}`);
});

console.log('\n=== End CORS Test ===');
