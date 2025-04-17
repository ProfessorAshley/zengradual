import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseclient';

const Lessons = ({ user }) => {
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  console.log(user)
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

      const { data, error } = await supabase
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

  const handleLessonClick = (topic) => {
    navigate(`/lesson/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(topic)}`);
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
              className="px-4 py-2 rounded-full font-medium bg-white shadow text-purple-700 hover:bg-purple-200 transition-all"
            >
              {subj.name}
            </motion.button>
          ))}
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedSubject(null);
              setSelectedTopic(null);
            }}
            className="text-sm text-purple-600 underline mb-6"
          >
            ← Back to Subjects
          </button>

          <motion.h2
            className="text-2xl font-semibold text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Topics for {selectedSubject}
          </motion.h2>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ scale: 1.03 }}
                onClick={() => handleLessonClick(topic)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{topic}</h3>
                <p className="text-sm text-gray-500">Start learning this topic with interactive questions!</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Lessons;
