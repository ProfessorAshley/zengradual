// src/pages/LessonView.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion } from 'framer-motion';

const LessonView = ({ user }) => {
  const { subject, topic } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [xpEarned, setXpEarned] = useState(false);

  useEffect(() => {
    const getLesson = async () => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('*, questions(*)')
        .eq('subject', subject)
        .eq('topic', topic);

      if (lessons && lessons.length) setLesson(lessons[0]);
    };

    getLesson();
  }, [subject, topic]);

  const handleOptionClick = (option) => {
    setSelected(option);
    const correct = option === lesson.questions[currentQ].answer;
    setFeedback(correct ? 'Correct ✅' : 'Oops! ❌');
  };

  const handleNext = () => {
    if (currentQ + 1 < lesson.questions.length) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  const addXP = async () => {
    if (user && !xpEarned) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('xp')
        .eq('id', user.id)
        .single();

      await supabase
        .from('users')
        .update({ xp: (currentUser?.xp || 0) + 10 })
        .eq('id', user.id);

      setXpEarned(true);
    }
  };

  if (!lesson) return <div className="p-6">Loading lesson...</div>;

  const currentQuestion = lesson.questions[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <motion.div
        className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-purple-800">📚 {lesson.title}</h1>
        <p className="mb-6 text-gray-700 whitespace-pre-line">{lesson.explanation}</p>

        {!completed ? (
          <>
            <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  whileTap={{ scale: 0.98 }}
                  className={`block w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selected === opt ? 'bg-purple-200 border-purple-400' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
            {feedback && <p className="text-sm mb-2 text-gray-600 font-medium">{feedback}</p>}
            <button
              onClick={handleNext}
              disabled={!selected}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {currentQ + 1 === lesson.questions.length ? 'Finish Lesson' : 'Next'}
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Lesson Complete!</h2>
            {!xpEarned ? (
              <button
                onClick={addXP}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                +10 XP
              </button>
            ) : (
              <p className="text-sm text-gray-600">XP added 🎉</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LessonView;