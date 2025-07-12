import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCalendar, FaClock, FaBook, FaMagic, FaSave, FaDownload, FaUpload, FaRepeat, FaStar, FaCheck } from 'react-icons/fa';
import { supabase } from '../supabaseclient';

// Subject topics for revision planning
const subjectTopics = {
  'Maths': [
    'Number and Algebra', 'Geometry and Measures', 'Statistics and Probability',
    'Ratio and Proportion', 'Fractions and Decimals', 'Percentages',
    'Linear Equations', 'Quadratic Equations', 'Trigonometry',
    'Pythagoras Theorem', 'Area and Volume', 'Data Handling',
    'Graphs and Charts', 'Sequences', 'Functions'
  ],
  'English Language': [
    'Reading Comprehension', 'Writing Skills', 'Grammar and Punctuation',
    'Creative Writing', 'Persuasive Writing', 'Descriptive Writing',
    'Text Analysis', 'Language Features', 'Structure and Form',
    'Audience and Purpose', 'Context and Inference', 'Comparative Analysis',
    'Spoken Language', 'Vocabulary Development', 'Proofreading'
  ],
  'English Literature': [
    'Shakespeare Plays', 'Modern Prose', 'Poetry Analysis',
    'Character Analysis', 'Theme Exploration', 'Context and Setting',
    'Language and Structure', 'Form and Genre', 'Historical Context',
    'Critical Perspectives', 'Comparative Essays', 'Unseen Poetry',
    'Drama Analysis', 'Narrative Techniques', 'Literary Devices'
  ],
  'Combined Science': [
    'Biology: Cell Biology', 'Biology: Organisation', 'Biology: Infection and Response',
    'Biology: Bioenergetics', 'Biology: Homeostasis', 'Biology: Inheritance',
    'Biology: Evolution', 'Chemistry: Atomic Structure', 'Chemistry: Bonding',
    'Chemistry: Quantitative Chemistry', 'Chemistry: Chemical Changes',
    'Chemistry: Energy Changes', 'Chemistry: Rate of Reaction',
    'Physics: Forces', 'Physics: Energy', 'Physics: Waves',
    'Physics: Electricity', 'Physics: Magnetism', 'Physics: Particle Model'
  ],
  'Triple Science': [
    'Biology: Cell Biology', 'Biology: Organisation', 'Biology: Infection and Response',
    'Biology: Bioenergetics', 'Biology: Homeostasis', 'Biology: Inheritance',
    'Biology: Evolution', 'Biology: Ecology', 'Biology: Human Biology',
    'Chemistry: Atomic Structure', 'Chemistry: Bonding', 'Chemistry: Quantitative Chemistry',
    'Chemistry: Chemical Changes', 'Chemistry: Energy Changes', 'Chemistry: Rate of Reaction',
    'Chemistry: Organic Chemistry', 'Chemistry: Chemical Analysis', 'Chemistry: Chemistry of Atmosphere',
    'Physics: Forces', 'Physics: Energy', 'Physics: Waves', 'Physics: Electricity',
    'Physics: Magnetism', 'Physics: Particle Model', 'Physics: Atomic Structure',
    'Physics: Space Physics'
  ]
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

const Timetable = () => {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [userSubjects, setUserSubjects] = useState([]);
  const [autoGenerateSettings, setAutoGenerateSettings] = useState({
    focusSubject: '',
    studyHours: 2,
    examDate: new Date(new Date().getFullYear() + 1, 6, 1).toISOString().split('T')[0] // July 1st next year
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('timetableEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }, [events]);

  // Fetch user subjects
  useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('subjects')
            .eq('id', user.id)
            .single();
          
          if (data && data.subjects) {
            setUserSubjects(data.subjects.filter(subj => subj.name));
          }
        }
      } catch (error) {
        console.error('Error fetching user subjects:', error);
      }
    };

    fetchUserSubjects();
  }, []);

  const handleAddEvent = () => {
    if (selectedSlot && selectedSubject) {
      const newEvent = {
        ...selectedSlot,
        subject: selectedSubject,
        topic: selectedTopic,
        repeat: repeatEvent,
        repeatUntil: repeatUntil || null
      };

      setEvents([...events, newEvent]);
      setSelectedSlot(null);
      setSelectedSubject('');
      setSelectedTopic('');
      setRepeatEvent(false);
      setRepeatUntil('');
    }
  };

  const handleDeleteEvent = (day, hour, date) => {
    setEvents(events.filter(e => !(e.day === day && e.hour === hour && e.date === date)));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      if (event.date === date) return true;
      if (event.repeat && event.repeatUntil) {
        const eventDate = new Date(event.date);
        const repeatUntil = new Date(event.repeatUntil);
        const checkDate = new Date(date);
        return checkDate >= eventDate && checkDate <= repeatUntil && 
               checkDate.getDay() === eventDate.getDay();
      }
      return false;
    });
  };

  const autoGenerateTimetable = () => {
    if (!autoGenerateSettings.focusSubject) return;

    const newEvents = [];
    const examDate = new Date(autoGenerateSettings.examDate);
    const today = new Date();
    const weeksUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24 * 7));
    
    // Get topics for the focus subject
    const topics = subjectTopics[autoGenerateSettings.focusSubject] || [];
    const totalTopics = topics.length;
    const topicsPerWeek = Math.ceil(totalTopics / weeksUntilExam);

    // Generate study sessions
    let topicIndex = 0;
    let currentDate = new Date(today);
    
    while (currentDate < examDate && topicIndex < totalTopics) {
      // Add 2-3 sessions per week
      for (let session = 0; session < Math.min(3, topicsPerWeek); session++) {
        if (topicIndex >= totalTopics) break;
        
        // Choose a random day (Monday-Friday)
        const randomDay = days[Math.floor(Math.random() * 5)];
        const randomHour = hours[Math.floor(Math.random() * 8) + 2]; // 10:00-17:00
        
        newEvents.push({
          day: randomDay,
          hour: randomHour,
          date: currentDate.toISOString().split('T')[0],
          subject: autoGenerateSettings.focusSubject,
          topic: topics[topicIndex],
          repeat: false,
          repeatUntil: null
        });
        
        topicIndex++;
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    setEvents([...events, ...newEvents]);
    setShowAutoGenerate(false);
  };

  const exportTimetable = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timetable-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTimetable = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedEvents = JSON.parse(e.target.result);
          setEvents(importedEvents);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearTimetable = () => {
    if (window.confirm('Are you sure you want to clear all events?')) {
      setEvents([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FaCalendar className="text-yellow-400" />
            Study Timetable
            <FaCalendar className="text-yellow-400" />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Plan your revision journey to exam success
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowAutoGenerate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <FaMagic />
            Auto-Generate
          </button>
          
          <button
            onClick={exportTimetable}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
          >
            <FaDownload />
            Export
          </button>
          
          <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 cursor-pointer">
            <FaUpload />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importTimetable}
              className="hidden"
            />
          </label>
          
          <button
            onClick={clearTimetable}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
          >
            <FaTrash />
            Clear All
          </button>
        </motion.div>

        {/* Timetable */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Weekly Schedule</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-white/10 p-3 text-left text-white font-semibold">Time</th>
                  {days.map(day => (
                    <th key={day} className="bg-white/10 p-3 text-left text-white font-semibold">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="bg-white/5 p-2 font-semibold text-white border-b border-white/10">{hour}</td>
                    {days.map(day => {
                      const dayEvents = getEventsForDate(currentDate.toISOString().split('T')[0])
                        .filter(e => e.day === day && e.hour === hour);
                      
                      return (
                        <td
                          key={day + hour}
                          className="p-2 border-b border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                          onClick={() => setSelectedSlot({ day, hour, date: currentDate.toISOString().split('T')[0] })}
                        >
                          <AnimatePresence>
                            {dayEvents.map((event, index) => (
                              <motion.div
                                key={`${event.subject}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg shadow mb-1 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteEvent(day, hour, event.date);
                                }}
                              >
                                <div className="font-semibold">{event.subject}</div>
                                {event.topic && (
                                  <div className="text-xs opacity-90">{event.topic}</div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Event Modal */}
        {selectedSlot && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-96 max-w-[90vw]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Study Session</h3>
              <p className="text-gray-600 mb-4">{selectedSlot.day} at {selectedSlot.hour}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                  >
                    <option value="">Select a subject</option>
                    {userSubjects.map(subj => (
                      <option key={subj.name} value={subj.name}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                {selectedSubject && subjectTopics[selectedSubject] && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Topic (Optional)</label>
                    <select
                      value={selectedTopic}
                      onChange={e => setSelectedTopic(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                    >
                      <option value="">Select a topic</option>
                      {subjectTopics[selectedSubject].map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="repeat"
                    checked={repeatEvent}
                    onChange={e => setRepeatEvent(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="repeat" className="text-sm text-gray-700">Repeat weekly</label>
                </div>

                {repeatEvent && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat until</label>
                    <input
                      type="date"
                      value={repeatUntil}
                      onChange={e => setRepeatUntil(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Add Session
                  </button>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Auto-Generate Modal */}
        {showAutoGenerate && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-96 max-w-[90vw]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMagic className="text-purple-500" />
                Auto-Generate Timetable
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Focus Subject</label>
                  <select
                    value={autoGenerateSettings.focusSubject}
                    onChange={e => setAutoGenerateSettings({
                      ...autoGenerateSettings,
                      focusSubject: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                  >
                    <option value="">Select a subject</option>
                    {userSubjects.map(subj => (
                      <option key={subj.name} value={subj.name}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Study Hours per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={autoGenerateSettings.studyHours}
                    onChange={e => setAutoGenerateSettings({
                      ...autoGenerateSettings,
                      studyHours: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={autoGenerateSettings.examDate}
                    onChange={e => setAutoGenerateSettings({
                      ...autoGenerateSettings,
                      examDate: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={autoGenerateTimetable}
                    disabled={!autoGenerateSettings.focusSubject}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate Timetable
                  </button>
                  <button
                    onClick={() => setShowAutoGenerate(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
