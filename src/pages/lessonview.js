import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';

// kinda made by ai (again) .-.
const LessonView = ({ user }) => {
  // URL parameters for lesson identification
  const { subject, topic, title } = useParams();
  const navigate = useNavigate();
  
  // Core lesson state
  const [questions, setQuestions] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Question interaction state
  const [selected, setSelected] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  // XP and progress state
  const [earnedXP, setEarnedXP] = useState(0);
  const [xpAdded, setXpAdded] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  
  // Lesson statistics
  const [lessonStats, setLessonStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    firstTryCorrect: 0,
    hintsUsed: 0,
    accuracy: 0
  });
  
  // Streak tracking
  const [streakRenewed, setStreakRenewed] = useState(false);
  const [streakAnimation, setStreakAnimation] = useState(false);
  
  // Hint system state
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [requireHint, setRequireHint] = useState(false);
  const [delayActive, setDelayActive] = useState(false);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add mode selection state
  const [mode, setMode] = useState(null); // 'single' or 'scroll'
  // For scroll mode: track completed questions and their answers/feedback
  const [completedQuestions, setCompletedQuestions] = useState([]);
  
  // Track question attempts for statistics
  const [questionAttempts, setQuestionAttempts] = useState({});

  // Audio objects - moved inside component to avoid memory leaks
  // BUG FIX: Audio objects should be created when needed, not on every render
  const playSound = (soundType) => {
    try {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.play().catch(err => console.warn('Audio playback failed:', err));
    } catch (err) {
      console.warn('Audio creation failed:', err);
    }
  };

  /**
   * Fetch lesson data and questions from Supabase
   * Handles error states and loading states
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lesson data
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject', subject)
          .eq('topic', topic)
          .eq('title', title)
          .single();

        if (lessonError) {
          console.error('Lesson fetch error:', lessonError);
          setError('Lesson not found');
          return;
        }

        if (!lessonData) {
          setError('Lesson not found');
          return;
        }

        setLesson(lessonData);

        // Fetch all questions for this lesson
        const { data: allQuestions, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('lesson_id', lessonData.id);

        if (questionsError) {
          console.error('Questions fetch error:', questionsError);
          setError('Failed to load questions');
          return;
        }

        if (!allQuestions || allQuestions.length === 0) {
          setError('No questions found for this lesson');
          return;
        }

        // Group questions by number and randomly select one from each group
        const groupedByNumber = {};
        allQuestions.forEach(q => {
          if (!groupedByNumber[q.number]) groupedByNumber[q.number] = [];
          groupedByNumber[q.number].push(q);
        });

        const selectedQuestions = Object.values(groupedByNumber)
          .map(group => group[Math.floor(Math.random() * group.length)])
          .sort((a, b) => a.number - b.number);

        setQuestions(selectedQuestions);

        // Check if user has completed this lesson before
        const { data: log, error: logError } = await supabase
          .from('lesson_logs')
          .select('*')
          .eq('user_id', user?.id)
          .eq('lesson', lessonData.id);

        if (logError) {
          console.warn('Log fetch error:', logError);
          // Don't fail the entire lesson for log errors
        }

        setFirstTime(!log || log.length === 0);
        setLoading(false);

      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError('Failed to load lesson');
        setLoading(false);
      }
    };

    // Only fetch if we have all required parameters and user
    if (subject && topic && title && user?.id) {
      fetchData();
    } else {
      setError('Missing required parameters');
      setLoading(false);
    }
  }, [subject, topic, title, user?.id]);

  // Derived state
  const currentQuestion = questions[currentQ];
  const progressPercent = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;

  // --- MODE SELECTION SCREEN ---
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-purple-800">How do you want to view this lesson?</h2>
          <p className="mb-6 text-gray-600">Choose your preferred mode:</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('single')}
              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              One question at a time
            </button>
            <button
              onClick={() => setMode('scroll')}
              className="bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Scroll mode (see all completed questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Award XP to user for correct answers
   * First-time users get more XP
   */
  const awardXP = () => {
    const amount = firstTime ? 3 : 1;
    setEarnedXP(prev => prev + amount);
    playSound('xp');
  };

  /**
   * Handle multiple choice question selection
   * Includes hint requirement logic and answer validation
   */
  const handleMultipleChoice = (option) => {
    // Prevent multiple submissions
    if (feedback?.type === 'correct') return;
    
    // Check if hint is required but not shown
    if (requireHint && !showHint) {
      setFeedback({ type: 'hint', msg: 'Please click the hint button first! 💡' });
      return;
    }
    
    // Prevent rapid clicking during delay
    if (delayActive) return;

    // Track attempts for this question
    const questionId = currentQuestion.id;
    const currentAttempts = questionAttempts[questionId] || 0;
    setQuestionAttempts(prev => ({
      ...prev,
      [questionId]: currentAttempts + 1
    }));

    // Validate answer (case-insensitive, trimmed)
    const correct = option.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    
    if (correct) {
      playSound('correct');
      awardXP();
      setSelected(option);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      playSound('wrong');
      setRequireHint(true);
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  /**
   * Handle hint display with delay to prevent spam
   * Fetches hint from database
   */
  const handleHint = async () => {
    try {
      setShowHint(true);
      setDelayActive(true);
      
      // Add delay to prevent rapid clicking
      setTimeout(() => setDelayActive(false), 1000);

      // Fetch hint from database
      const { data, error } = await supabase
        .from('questions')
        .select('hint')
        .eq('id', currentQuestion.id)
        .single();

      if (error) {
        console.error('Hint fetch error:', error);
        setHint('Hint not available');
      } else {
        setHint(data?.hint || 'No hint available');
      }
    } catch (err) {
      console.error('Hint error:', err);
      setHint('Hint not available');
    }
  };

  /**
   * Handle written answer submission
   * Validates answer and provides feedback
   */
  const handleWritten = () => {
    if (feedback?.type === 'correct') return;
    
    // Track attempts for this question
    const questionId = currentQuestion.id;
    const currentAttempts = questionAttempts[questionId] || 0;
    setQuestionAttempts(prev => ({
      ...prev,
      [questionId]: currentAttempts + 1
    }));
    
    // Validate written answer
    const correct = writtenAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    
    if (correct) {
      playSound('correct');
      awardXP();
      setSelected(writtenAnswer);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      playSound('wrong');
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  /**
   * Move to next question or complete lesson
   * Resets all question-specific state
   */
  const handleNext = () => {
    // Reset question state
    setSelected(null);
    setWrittenAnswer('');
    setFeedback(null);
    setShowHint(false);
    setRequireHint(false);
    setHint('');
    
    // Move to next question or complete
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
      // Calculate final stats and update streak
      const stats = calculateStats();
      setLessonStats(stats);
      updateStreak();
    }
  };

  /**
   * Calculate lesson statistics
   */
  const calculateStats = () => {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((_, index) => {
      const questionId = questions[index].id;
      return questionAttempts[questionId] && questionAttempts[questionId] > 0;
    }).length;
    
    const firstTryCorrect = questions.filter((_, index) => {
      const questionId = questions[index].id;
      return questionAttempts[questionId] === 1;
    }).length;
    
    const hintsUsed = questions.filter((_, index) => {
      const questionId = questions[index].id;
      return questionAttempts[questionId] > 1; // If more than 1 attempt, likely used hint
    }).length;
    
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      correctAnswers,
      firstTryCorrect,
      hintsUsed,
      accuracy
    };
  };

  /**
   * Update user streak
   */
  const updateStreak = async () => {
    if (!user) return;

    try {
      // Get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('streak, last_active')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActive = userData?.last_active ? new Date(userData.last_active).toISOString().split('T')[0] : null;
      const currentStreak = userData?.streak || 0;

      let newStreak = currentStreak;
      let streakUpdated = false;

      if (!lastActive || lastActive !== today) {
        // Check if yesterday was the last active day (consecutive)
        if (lastActive) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActive === yesterdayStr) {
            newStreak = currentStreak + 1;
            streakUpdated = true;
          } else {
            // Streak broken, start over
            newStreak = 1;
            streakUpdated = true;
          }
        } else {
          // First time, start streak
          newStreak = 1;
          streakUpdated = true;
        }

        // Update streak and last active
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            streak: newStreak, 
            last_active: new Date().toISOString() 
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Streak update error:', updateError);
          return;
        }

        if (streakUpdated) {
          setStreakRenewed(true);
          setStreakAnimation(true);
          setTimeout(() => setStreakAnimation(false), 3000);
        }
      }
    } catch (err) {
      console.error('Streak update error:', err);
    }
  };

  /**
   * Add XP to user's account and log completion
   * Includes first-time bonus and error handling
   */
  const addXP = async () => {
    if (!user || xpAdded) return;

    try {
      const bonus = firstTime ? 30 : 0;
      const totalXP = earnedXP + bonus;

      // Get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('xp, daily_xp_earned, daily_lessons_completed')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('User data fetch error:', userError);
        return;
      }

      // Update user XP and daily tracking
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          xp: (userData?.xp || 0) + totalXP,
          daily_xp_earned: (userData?.daily_xp_earned || 0) + totalXP,
          daily_lessons_completed: (userData?.daily_lessons_completed || 0) + 1
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('XP update error:', updateError);
        return;
      }

      // Log lesson completion
      const { error: logError } = await supabase
        .from('lesson_logs')
        .insert([{ 
          user_id: user.id, 
          xp: totalXP, 
          lesson: lesson.id 
        }]);

      if (logError) {
        console.error('Lesson log error:', logError);
      }

      setXpAdded(true);
      playSound('correct');
      
    } catch (err) {
      console.error('XP addition error:', err);
    }
  };

  // --- SCROLL MODE HANDLERS ---
  const handleMultipleChoiceScroll = (option) => {
    if (feedback?.type === 'correct') return;
    if (requireHint && !showHint) {
      setFeedback({ type: 'hint', msg: 'Please click the hint button first! 💡' });
      return;
    }
    if (delayActive) return;
    const correct = option.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      playSound('correct');
      awardXP();
      setSelected(option);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      playSound('wrong');
      setRequireHint(true);
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  const handleWrittenScroll = () => {
    if (feedback?.type === 'correct') return;
    const correct = writtenAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      playSound('correct');
      awardXP();
      setSelected(writtenAnswer);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      playSound('wrong');
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  const handleNextScroll = () => {
    // Save the completed question with answer, feedback, hint, etc.
    setCompletedQuestions(prev => [
      ...prev,
      {
        ...currentQuestion,
        selected,
        feedback,
        showHint,
        hint,
      }
    ]);
    // Reset state for next question
    setSelected(null);
    setWrittenAnswer('');
    setFeedback(null);
    setShowHint(false);
    setRequireHint(false);
    setHint('');
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
      // Calculate final stats and update streak
      const stats = calculateStats();
      setLessonStats(stats);
      updateStreak();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ {error}</h2>
          <button
            onClick={() => navigate('/lessons')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            ← Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  // Main lesson interface
  if (mode === 'scroll') {
    // SCROLL MODE UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
        <motion.div
          className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Lesson Header */}
          <h1 className="text-2xl font-bold mb-2 text-purple-800">📘 {lesson.title}</h1>
          <p className="mb-6 text-gray-700 whitespace-pre-line">{lesson.explanation}</p>

          {/* Completed Questions */}
          <div className="space-y-8">
            {completedQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="mb-2">
                  <span className="text-sm text-gray-500">Question {idx + 1}</span>
                  <h2 className="text-lg font-semibold text-gray-800 mt-1">{q.question}</h2>
                </div>
                {q.type === 'multiple' && (
                  <div className="flex flex-col gap-2 mt-2">
                    {q.options?.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded border ${q.selected === opt
                          ? q.feedback?.type === 'correct'
                            ? 'bg-green-100 border-green-400'
                            : 'bg-red-100 border-red-400'
                          : 'bg-gray-100 border-gray-200'} text-gray-700`}
                      >
                        {opt}
                      </div>
                    ))}
                    {q.showHint && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">💡 {q.hint}</div>
                    )}
                  </div>
                )}
                {q.type === 'write' && (
                  <div className="mt-2">
                    <div className="p-2 rounded border bg-gray-100 border-gray-200 text-gray-700 mb-1">{q.selected}</div>
                  </div>
                )}
                {q.type === 'text' && (
                  <div className="mt-2 text-gray-700">{q.question}</div>
                )}
                {q.feedback && (
                  <div className={`mt-2 text-sm font-medium ${q.feedback.type === 'correct' ? 'text-green-600' : 'text-red-500'}`}>{q.feedback.msg}</div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Next Active Question */}
          {!completed && currentQ < questions.length && (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: completedQuestions.length * 0.1 }}
              className="mt-10 bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-md"
            >
              {/* Text Question */}
              {currentQuestion.type === 'text' && (
                <div className="mb-4 text-gray-800 whitespace-pre-line">{currentQuestion.question}</div>
              )}
              {/* Multiple Choice */}
              {currentQuestion.type === 'multiple' && (
                <div className="space-y-2 mb-4">
                  <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                  {currentQuestion.options?.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleMultipleChoiceScroll(opt)}
                      whileTap={{ scale: 0.97 }}
                      disabled={feedback?.type === 'correct' || delayActive}
                      className={`block w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selected === opt
                          ? feedback?.type === 'correct'
                            ? 'bg-green-100 border-green-400'
                            : 'bg-red-100 border-red-400'
                          : 'bg-gray-100 hover:bg-gray-200'
                      } ${delayActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                  {/* Hint Button */}
                  {requireHint && !showHint && (
                    <motion.button
                      onClick={handleHint}
                      whileTap={{ scale: 0.95 }}
                      className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Show Hint
                    </motion.button>
                  )}
                  {/* Hint Display */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded"
                      >
                        💡 {hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {/* Written Answer */}
              {currentQuestion.type === 'write' && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                  <input
                    type="text"
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleWrittenScroll()}
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Type your answer..."
                    disabled={feedback?.type === 'correct'}
                  />
                  <button
                    onClick={handleWrittenScroll}
                    disabled={feedback?.type === 'correct' || !writtenAnswer.trim()}
                    className={`px-4 py-2 rounded ${
                      feedback?.type === 'correct' || !writtenAnswer.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              )}
              {/* Feedback Display */}
              <AnimatePresence>
                {feedback && (
                  <motion.p
                    key={feedback.msg}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm font-medium mb-4 ${
                      feedback.type === 'correct' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {feedback.msg}
                  </motion.p>
                )}
              </AnimatePresence>
              {/* Next Button */}
              {(feedback?.type === 'correct' || currentQuestion.type === 'text') && (
                <div className="flex justify-end items-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleNextScroll}
                    className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
                  >
                    {currentQ + 1 === questions.length ? 'Finish Lesson' : 'Next'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Completion Screen */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-10"
            >
              {/* Streak Animation */}
              <AnimatePresence>
                {streakAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
                  >
                    <motion.div
                      initial={{ scale: 0.5, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0.5, rotate: 180 }}
                      className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-8 rounded-2xl shadow-2xl text-center"
                    >
                      <div className="text-6xl mb-4">🔥</div>
                      <h2 className="text-3xl font-bold mb-2">Streak Renewed!</h2>
                      <p className="text-xl">Keep up the great work!</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-green-600 mb-6">🎉 Lesson Complete!</h2>
                
                {/* First Time Badge */}
                {firstTime && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full inline-block mb-6"
                  >
                    🎁 First Time Completion!
                  </motion.div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{lessonStats.totalQuestions}</div>
                    <div className="text-sm text-blue-600">Total Questions</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{lessonStats.correctAnswers}</div>
                    <div className="text-sm text-green-600">Correct Answers</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{lessonStats.firstTryCorrect}</div>
                    <div className="text-sm text-purple-600">First Try</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{lessonStats.accuracy}%</div>
                    <div className="text-sm text-orange-600">Accuracy</div>
                  </div>
                </div>

                {/* XP Section */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-bold mb-2">XP Earned</h3>
                  <div className="text-3xl font-bold mb-2">
                    +{earnedXP} XP
                    {firstTime && <span className="text-yellow-300"> + 30 🎁</span>}
                  </div>
                  <p className="text-green-100">
                    {firstTime ? 'First time bonus included!' : 'Great job!'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!xpAdded ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addXP}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Collect +{earnedXP + (firstTime ? 30 : 0)} XP
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-green-100 text-green-800 px-8 py-3 rounded-lg font-semibold"
                    >
                      ✅ XP Collected!
                    </motion.div>
                  )}
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/lessons')}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    ← Back to Lessons
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          {!completed && (
            <div className="mt-6">
              <div className="h-3 w-full bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600 mt-1">
                Question {currentQ + 1} of {questions.length}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Main lesson interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <motion.div
        className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Lesson Header */}
        <h1 className="text-2xl font-bold mb-2 text-purple-800">📘 {lesson.title}</h1>
        <p className="mb-6 text-gray-700 whitespace-pre-line">{lesson.explanation}</p>

        {!completed ? (
          <>
            {/* Text Question Display */}
            {currentQuestion.type === 'text' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 whitespace-pre-line">{currentQuestion.question}</p>
              </div>
            )}

            {/* Multiple Choice Question */}
            {currentQuestion.type === 'multiple' && (
              <div className="space-y-2 mb-4">
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                {currentQuestion.options?.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleMultipleChoice(opt)}
                    whileTap={{ scale: 0.97 }}
                    disabled={feedback?.type === 'correct' || delayActive}
                    className={`block w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selected === opt
                        ? feedback?.type === 'correct' 
                          ? 'bg-green-100 border-green-400' 
                          : 'bg-red-100 border-red-400'
                        : 'bg-gray-100 hover:bg-gray-200'
                    } ${delayActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opt}
                  </motion.button>
                ))}
                
                {/* Hint Button */}
                {requireHint && !showHint && (
                  <motion.button
                    onClick={handleHint}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded text-sm font-semibold"
                  >
                    Show Hint
                  </motion.button>
                )}
                
                {/* Hint Display */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded"
                    >
                      💡 {hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Written Answer Question */}
            {currentQuestion.type === 'write' && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                <input
                  type="text"
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleWritten()}
                  className="w-full border p-2 rounded mb-2"
                  placeholder="Type your answer..."
                  disabled={feedback?.type === 'correct'}
                />
                <button
                  onClick={handleWritten}
                  disabled={feedback?.type === 'correct' || !writtenAnswer.trim()}
                  className={`px-4 py-2 rounded ${
                    feedback?.type === 'correct' || !writtenAnswer.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Submit
                </button>
              </div>
            )}

            {/* Feedback Display */}
            <AnimatePresence>
              {feedback && (
                <motion.p
                  key={feedback.msg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-sm font-medium mb-4 ${
                    feedback.type === 'correct' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {feedback.msg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Next Button and XP Display */}
            {(feedback?.type === 'correct' || currentQuestion.type === 'text') && (
              <div className="flex justify-between items-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleNext}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
                >
                  {currentQ + 1 === questions.length ? 'Finish Lesson' : 'Next'}
                </motion.button>
                <motion.div
                  key={earnedXP}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: [1.2, 1], opacity: [1, 1] }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-md"
                >
                  +{earnedXP} XP
                </motion.div>
              </div>
            )}
          </>
        ) : (
          /* Lesson Completion Screen */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Streak Animation */}
            <AnimatePresence>
              {streakAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.5, rotate: 180 }}
                    className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-8 rounded-2xl shadow-2xl text-center"
                  >
                    <div className="text-6xl mb-4">🔥</div>
                    <h2 className="text-3xl font-bold mb-2">Streak Renewed!</h2>
                    <p className="text-xl">Keep up the great work!</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-green-600 mb-6">🎉 Lesson Complete!</h2>
              
              {/* First Time Badge */}
              {firstTime && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full inline-block mb-6"
                >
                  🎁 First Time Completion!
                </motion.div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{lessonStats.totalQuestions}</div>
                  <div className="text-sm text-blue-600">Total Questions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{lessonStats.correctAnswers}</div>
                  <div className="text-sm text-green-600">Correct Answers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{lessonStats.firstTryCorrect}</div>
                  <div className="text-sm text-purple-600">First Try</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{lessonStats.accuracy}%</div>
                  <div className="text-sm text-orange-600">Accuracy</div>
                </div>
              </div>

              {/* XP Section */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold mb-2">XP Earned</h3>
                <div className="text-3xl font-bold mb-2">
                  +{earnedXP} XP
                  {firstTime && <span className="text-yellow-300"> + 30 🎁</span>}
                </div>
                <p className="text-green-100">
                  {firstTime ? 'First time bonus included!' : 'Great job!'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!xpAdded ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addXP}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Collect +{earnedXP + (firstTime ? 30 : 0)} XP
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-green-100 text-green-800 px-8 py-3 rounded-lg font-semibold"
                  >
                    ✅ XP Collected!
                  </motion.div>
                )}
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/lessons')}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  ← Back to Lessons
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        {!completed && (
          <div className="mt-6">
            <div className="h-3 w-full bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-center text-gray-600 mt-1">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LessonView;
