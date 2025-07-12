import React, { useEffect, useState } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { supabase } from '../supabaseclient';
import { 
  FaPlus, 
  FaSave, 
  FaTrash, 
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaBars,
  FaEdit,
  FaFolder,
  FaBook,
  FaTag,
  FaLightbulb,
  FaExclamationTriangle,
  FaSortNumericDown,
  FaChevronRight,
  FaImage
} from 'react-icons/fa';

const questionTypes = [
  { id: 'multiple', name: 'Multiple Choice', icon: '🔘' },
  { id: 'write', name: 'Write Answer', icon: '✍️' },
  { id: 'text', name: 'Text Response', icon: '📝' }
];

const difficultyLevels = [
  { id: 'NONE', name: 'No Difficulty', color: 'bg-gray-500' },
  { id: 'EASY', name: 'Easy', color: 'bg-green-500' },
  { id: 'MEDIUM', name: 'Medium', color: 'bg-yellow-500' },
  { id: 'HARD', name: 'Hard', color: 'bg-red-500' },
  { id: 'EXAM', name: 'Exam Level', color: 'bg-purple-500' }
];

const Admin = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, type: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Lesson management states
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    desc: '',
    subject: '',
    topic: '',
    categories: [],
    diff: 'NONE'
  });

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('lessons').select('*').order('title');
      if (error) throw error;
      setLessons(data || []);
      
      // Extract unique subjects and topics
      const uniqueSubjects = [...new Set(data?.map(lesson => lesson.subject).filter(Boolean) || [])];
      const uniqueTopics = [...new Set(data?.map(lesson => lesson.topic).filter(Boolean) || [])];
      setSubjects(uniqueSubjects);
      setTopics(uniqueTopics);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (lessonId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('number');
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      fetchQuestions(selectedLesson.id);
    }
  }, [selectedLesson]);

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const saveQuestions = async () => {
    setIsLoading(true);
    try {
    for (const q of questions) {
      const questionToSave = {
        lesson_id: selectedLesson.id,
        ...q,
      };

      if (q.id) {
          const { error } = await supabase.from('questions').update(questionToSave).eq('id', q.id);
          if (error) throw error;
      } else {
          const { error } = await supabase.from('questions').insert([questionToSave]);
          if (error) throw error;
        }
      }
      
      setSaveStatus({ show: true, type: 'success', message: 'Questions saved successfully!' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
      fetchQuestions(selectedLesson.id);
    } catch (error) {
      console.error('Error saving questions:', error);
      setSaveStatus({ show: true, type: 'error', message: 'Error saving questions. Please try again.' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestionNumber = questions.length > 0 ? Math.max(...questions.map(q => q.number || 0)) + 1 : 1;
    setQuestions([...questions, { 
      type: 'multiple', 
      number: newQuestionNumber, 
      question: '', 
      options: '["Option 1", "Option 2", "Option 3", "Option 4"]', 
      answer: '',
      hint: '',
      image: ''
    }]);
  };

  const deleteQuestion = async (questionId) => {
    if (!questionId) {
      // Remove from local state if it's a new question
      setQuestions(questions.filter((_, index) => index !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      return;
    }

    try {
      const { error } = await supabase.from('questions').delete().eq('id', questionId);
      if (error) throw error;
      fetchQuestions(selectedLesson.id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    const updated = [...questions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // Update question numbers
    updated.forEach((q, index) => {
      q.number = index + 1;
    });
    setQuestions(updated);
  };

  // Multiple choice options management
  const addChoice = (questionIndex) => {
    const question = questions[questionIndex];
    let options = [];
    try {
      options = JSON.parse(question.options || '[]');
    } catch {
      options = [];
    }
    options.push(`Option ${options.length + 1}`);
    
    updateQuestion(questionIndex, 'options', JSON.stringify(options));
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    const question = questions[questionIndex];
    let options = [];
    try {
      options = JSON.parse(question.options || '[]');
    } catch {
      options = [];
    }
    options.splice(choiceIndex, 1);
    
    updateQuestion(questionIndex, 'options', JSON.stringify(options));
  };

  const updateChoice = (questionIndex, choiceIndex, value) => {
    const question = questions[questionIndex];
    let options = [];
    try {
      options = JSON.parse(question.options || '[]');
    } catch {
      options = [];
    }
    options[choiceIndex] = value;
    
    updateQuestion(questionIndex, 'options', JSON.stringify(options));
  };

  // Question collapse state
  const [collapsedQuestions, setCollapsedQuestions] = useState(new Set());

  const toggleQuestionCollapse = (questionIndex) => {
    setCollapsedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  // Check for question number conflicts
  const getQuestionConflicts = () => {
    const numberCounts = {};
    questions.forEach((q, index) => {
      if (!numberCounts[q.number]) numberCounts[q.number] = [];
      numberCounts[q.number].push(index);
    });
    
    return Object.entries(numberCounts)
      .filter(([number, indices]) => indices.length > 1)
      .map(([number, indices]) => ({
        number: parseInt(number),
        questions: indices.map(i => ({ index: i, question: questions[i] }))
      }));
  };

  // Lesson management functions
  const createLesson = async () => {
    if (!lessonForm.title || !lessonForm.subject || !lessonForm.topic) {
      setSaveStatus({ show: true, type: 'error', message: 'Please fill in all required fields.' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
      return;
    }

    try {
      const lessonData = {
        title: lessonForm.title,
        desc: lessonForm.desc,
        subject: lessonForm.subject,
        topic: lessonForm.topic,
        categories: lessonForm.categories,
        diff: lessonForm.diff
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);
        if (error) throw error;
        setSaveStatus({ show: true, type: 'success', message: 'Lesson updated successfully!' });
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([lessonData]);
        if (error) throw error;
        setSaveStatus({ show: true, type: 'success', message: 'Lesson created successfully!' });
      }

      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
      setShowLessonForm(false);
      setEditingLesson(null);
      setLessonForm({ title: '', desc: '', subject: '', topic: '', categories: [], diff: 'NONE' });
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setSaveStatus({ show: true, type: 'error', message: 'Error saving lesson. Please try again.' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      // First delete all questions for this lesson
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('lesson_id', lessonId);
      
      if (questionsError) throw questionsError;

      // Then delete the lesson
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;

      setSaveStatus({ show: true, type: 'success', message: 'Lesson deleted successfully!' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
      fetchLessons();
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setSaveStatus({ show: true, type: 'error', message: 'Error deleting lesson. Please try again.' });
      setTimeout(() => setSaveStatus({ show: false, type: '', message: '' }), 3000);
    }
  };

  const editLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      desc: lesson.desc || '',
      subject: lesson.subject,
      topic: lesson.topic,
      categories: Array.isArray(lesson.categories) ? lesson.categories : 
                 typeof lesson.categories === 'string' ? [lesson.categories] : [],
      diff: lesson.diff || 'NONE'
    });
    setShowLessonForm(true);
  };

  const addCategory = (category) => {
    if (category && !lessonForm.categories.includes(category)) {
      setLessonForm(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  const removeCategory = (categoryToRemove) => {
    setLessonForm(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  const filteredQuestions = filterType ? questions.filter((q) => q.type === filterType) : questions;

  const getQuestionTypeIcon = (type) => {
    return questionTypes.find(t => t.id === type)?.icon || '❓';
  };

  const getQuestionTypeName = (type) => {
    return questionTypes.find(t => t.id === type)?.name || type;
  };

  const getDifficultyColor = (diff) => {
    return difficultyLevels.find(d => d.id === diff)?.color || 'bg-gray-500';
  };

  const getDifficultyName = (diff) => {
    return difficultyLevels.find(d => d.id === diff)?.name || 'Unknown';
  };

  const filteredLessons = lessons.filter(lesson => {
    if (selectedSubject && lesson.subject !== selectedSubject) return false;
    if (selectedTopic && lesson.topic !== selectedTopic) return false;
    return true;
  });

  const questionConflicts = getQuestionConflicts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🛠️ Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage lessons and questions</p>
            </div>
            {saveStatus.show && (
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                saveStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {saveStatus.type === 'success' ? (
                  <FaCheck className="w-5 h-5" />
                ) : (
                  <FaTimes className="w-5 h-5" />
                )}
                {saveStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Management Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">📚 Lesson Management</h2>
                <p className="text-blue-100 mt-1">Create, edit, and organize lessons</p>
              </div>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setLessonForm({ title: '', desc: '', subject: '', topic: '', categories: [], diff: 'NONE' });
                  setShowLessonForm(true);
                }}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
              >
                <FaPlus className="w-4 h-4" />
                Add New Lesson
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Topics</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedTopic('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(lesson.diff || 'NONE')}`}>
                          {getDifficultyName(lesson.diff || 'NONE')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaBook className="w-4 h-4" />
                          {lesson.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaFolder className="w-4 h-4" />
                          {lesson.topic}
                        </span>
                        {lesson.desc && (
                          <span className="text-gray-500">{lesson.desc}</span>
                        )}
                      </div>
                      {lesson.categories && lesson.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(lesson.categories) ? lesson.categories.map((cat, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              <FaTag className="w-3 h-3" />
                              {cat}
                            </span>
                          )) : (
                            <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              <FaTag className="w-3 h-3" />
                              {lesson.categories}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLesson(lesson)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage questions"
                      >
                        <FaBars className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => editLesson(lesson)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit lesson"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(lesson.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete lesson"
                      >
                        <FaTrash className="w-5 h-5" />
          </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLessons.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No lessons found</h3>
                  <p className="text-gray-500">Create your first lesson to get started!</p>
                </div>
              )}
            </div>
          </div>
      </div>

        {/* Question Management Section */}
      {selectedLesson && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Lesson Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-purple-100 mt-1">Manage questions for this lesson</p>
                </div>
                
            <Listbox value={filterType} onChange={setFilterType}>
                  <div className="relative w-48">
                    <Listbox.Button className="w-full rounded-lg bg-white/20 backdrop-blur-sm py-3 px-4 text-left text-white border border-white/30 hover:bg-white/30 transition-all">
                      <span className="block truncate">
                        {filterType ? `Filter: ${getQuestionTypeName(filterType)}` : 'Show All Types'}
                      </span>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-white shadow-xl border border-gray-200 z-20">
                        <Listbox.Option value="" className="cursor-pointer hover:bg-purple-50 px-4 py-3 text-gray-700">
                          Show All Types
                        </Listbox.Option>
                    {questionTypes.map((type) => (
                      <Listbox.Option
                            key={type.id}
                            value={type.id}
                            className="cursor-pointer hover:bg-purple-50 px-4 py-3 text-gray-700 flex items-center gap-2"
                          >
                            <span>{type.icon}</span>
                            {type.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
            </div>

            {/* Questions Section */}
            <div className="p-6">
              {/* Question Conflicts Warning */}
              {questionConflicts.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Question Order Conflicts</h3>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    Multiple questions have the same order number. A random question will be chosen during the lesson.
                  </p>
                  {questionConflicts.map((conflict, idx) => (
                    <div key={idx} className="bg-yellow-100 p-3 rounded-lg mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FaSortNumericDown className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Order #{conflict.number}</span>
                      </div>
                      <div className="space-y-1">
                        {conflict.questions.map((q, qIdx) => (
                          <div key={qIdx} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                            Question {q.index + 1}: {q.question.question || 'No question text'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleQuestionCollapse(idx)}
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title={collapsedQuestions.has(idx) ? "Expand question" : "Collapse question"}
                          >
                            {collapsedQuestions.has(idx) ? (
                              <FaChevronRight className="w-4 h-4" />
                            ) : (
                              <FaChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                            <span className="text-sm font-medium text-gray-600">#{q.number}</span>
                            <span className="text-lg">{getQuestionTypeIcon(q.type)}</span>
                            <span className="text-sm text-gray-600">{getQuestionTypeName(q.type)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete question"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                                            {!collapsedQuestions.has(idx) && (
                        <>
                          {/* Question Type and Number */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                              <select
                                value={q.type}
                                onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                              >
                                {questionTypes.map((t) => (
                                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Question Number</label>
                              <input
                                type="number"
                                value={q.number}
                                onChange={(e) => updateQuestion(idx, 'number', parseInt(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                onClick={() => moveQuestion(idx, Math.max(0, idx - 1))}
                                disabled={idx === 0}
                                className="p-3 border border-gray-300 rounded-l-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveQuestion(idx, Math.min(questions.length - 1, idx + 1))}
                                disabled={idx === questions.length - 1}
                                className="p-3 border border-gray-300 rounded-r-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                ↓
                              </button>
                            </div>
                          </div>

                          {/* Question Text */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                              rows={3}
                              placeholder="Enter your question here..."
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            />
                          </div>

                          {/* Question Image */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaImage className="w-4 h-4 inline mr-1" />
                              Image URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={q.image || ''}
                              onChange={(e) => updateQuestion(idx, 'image', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            {q.image && (
                              <div className="mt-2">
                                <img 
                                  src={q.image} 
                                  alt="Question preview" 
                                  className="max-w-full h-32 object-contain border border-gray-200 rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Options for Multiple Choice */}
                          {q.type === 'multiple' && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Multiple Choice Options</label>
                              <div className="space-y-2">
                                {(() => {
                                  let options = [];
                                  try {
                                    options = JSON.parse(q.options || '[]');
                                  } catch {
                                    options = [];
                                  }
                                  return options.map((option, optionIdx) => (
                                    <div key={optionIdx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateChoice(idx, optionIdx, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder={`Option ${optionIdx + 1}`}
                                      />
                                      <button
                                        onClick={() => removeChoice(idx, optionIdx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove option"
                                      >
                                        <FaTimes className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ));
                                })()}
                                <button
                                  onClick={() => addChoice(idx)}
                                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  <FaPlus className="w-4 h-4" />
                                  Add Choice
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Answer */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                            <input
                              type="text"
                              value={q.answer}
                              onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                              placeholder="Enter the correct answer..."
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                          </div>

                          {/* Hint */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <FaLightbulb className="w-4 h-4 inline mr-1" />
                              Hint (Optional)
                            </label>
                            <textarea
                              value={q.hint || ''}
                              onChange={(e) => updateQuestion(idx, 'hint', e.target.value)}
                              rows={2}
                              placeholder="Enter a helpful hint for students..."
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            />
                          </div>
                        </>
                      )}
              </div>
            ))}

                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No questions yet</h3>
                      <p className="text-gray-500">Add your first question to get started!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={addQuestion} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus className="w-5 h-5" />
                  Add New Question
                </button>
                
                <button 
                  onClick={saveQuestions}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave className="w-5 h-5" />
                  {isLoading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Form Modal */}
        <Transition show={showLessonForm} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowLessonForm(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4">
                      {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                    </Dialog.Title>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                        <input
                          type="text"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Enter lesson title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={lessonForm.desc}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, desc: e.target.value }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                          placeholder="Enter lesson description..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                          <input
                            type="text"
                            value={lessonForm.subject}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="e.g., Maths, English..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                          <input
                            type="text"
                            value={lessonForm.topic}
                            onChange={(e) => setLessonForm(prev => ({ ...prev, topic: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="e.g., Algebra, Grammar..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                        <select
                          value={lessonForm.diff}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, diff: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          {difficultyLevels.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {lessonForm.categories.map((cat, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                              {cat}
                              <button
                                onClick={() => removeCategory(cat)}
                                className="ml-1 text-purple-500 hover:text-purple-700"
                              >
                                <FaTimes className="w-3 h-3" />
            </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add category..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addCategory(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              addCategory(input.value);
                              input.value = '';
                            }}
                            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add
            </button>
          </div>
        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowLessonForm(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createLesson}
                        className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Modal */}
        <Transition show={showDeleteConfirm !== null} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteConfirm(null)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Delete {typeof showDeleteConfirm === 'number' ? 'Question' : 'Lesson'}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mb-6">
                      Are you sure you want to delete this {typeof showDeleteConfirm === 'number' ? 'question' : 'lesson'}? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (typeof showDeleteConfirm === 'number') {
                            deleteQuestion(questions[showDeleteConfirm]?.id);
                          } else {
                            deleteLesson(showDeleteConfirm);
                          }
                        }}
                        className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Admin;
