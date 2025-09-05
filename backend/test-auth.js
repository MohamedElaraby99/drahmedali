import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const testAuth = async () => {
  try {
    // Test with a mock admin user token
    const mockAdminUser = {
      id: '68a205659166f20db275c054', // Use the actual admin user ID from your database
      email: 'adminn@api.com',
      role: 'ADMIN'
    };

    // Create a JWT token
    const token = jwt.sign(mockAdminUser, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1h' });
    
    console.log('Created JWT token:', token.substring(0, 50) + '...');
    console.log('Token payload:', mockAdminUser);

    // Test the admin users route with authentication
    console.log('\nTesting admin users route with authentication...');
    const adminUsersResponse = await fetch('http://localhost:4007/api/v1/admin/users/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    });
    
    console.log('Admin users route status:', adminUsersResponse.status);
    if (adminUsersResponse.status === 200) {
      console.log('✅ Route working with authentication');
      const data = await adminUsersResponse.json();
      console.log('Response data:', data);
    } else if (adminUsersResponse.status === 401) {
      console.log('❌ Authentication failed');
    } else if (adminUsersResponse.status === 403) {
      console.log('❌ Authorization failed (role issue)');
    } else {
      console.log('⚠️ Unexpected status:', adminUsersResponse.status);
    }

    // Test the exam results search route with authentication
    console.log('\nTesting exam results search route with authentication...');
    const examSearchResponse = await fetch('http://localhost:4007/api/v1/exam-results/search?page=1&limit=20', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    });
    
    console.log('Exam results search route status:', examSearchResponse.status);
    if (examSearchResponse.status === 200) {
      console.log('✅ Route working with authentication');
      const data = await examSearchResponse.json();
      console.log('Response data:', data);
    } else if (examSearchResponse.status === 401) {
      console.log('❌ Authentication failed');
    } else if (examSearchResponse.status === 403) {
      console.log('❌ Authorization failed (role issue)');
    } else {
      console.log('⚠️ Unexpected status:', examSearchResponse.status);
    }

  } catch (error) {
    console.error('Error testing authentication:', error);
  }
};

testAuth();
