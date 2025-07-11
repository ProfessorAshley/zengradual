import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseclient';
import { FaBolt, FaChevronDown, FaCalculator, FaChartLine, FaEquals, FaShapes } from 'react-icons/fa';

const Lessons = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicProgress, setTopicProgress] = useState({}); // { topic: { total, completed } }
  const [drillModal, setDrillModal] = useState({ open: false, topic: null });
  const [drillCount, setDrillCount] = useState(5);
  // Add sorting and filtering state
  const [sortOrder, setSortOrder] = useState('alphabetical'); // 'alphabetical', 'completed', 'incomplete'
  const [showCompleted, setShowCompleted] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);
  // Add category state
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['all']); // Multiple selection
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
    // When subject changes, fetch all topics and their progress
    const fetchTopicsAndProgress = async () => {
      if (!selectedSubject) return;
      // Fetch all lessons for the subject
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, topic')
        .eq('subject', selectedSubject);
      if (!lessonsData) return;
      // Get unique topics
      const uniqueTopics = [...new Set(lessonsData.map((lesson) => lesson.topic))];
      setTopics(uniqueTopics);
      // For each topic, calculate progress
      const progress = {};
      for (const topic of uniqueTopics) {
        const topicLessons = lessonsData.filter(l => l.topic === topic);
        // Fetch completed lessons for this topic
        const { data: logs } = await supabase
          .from('lesson_logs')
          .select('lesson')
          .eq('user_id', user.id);
        const completed = logs?.map(log => log.lesson) || [];
        const completedCount = topicLessons.filter(l => completed.includes(l.id)).length;
        progress[topic] = { total: topicLessons.length, completed: completedCount };
      }
      setTopicProgress(progress);
    };
    fetchTopicsAndProgress();
  }, [selectedSubject, user.id]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedSubject || !selectedTopic) return;

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, title, desc, categories')
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
        
        // Extract unique categories
        const allCategories = lessonData
          .map(lesson => {
            // Handle different possible formats of categories
            if (!lesson.categories) return [];
            if (Array.isArray(lesson.categories)) {
              return lesson.categories.filter(cat => typeof cat === 'string' && cat.trim());
            }
            if (typeof lesson.categories === 'string') {
              // If it's a JSON string, try to parse it
              try {
                const parsed = JSON.parse(lesson.categories);
                return Array.isArray(parsed) ? parsed.filter(cat => typeof cat === 'string' && cat.trim()) : [];
              } catch {
                // If parsing fails, treat as single category
                return lesson.categories.trim() ? [lesson.categories.trim()] : [];
              }
            }
            return [];
          })
          .flat()
          .filter((cat, index, arr) => arr.indexOf(cat) === index);
        console.log('Extracted categories:', allCategories); // Debug log
        console.log('Lesson data:', lessonData); // Debug log
        console.log('Raw categories from lessons:', lessonData.map(l => ({ id: l.id, title: l.title, categories: l.categories, type: typeof l.categories }))); // Debug log
        setCategories(allCategories); // Don't add 'all' here, handle it separately
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

  const handleDrillStart = () => {
    if (drillModal.topic && drillCount > 0) {
      navigate(`/drill/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(drillModal.topic)}/${drillCount}`);
      setDrillModal({ open: false, topic: null });
    }
  };

  // Add sorting and filtering logic
  const getFilteredAndSortedLessons = () => {
    let filtered = [...lessons];
    console.log('Initial lessons:', lessons.length);
    console.log('Selected categories:', selectedCategories);
    
    // Apply category filter
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(lesson => {
        if (!lesson.categories) return false;
        
        // Handle different category formats
        let lessonCategories = [];
        if (Array.isArray(lesson.categories)) {
          lessonCategories = lesson.categories.filter(cat => typeof cat === 'string');
        } else if (typeof lesson.categories === 'string') {
          try {
            const parsed = JSON.parse(lesson.categories);
            lessonCategories = Array.isArray(parsed) ? parsed.filter(cat => typeof cat === 'string') : [];
          } catch {
            lessonCategories = lesson.categories.trim() ? [lesson.categories.trim()] : [];
          }
        }
        
        return lessonCategories.some(cat => selectedCategories.includes(cat));
      });
      console.log('After category filter:', filtered.length);
    }
    
    // Apply completion filter (simplified to just "all" vs "incomplete")
    if (!showCompleted) {
      filtered = filtered.filter(lesson => !completedLessons.includes(lesson.id));
      console.log('After completion filter:', filtered.length);
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'completed':
        return filtered.sort((a, b) => {
          const aCompleted = completedLessons.includes(a.id);
          const bCompleted = completedLessons.includes(b.id);
          return bCompleted - aCompleted; // Completed first
        });
      case 'incomplete':
        return filtered.sort((a, b) => {
          const aCompleted = completedLessons.includes(a.id);
          const bCompleted = completedLessons.includes(b.id);
          return aCompleted - bCompleted; // Incomplete first
        });
      default:
        return filtered;
    }
  };

  const handleCategoryToggle = (category) => {
    if (category === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.filter(c => c !== 'all');
        if (prev.includes(category)) {
          const filtered = newSelection.filter(c => c !== category);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newSelection, category];
        }
      });
    }
  };

  // Category configuration with colors and icons
  const categoryConfig = {
    'BODMAS': { color: 'bg-orange-500', textColor: 'text-white', icon: FaCalculator },
    'Standard Form': { color: 'bg-blue-500', textColor: 'text-white', icon: FaChartLine },
    'Algebra': { color: 'bg-green-500', textColor: 'text-white', icon: FaEquals },
    'Geometry': { color: 'bg-red-500', textColor: 'text-white', icon: FaShapes },
    'default': { color: 'bg-purple-500', textColor: 'text-white', icon: null }
  };

  const getCategoryConfig = (category) => {
    return categoryConfig[category] || categoryConfig.default;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="text-lg text-gray-600"
      >
        Loading...
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedSubject + '-' + selectedTopic}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 p-0 sm:p-8 flex flex-col"
      >
        {/* Gradient Header Bar */}
        <div className="w-full bg-gradient-to-r from-purple-400/80 via-blue-400/70 to-pink-400/80 py-8 rounded-b-3xl shadow-lg mb-8">
          <motion.h1
            className="text-4xl font-extrabold text-center text-white drop-shadow mb-2 tracking-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            📘 Lessons
          </motion.h1>
          <p className="text-center text-purple-100 text-lg font-medium">Explore, track, and master your topics</p>
        </div>

        <div className="flex-1 w-full max-w-7xl mx-auto">
          {!selectedSubject ? (
            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-10"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {subjects.map((subj, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedSubject(subj.name)}
                  whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(128,0,128,0.10)' }}
                  className="px-8 py-5 rounded-2xl font-semibold bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 shadow-lg text-purple-800 hover:bg-purple-100 transition-all text-lg border border-purple-100 backdrop-blur-md"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.7, ease: 'easeInOut' }}
                >
                  {subj.name}
                </motion.button>
              ))}
            </motion.div>
          ) : !selectedTopic ? (
            <>
              <motion.button
                onClick={() => setSelectedSubject(null)}
                className="mb-6 px-4 py-2 rounded-full bg-white/80 text-purple-700 hover:bg-purple-200 shadow transition"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                ← Back to Subjects
              </motion.button>
              <motion.h2
                className="text-2xl font-semibold text-center mb-6 text-purple-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeInOut' }}
              >
                Topics in {selectedSubject}
              </motion.h2>
              <motion.div
                className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 max-w-5xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09 } },
                }}
              >
                {topics.map((topic, index) => {
                  const progress = topicProgress[topic] || { total: 0, completed: 0 };
                  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
                  return (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-7 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-purple-100 relative group backdrop-blur-md"
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.09, duration: 0.7, ease: 'easeInOut' }}
                      onClick={() => setSelectedTopic(topic)}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-between">
                        {topic}
                        <span className="ml-2 text-xs font-medium text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                          {progress.completed}/{progress.total}
                        </span>
                      </h3>
                      <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.7, ease: 'easeInOut' }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{percent}% complete</p>
                      <p className="text-xs text-gray-400 mb-3">Explore lessons in this topic</p>
                      {/* Drill Button - bottom right, less obtrusive */}
                      <motion.button
                        className="absolute bottom-4 right-4 bg-blue-500/80 hover:bg-blue-600 text-white text-lg p-2 rounded-full shadow transition-all flex items-center justify-center group/drill"
                        whileHover={{ scale: 1.12 }}
                        onClick={e => { e.stopPropagation(); setDrillModal({ open: true, topic }); }}
                        title="Start Drill"
                        aria-label="Start Drill"
                      >
                        <FaBolt />
                        <span className="absolute opacity-0 group-hover/drill:opacity-100 bg-gray-900 text-white text-xs rounded px-2 py-1 left-0 -translate-x-full ml-2 transition-opacity duration-200 pointer-events-none">Drill</span>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => setSelectedTopic(null)}
                className="mb-6 px-4 py-2 rounded-full bg-white/80 text-purple-700 hover:bg-purple-200 shadow transition"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                ← Back to Topics
              </motion.button>
              <motion.h2
                className="text-2xl font-semibold text-center mb-4 text-purple-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeInOut' }}
              >
                Lessons in {selectedTopic}
              </motion.h2>

              <div className="max-w-md mx-auto bg-white/80 rounded-full h-5 mb-8 shadow-inner">
                <motion.div
                  className="bg-green-400 h-5 rounded-full transition-all duration-700"
                  style={{ width: `${getTopicProgress()}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getTopicProgress()}%` }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </div>

              {/* Sorting and Filtering Controls */}
              <motion.div
                className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-white/95 to-purple-50/95 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-purple-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: 'easeInOut' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-6">
                  {/* Sort Order */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Sort by:</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm cursor-pointer min-w-[140px]"
                      >
                        <span className="truncate">
                          {sortOrder === 'alphabetical' ? 'Alphabetical' : 
                           sortOrder === 'completed' ? 'Completed First' : 'Incomplete First'}
                        </span>
                        <FaChevronDown className={`text-purple-400 text-xs transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showSortDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-purple-200 z-10 overflow-hidden"
                          >
                            {[
                              { value: 'alphabetical', label: 'Alphabetical' },
                              { value: 'completed', label: 'Completed First' },
                              { value: 'incomplete', label: 'Incomplete First' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => { setSortOrder(option.value); setShowSortDropdown(false); }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-purple-50 transition-colors ${
                                  sortOrder === option.value ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Categories:</label>
                    <div className="flex flex-wrap gap-2">
                      {/* Toggle All Button */}
                      <button
                        onClick={() => handleCategoryToggle('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          selectedCategories.includes('all')
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        All Categories
                      </button>
                      
                      {/* Category Buttons */}
                      {categories.length > 0 ? (
                        categories.map((category) => {
                          // Safety check - only render if category is a string
                          if (typeof category !== 'string') {
                            console.warn('Non-string category found:', category);
                            return null;
                          }
                          
                          const config = getCategoryConfig(category);
                          const IconComponent = config.icon;
                          const isSelected = selectedCategories.includes(category);
                          
                          return (
                            <button
                              key={category}
                              onClick={() => handleCategoryToggle(category)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                isSelected
                                  ? `${config.color} ${config.textColor} shadow-md`
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {IconComponent && <IconComponent className="text-xs" />}
                              {category}
                            </button>
                          );
                        }).filter(Boolean) // Remove any null values
                      ) : (
                        <span className="text-xs text-gray-500 italic">No categories found</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Filter Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Show All:</label>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                        showCompleted ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          showCompleted ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 max-w-5xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09 } },
                }}
              >
                {getFilteredAndSortedLessons().length > 0 ? (
                  getFilteredAndSortedLessons().map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <motion.div
                        key={lesson.id}
                        className={`p-6 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white/80 border-purple-100'} backdrop-blur-md`}
                        whileHover={{ scale: 1.03 }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.09, duration: 0.7, ease: 'easeInOut' }}
                        onClick={() => handleLessonClick(lesson.title)}
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{lesson.desc}</p>
                        <p className="text-xs text-gray-400">{isCompleted ? '✅ Completed' : 'Click to start lesson'}</p>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-gray-500 text-lg mb-2">No lessons found</div>
                    <div className="text-sm text-gray-400">Try adjusting your filters or check if lessons exist for this topic.</div>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
      {/* Drill Modal */}
      {drillModal.open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setDrillModal({ open: false, topic: null })}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-700">Start Drill for {drillModal.topic}</h2>
            <label className="block mb-2 text-gray-600">Number of Questions: <span className='font-bold text-purple-700'>{drillCount}</span></label>
            <input
              type="range"
              min={1}
              max={topicProgress[drillModal.topic]?.total || 20}
              value={drillCount}
              onChange={e => setDrillCount(Number(e.target.value))}
              className="w-full mb-6 accent-blue-500"
            />
            <label className="block mb-2 text-gray-600">Difficulty (coming soon):</label>
            <input
              type="range"
              min={1}
              max={3}
              value={2}
              disabled
              className="w-full mb-6 accent-purple-400 cursor-not-allowed"
            />
            <motion.button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition-all w-full"
              whileHover={{ scale: 1.04 }}
              onClick={handleDrillStart}
            >
              Start Drill
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lessons;
