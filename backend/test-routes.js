import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testRoutes = async () => {
  try {
    // Test the admin users route
    console.log('Testing admin users route...');
    const adminUsersResponse = await fetch('http://localhost:4007/api/v1/admin/users/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Admin users route status:', adminUsersResponse.status);
    if (adminUsersResponse.status === 401) {
      console.log('✅ Route exists but requires authentication (expected)');
    } else if (adminUsersResponse.status === 404) {
      console.log('❌ Route not found');
    } else {
      console.log('⚠️ Unexpected status:', adminUsersResponse.status);
    }

    // Test the exam results search route
    console.log('\nTesting exam results search route...');
    const examSearchResponse = await fetch('http://localhost:4007/api/v1/exam-results/search', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Exam results search route status:', examSearchResponse.status);
    if (examSearchResponse.status === 401) {
      console.log('✅ Route exists but requires authentication (expected)');
    } else if (examSearchResponse.status === 404) {
      console.log('❌ Route not found');
    } else {
      console.log('⚠️ Unexpected status:', examSearchResponse.status);
    }

  } catch (error) {
    console.error('Error testing routes:', error);
  }
};

testRoutes();
