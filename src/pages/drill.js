import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';

const Drill = ({ user }) => {
  const { subject, topic, count } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [requireHint, setRequireHint] = useState(false);
  const [delayActive, setDelayActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Audio feedback
  const playSound = (soundType) => {
    try {
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.play().catch(() => {});
    } catch {}
  };

  useEffect(() => {
    if (!user) {
      navigate('/lessons');
      return;
    }
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      // Fetch all questions for the topic, excluding type 'text'
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', subject)
        .eq('topic', topic);
      if (error) {
        setError('Failed to load questions');
        setLoading(false);
        return;
      }
      // Filter out info slides
      const filtered = (data || []).filter(q => q.type !== 'text');
      // Shuffle and pick up to count
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, Number(count)));
      setLoading(false);
    };
    fetchQuestions();
  }, [subject, topic, count, user, navigate]);

  const currentQuestion = questions[currentQ];
  const progressPercent = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;

  // Answer logic
  const handleMultipleChoice = (option) => {
    if (feedback?.type === 'correct') return;
    if (requireHint && !showHint) {
      setFeedback({ type: 'hint', msg: 'Please click the hint button first! 💡' });
      return;
    }
    if (delayActive) return;
    const correct = option.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      playSound('correct');
      setSelected(option);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      playSound('wrong');
      setRequireHint(true);
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
      setStreak(0);
    }
  };

  const handleWritten = () => {
    if (feedback?.type === 'correct') return;
    const correct = writtenAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      playSound('correct');
      setSelected(writtenAnswer);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      playSound('wrong');
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
      setStreak(0);
    }
  };

  const handleHint = async () => {
    try {
      setShowHint(true);
      setDelayActive(true);
      setTimeout(() => setDelayActive(false), 1000);
      const { data, error } = await supabase
        .from('questions')
        .select('hint')
        .eq('id', currentQuestion.id)
        .single();
      if (error) setHint('Hint not available');
      else setHint(data?.hint || 'No hint available');
    } catch {
      setHint('Hint not available');
    }
  };

  const handleNext = () => {
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
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="text-lg text-gray-600"
      >
        Loading drill...
      </motion.div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="text-lg text-red-600"
      >
        {error}
      </motion.div>
    </div>
  );

  if (completed) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 p-6">
      <motion.div
        className="max-w-md w-full bg-white/90 rounded-2xl shadow-2xl p-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Drill Complete!</h2>
        <p className="text-lg text-gray-700 mb-4">Best streak: <span className="font-bold text-green-600">{bestStreak}</span></p>
        <motion.button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition-all mb-3 w-full"
          whileHover={{ scale: 1.04 }}
          onClick={() => navigate(0)}
        >
          Retry Drill
        </motion.button>
        <motion.button
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition-all w-full"
          whileHover={{ scale: 1.04 }}
          onClick={() => navigate('/lessons')}
        >
          Back to Lessons
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 p-6 flex flex-col items-center justify-center">
      <motion.div
        className="w-full max-w-xl bg-white/90 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-purple-700">Drill: {topic}</h2>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500">Streak</span>
            <span className="text-lg font-bold text-green-600">{streak}</span>
          </div>
        </div>
        <div className="h-3 w-full bg-purple-100 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        </div>
        {currentQuestion && (
          <>
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
                {requireHint && !showHint && (
                  <motion.button
                    onClick={handleHint}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded text-sm font-semibold"
                  >
                    Show Hint
                  </motion.button>
                )}
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
            {currentQuestion.type === 'write' && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                <input
                  type="text"
                  value={writtenAnswer}
                  onChange={e => setWrittenAnswer(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleWritten()}
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
            {(feedback?.type === 'correct') && (
              <div className="flex justify-end items-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleNext}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
                >
                  {currentQ + 1 === questions.length ? 'Finish Drill' : 'Next'}
                </motion.button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Drill;
