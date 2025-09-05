import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaTimes, 
  FaClock, 
  FaCheck, 
  FaTimes as FaX, 
  FaPlay, 
  FaPause,
  FaArrowLeft,
  FaArrowRight,
  FaFlag,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrophy,
  FaGraduationCap,
  FaClipboardCheck
} from 'react-icons/fa';
import { axiosInstance } from '../Helpers/axiosInstance';

const TakeExamModal = ({ 
  isOpen, 
  onClose, 
  lesson, 
  courseId, 
  unitId, 
  examType = 'training' 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [examTaken, setExamTaken] = useState(false);
  const [existingResult, setExistingResult] = useState(null);
  const [checkingExam, setCheckingExam] = useState(true);
  
  // Add startTime tracking
  const startTimeRef = useRef(null);

  const exam = examType === 'training' ? lesson?.trainingExam : lesson?.finalExam;
  const totalQuestions = exam?.questions?.length || 0;
  const timeLimit = exam?.timeLimit || 30;

  // Check if exam has been taken and initialize answers array
  useEffect(() => {
    const checkExamStatus = async () => {
      if (exam && exam.questions && courseId && lesson._id) {
        try {
          const response = await axiosInstance.get(`/exams/check/${courseId}/${lesson._id}/${examType}`);
          const { hasTaken, result } = response.data.data;
          
          setExamTaken(hasTaken);
          if (hasTaken && result) {
            setExistingResult(result);
            setExamCompleted(true);
            setExamResult(result);
          }
        } catch (error) {
          console.error('Error checking exam status:', error);
        } finally {
          setCheckingExam(false);
        }
      } else {
        setCheckingExam(false);
      }
    };

    checkExamStatus();
    
    if (exam && exam.questions) {
      setAnswers(new Array(exam.questions.length).fill(null));
    }
  }, [exam, courseId, lesson._id, examType]);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    
    if (examStarted && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, isTimerRunning, timeLeft]);

  const startExam = () => {
    if (examTaken) {
      toast.error('You have already taken this exam!');
      return;
    }
    startTimeRef.current = Date.now(); // Track start time
    setExamStarted(true);
    setTimeLeft(timeLimit * 60); // Convert to seconds
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = { selectedAnswer };
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    // Check if all questions are answered
    const unansweredCount = answers.filter(answer => answer === null).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    setIsTimerRunning(false);

    try {
      const timeTaken = Math.floor((timeLimit * 60 - timeLeft) / 60); // Convert back to minutes
      
      const response = await axiosInstance.post(`/exams/${examType}`, {
        courseId,
        lessonId: lesson._id,
        unitId,
        answers: answers.map((answer, index) => ({
          questionIndex: index,
          selectedAnswer: answer?.selectedAnswer || 0
        })),
        startTime: startTimeRef.current ? new Date(startTimeRef.current).toISOString() : null, // Send start time
        timeTaken
      });

      setExamResult(response.data.data);
      setExamCompleted(true);
      toast.success(`${examType === 'training' ? 'Training' : 'Final'} exam completed!`);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (examStarted && !examCompleted) {
      const confirmClose = window.confirm(
        'Are you sure you want to close the exam? Your progress will be lost.'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== null) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-blue-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              {examType === 'training' ? (
                <FaClipboardCheck className="text-lg sm:text-2xl text-blue-500 flex-shrink-0" />
              ) : (
                <FaGraduationCap className="text-lg sm:text-2xl text-red-500 flex-shrink-0" />
              )}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {examType === 'training' ? 'Training' : 'Final'} Exam
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:block">
              {lesson.title}
            </span>
          </div>
          
          {examStarted && !examCompleted && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 bg-red-100 dark:bg-red-900/20 px-2 sm:px-3 py-1 rounded-lg">
                <FaClock className="text-red-500 text-sm sm:text-base" />
                <span className="font-mono text-red-600 dark:text-red-400 text-xs sm:text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={isTimerRunning ? pauseTimer : resumeTimer}
                className="p-1 sm:p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isTimerRunning ? <FaPause className="text-sm sm:text-base" /> : <FaPlay className="text-sm sm:text-base" />}
              </button>
            </div>
          )}
          
          <button
            onClick={handleClose}
            className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
          >
            <FaTimes className="text-sm sm:text-base" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Left Sidebar - Question Navigation */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
            {checkingExam ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Checking exam status...</p>
                </div>
              </div>
            ) : examTaken ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Exam Already Taken
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You have already completed this {examType === 'training' ? 'training' : 'final'} exam.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(existingResult?.score)}`}>
                        {existingResult?.score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {existingResult?.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !examStarted ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Exam Instructions
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span>Time Limit: {timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      <span>Total Questions: {totalQuestions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-blue-500" />
                      <span>Passing Score: {exam?.passingScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-500" />
                      <span>You can only take this exam once</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={startExam}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Start {examType === 'training' ? 'Training' : 'Final'} Exam
                </button>
              </div>
            ) : examCompleted ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Exam Results
                </h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(examResult?.score)}`}>
                        {examResult?.score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {examResult?.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span className="font-semibold">{examResult?.correctAnswers}/{examResult?.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Taken:</span>
                      <span className="font-semibold">{examResult?.timeTaken} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Score:</span>
                      <span className="font-semibold">{examResult?.passingScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Question Navigation
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
                  {exam.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`p-1 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        index === currentQuestion
                          ? 'bg-blue-500 text-white'
                          : getQuestionStatus(index) === 'answered'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 dark:bg-green-900/20 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {!examStarted ? (
                              <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-4">
                    {examType === 'training' ? '📝' : '🎓'}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {examType === 'training' ? 'Training Exam' : 'Final Exam'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                    {examType === 'training' 
                      ? 'This is a practice exam to test your understanding of the lesson material.'
                      : 'This is the final assessment to evaluate your mastery of the lesson.'
                    }
                  </p>
                </div>
            ) : examCompleted ? (
                              <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="text-4xl sm:text-6xl mb-4">
                      {examResult?.passed ? '🎉' : '😔'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {examResult?.passed ? 'Congratulations!' : 'Keep Learning!'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                      {examResult?.passed 
                        ? 'You have successfully passed the exam.'
                        : 'Don\'t worry, you can review the material and try again later.'
                      }
                    </p>
                  </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question Review
                  </h4>
                  {examResult?.questions?.map((question, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        {question.isCorrect ? (
                          <FaCheckCircle className="text-green-500 mt-1" />
                        ) : (
                          <FaX className="text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            Question {index + 1}: {question.question}
                          </p>
                          <div className="space-y-1">
                            {question.options.slice(0, question.numberOfOptions || 4).map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded ${
                                  optionIndex === question.correctAnswer
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : optionIndex === question.userAnswer && !question.isCorrect
                                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                                )}
                                {optionIndex === question.userAnswer && !question.isCorrect && (
                                  <span className="ml-2 text-red-600 dark:text-red-400">✗ Your Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReviewMode(!reviewMode)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        reviewMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <FaFlag className="inline mr-1 text-xs sm:text-sm" />
                      Review
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white mb-4 sm:mb-6">
                      {exam.questions[currentQuestion].question}
                    </p>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {exam.questions[currentQuestion].options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-start sm:items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            answers[currentQuestion]?.selectedAnswer === optionIndex
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={optionIndex}
                            checked={answers[currentQuestion]?.selectedAnswer === optionIndex}
                            onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                            className="mr-3 mt-1 sm:mt-0 flex-shrink-0"
                          />
                          <span className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <FaArrowLeft className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {currentQuestion === totalQuestions - 1 ? (
                      <button
                        onClick={handleSubmitExam}
                        disabled={submitting}
                        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            <span className="hidden sm:inline">Submitting...</span>
                          </>
                        ) : (
                          <>
                            <FaCheck className="text-xs sm:text-sm" />
                            <span className="hidden sm:inline">Submit Exam</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <FaArrowRight className="text-xs sm:text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExamModal; 