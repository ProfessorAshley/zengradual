import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseclient';

const Lessons = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('subjects')
        .eq('id', user.id)
        .single();

      if (data?.subjects) {
        setSubjects(data.subjects);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, [user.id]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubject) return;

      const { data } = await supabase
        .from('lessons')
        .select('topic')
        .eq('subject', selectedSubject);

      if (data) {
        const uniqueTopics = [...new Set(data.map((lesson) => lesson.topic))];
        setTopics(uniqueTopics);
      }
    };

    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedSubject || !selectedTopic) return;

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, title, desc')
        .eq('subject', selectedSubject)
        .eq('topic', selectedTopic);

      const { data: logs } = await supabase
        .from('lesson_logs')
        .select('lesson')
        .eq('user_id', user.id);

      const completed = logs?.map(log => log.lesson) || [];

      if (lessonData) {
        setLessons(lessonData);
        setCompletedLessons(completed);
      }
    };

    fetchLessons();
  }, [selectedTopic, selectedSubject, user.id]);

  const handleLessonClick = (title) => {
    navigate(`/lessonview/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedTopic)}/${encodeURIComponent(title)}`);
  };

  const getTopicProgress = () => {
    if (!lessons.length) return 0;
    const completed = lessons.filter(lesson => completedLessons.includes(lesson.id));
    return Math.round((completed.length / lessons.length) * 100);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-blue-100 p-8">
      <motion.h1
        className="text-3xl font-bold text-center text-purple-800 mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📘 Lessons
      </motion.h1>

      {!selectedSubject ? (
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {subjects.map((subj, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedSubject(subj.name)}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl font-medium bg-white shadow text-purple-700 hover:bg-purple-200 transition-all"
            >
              {subj.name}
            </motion.button>
          ))}
        </div>
      ) : !selectedTopic ? (
        <>
          <motion.button
            onClick={() => setSelectedSubject(null)}
            className="mb-6 px-4 py-2 rounded-full bg-white text-purple-700 hover:bg-purple-200 shadow transition"
            whileHover={{ scale: 1.05 }}
          >
            ← Back to Subjects
          </motion.button>
          <motion.h2
            className="text-2xl font-semibold text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Topics in {selectedSubject}
          </motion.h2>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedTopic(topic)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic}</h3>
                <p className="text-sm text-gray-500">Explore lessons in this topic</p>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          <motion.button
            onClick={() => setSelectedTopic(null)}
            className="mb-6 px-4 py-2 rounded-full bg-white text-purple-700 hover:bg-purple-200 shadow transition"
            whileHover={{ scale: 1.05 }}
          >
            ← Back to Topics
          </motion.button>
          <motion.h2
            className="text-2xl font-semibold text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Lessons in {selectedTopic}
          </motion.h2>

          <div className="max-w-md mx-auto bg-white rounded-full h-5 mb-8 shadow-inner">
            <div
              className="bg-green-400 h-5 rounded-full transition-all duration-500"
              style={{ width: `${getTopicProgress()}%` }}
            />
          </div>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer ${isCompleted ? 'bg-green-100' : 'bg-white'}`}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleLessonClick(lesson.title)}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{lesson.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{lesson.desc}</p>
                  <p className="text-xs text-gray-400">{isCompleted ? '✅ Completed' : 'Click to start lesson'}</p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Lessons;
