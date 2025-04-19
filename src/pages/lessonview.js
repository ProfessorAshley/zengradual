import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';

const LessonView = ({ user }) => {
  const { subject, topic, title } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [xpAdded, setXpAdded] = useState(false);
  const [firstTime, setFirstTime] = useState(true);

  const correctSound = new Audio('/sounds/correct.mp3');
  const wrongSound = new Audio('/sounds/wrong.mp3');
  const xpSound = new Audio('/sounds/xp.mp3');

  useEffect(() => {
    const fetchData = async () => {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject', subject)
        .eq('topic', topic)
        .eq('title', title)
        .single();

      if (!lessonData) return;
      setLesson(lessonData);

      const { data: allQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', lessonData.id);

      const groupedByNumber = {};
      allQuestions.forEach(q => {
        if (!groupedByNumber[q.number]) groupedByNumber[q.number] = [];
        groupedByNumber[q.number].push(q);
      });

      const selectedQuestions = Object.values(groupedByNumber).map(group => group[Math.floor(Math.random() * group.length)]);
      selectedQuestions.sort((a, b) => a.number - b.number);

      setQuestions(selectedQuestions);

      const { data: log } = await supabase
        .from('lesson_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson', lessonData.id);

      setFirstTime(log.length === 0);
    };

    fetchData();
  }, [subject, topic, title, user.id]);

  if (!lesson || questions.length === 0) return <div className="p-6">Loading lesson...</div>;

  const currentQuestion = questions[currentQ];
  const progressPercent = ((currentQ + 1) / questions.length) * 100;

  const awardXP = () => {
    const amount = firstTime ? 3 : 1;
    setEarnedXP(prev => prev + amount);
    xpSound.play();
  };

  const handleMultipleChoice = (option) => {
    if (feedback?.type === 'correct') return;
    const correct = option.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      correctSound.play();
      awardXP();
      setSelected(option);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      wrongSound.play();
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  const handleWritten = () => {
    if (feedback?.type === 'correct') return;
    const correct = writtenAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    if (correct) {
      correctSound.play();
      awardXP();
      setSelected(writtenAnswer);
      setFeedback({ type: 'correct', msg: 'Correct! 🎉' });
    } else {
      wrongSound.play();
      setFeedback({ type: 'incorrect', msg: 'Try again ❌' });
    }
  };

  const handleNext = () => {
    setSelected(null);
    setWrittenAnswer('');
    setFeedback(null);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
    }
  };

  const addXP = async () => {
    if (!user || xpAdded) return;

    const bonus = firstTime ? 30 : 0;
    const totalXP = earnedXP + bonus;

    const { data: userData } = await supabase
      .from('users')
      .select('xp')
      .eq('id', user.id)
      .single();

    await supabase
      .from('users')
      .update({ xp: (userData?.xp || 0) + totalXP })
      .eq('id', user.id);

    await supabase
      .from('lesson_logs')
      .insert([{ user_id: user.id, xp: totalXP, lesson: lesson.id }]);

    setXpAdded(true);
    correctSound.play();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <motion.div
        className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-2 text-purple-800">📘 {lesson.title}</h1>
        <p className="mb-6 text-gray-700 whitespace-pre-line">{lesson.explanation}</p>

        {!completed ? (
          <>
            {currentQuestion.type === 'text' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 whitespace-pre-line">{currentQuestion.question}</p>
              </div>
            )}

            {currentQuestion.type === 'multiple' && (
              <div className="space-y-2 mb-4">
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                {currentQuestion.options.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleMultipleChoice(opt)}
                    whileTap={{ scale: 0.97 }}
                    className={`block w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selected === opt ?
                        feedback?.type === 'correct' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'write' && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                <input
                  type="text"
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />
                <button
                  onClick={handleWritten}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

            {(feedback?.type === 'correct' || currentQuestion.type === 'text') && (
              <div className="flex justify-between items-center">
                <button
                  onClick={handleNext}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
                >
                  {currentQ + 1 === questions.length ? 'Finish Lesson' : 'Next'}
                </button>
                <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
                  <motion.div
                    key={earnedXP}
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: [1.2, 1], opacity: [1, 1], boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 15px rgba(34,197,94,0.5)'] }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-md"
                  >
                    +{earnedXP} XP
                  </motion.div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Lesson Complete!</h2>
            <p className="text-lg text-gray-700 mb-2">You earned <strong>{earnedXP + (firstTime ? 30 : 0)}</strong> XP!</p>
            {!xpAdded ? (
              <button
                onClick={addXP}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Collect +{earnedXP + (firstTime ? 30 : 0)} XP
              </button>
            ) : (
              <p className="text-sm text-gray-600 mb-4">XP added 🎉</p>
            )}
            <button
              onClick={() => navigate('/lessons')}
              className="mt-4 text-purple-600 underline"
            >
              ← Back to Lessons
            </button>
          </div>
        )}

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