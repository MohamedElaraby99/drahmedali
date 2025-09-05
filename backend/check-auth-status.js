import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAuthStatus = async () => {
  try {
    console.log('🔍 Checking authentication status...\n');
    
    // Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const response = await fetch('http://localhost:4007/api/v1/user/me');
      console.log('   Server response status:', response.status);
      if (response.status === 401) {
        console.log('   ✅ Server is running, but requires authentication (expected)');
      } else {
        console.log('   ⚠️ Unexpected server response');
      }
    } catch (error) {
      console.log('   ❌ Cannot connect to server:', error.message);
      return;
    }

    // Test admin users route without authentication
    console.log('\n2. Testing admin users route without authentication...');
    try {
      const response = await fetch('http://localhost:4007/api/v1/admin/users/users');
      console.log('   Response status:', response.status);
      if (response.status === 400) {
        console.log('   ✅ Route exists, requires authentication (expected)');
      } else if (response.status === 404) {
        console.log('   ❌ Route not found');
      } else {
        console.log('   ⚠️ Unexpected status:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    // Test exam results search route without authentication
    console.log('\n3. Testing exam results search route without authentication...');
    try {
      const response = await fetch('http://localhost:4007/api/v1/exam-results/search?page=1&limit=20');
      console.log('   Response status:', response.status);
      if (response.status === 400) {
        console.log('   ✅ Route exists, requires authentication (expected)');
      } else if (response.status === 404) {
        console.log('   ❌ Route not found');
      } else {
        console.log('   ⚠️ Unexpected status:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n📋 Summary:');
    console.log('   - If you see 400 status codes, the routes exist and require authentication');
    console.log('   - If you see 404 status codes, there are route configuration issues');
    console.log('   - The 403 errors you\'re seeing suggest the user is not properly authenticated');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure the user is logged in on the frontend');
    console.log('   2. Check if the JWT cookie is set in the browser');
    console.log('   3. Verify the user role is ADMIN in the database');
    console.log('   4. Try logging out and logging back in');

  } catch (error) {
    console.error('❌ Error checking auth status:', error);
  }
};

checkAuthStatus();
