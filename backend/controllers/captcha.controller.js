import crypto from 'crypto';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { getCairoNow } from '../utils/timezone.js';

// Store CAPTCHA sessions in memory (in production, use Redis or database)
const captchaSessions = new Map();

// Clean up expired CAPTCHA sessions every hour
setInterval(() => {
  const now = getCairoNow().getTime();
  for (const [sessionId, session] of captchaSessions.entries()) {
    if (now - session.createdAt > 300000) { // 5 minutes expiry
      captchaSessions.delete(sessionId);
    }
  }
}, 3600000); // Clean every hour

// Generate random CAPTCHA challenge
const generateCaptchaChallenge = () => {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1, num2, answer;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer: answer.toString(),
    displayQuestion: `ما هو ناتج: ${num1} ${operation === '+' ? '+' : operation === '-' ? '-' : '×'} ${num2} ؟`
  };
};

// Generate CAPTCHA
export const generateCaptcha = async (req, res, next) => {
  try {
    // Generate session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Generate challenge
    const challenge = generateCaptchaChallenge();
    
    // Store session
    captchaSessions.set(sessionId, {
      answer: challenge.answer,
      createdAt: getCairoNow().getTime(),
      attempts: 0
    });
    
    res.status(200).json(new ApiResponse(200, {
      sessionId,
      question: challenge.displayQuestion
    }, 'تم إنشاء كود الأمان بنجاح'));
    
  } catch (error) {
    next(new ApiError(500, 'خطأ في إنشاء كود الأمان'));
  }
};

// Verify CAPTCHA
export const verifyCaptcha = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    
    console.log('=== CAPTCHA VERIFICATION REQUEST DEBUG ===');
    console.log('Received sessionId:', sessionId);
    console.log('Received answer:', answer);
    console.log('Total sessions before verification:', captchaSessions.size);
    console.log('Available session IDs:', Array.from(captchaSessions.keys()));
    console.log('=== END DEBUG ===');
    
    if (!sessionId || !answer) {
      return next(new ApiError(400, 'معرف الجلسة والإجابة مطلوبان'));
    }
    
    const session = captchaSessions.get(sessionId);
    
    console.log('Session lookup result:', {
      sessionExists: !!session,
      sessionData: session ? {
        answer: session.answer,
        createdAt: session.createdAt,
        attempts: session.attempts,
        verified: session.verified
      } : null
    });
    
    if (!session) {
      return next(new ApiError(400, 'كود الأمان غير صحيح أو منتهي الصلاحية'));
    }
    
    // Check if too many attempts
    if (session.attempts >= 3) {
      captchaSessions.delete(sessionId);
      return next(new ApiError(400, 'تم تجاوز عدد المحاولات المسموح'));
    }
    
    // Check if expired (5 minutes)
    if (getCairoNow().getTime() - session.createdAt > 300000) {
      captchaSessions.delete(sessionId);
      return next(new ApiError(400, 'كود الأمان منتهي الصلاحية'));
    }
    
    // Increment attempts
    session.attempts++;
    
    // Check answer
    if (answer.toString().trim() !== session.answer) {
      console.log('Answer mismatch:', {
        userAnswer: answer.toString().trim(),
        correctAnswer: session.answer,
        match: answer.toString().trim() === session.answer
      });
      return next(new ApiError(400, 'إجابة خاطئة، يرجى المحاولة مرة أخرى'));
    }
    
    // Success - mark as verified
    session.verified = true;
    
    console.log('CAPTCHA verification successful:', {
      sessionId,
      verified: session.verified,
      totalSessions: captchaSessions.size
    });
    
    res.status(200).json(new ApiResponse(200, { verified: true }, 'تم التحقق بنجاح'));
    
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    next(new ApiError(500, 'خطأ في التحقق من كود الأمان'));
  }
};

// Middleware to check if CAPTCHA is verified
export const requireCaptchaVerification = (req, res, next) => {
  // Check for captchaSessionId in both req.body and req.body (in case of FormData)
  const captchaSessionId = req.body.captchaSessionId;
  
  console.log('=== CAPTCHA VERIFICATION MIDDLEWARE DEBUG ===');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request body type:', typeof req.body);
  console.log('CAPTCHA session ID found:', !!captchaSessionId);
  console.log('CAPTCHA session ID value:', captchaSessionId);
  console.log('CAPTCHA session ID type:', typeof captchaSessionId);
  console.log('CAPTCHA session ID length:', captchaSessionId ? captchaSessionId.length : 0);
  console.log('Total CAPTCHA sessions in memory:', captchaSessions.size);
  console.log('Available session IDs:', Array.from(captchaSessions.keys()));
  console.log('=== END DEBUG ===');
  
  if (!captchaSessionId) {
    console.log('No CAPTCHA session ID found in request');
    return next(new ApiError(400, 'التحقق من رمز الأمان مطلوب'));
  }
  
  const session = captchaSessions.get(captchaSessionId);
  
  console.log('CAPTCHA Session Check:', {
    sessionExists: !!session,
    sessionVerified: session?.verified,
    sessionAnswer: session?.answer,
    sessionCreatedAt: session?.createdAt,
    sessionAttempts: session?.attempts,
    currentTime: getCairoNow().getTime(),
    timeDifference: session ? getCairoNow().getTime() - session.createdAt : 'N/A'
  });
  
  if (!session || !session.verified) {
    console.log('CAPTCHA session not found or not verified');
    return next(new ApiError(400, 'يرجى التحقق من رمز الأمان أولاً'));
  }
  
  console.log('CAPTCHA verification successful, proceeding with registration');
  
  // Clean up the session after use
  captchaSessions.delete(captchaSessionId);
  console.log('CAPTCHA session cleaned up, remaining sessions:', captchaSessions.size);
  
  next();
};
