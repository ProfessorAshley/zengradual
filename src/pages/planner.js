import React, { useEffect, useState, Fragment } from 'react';
import { supabase } from '../supabaseclient';
import { FaTrash, FaPlus, FaStar, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

// Subject configuration with essential subjects marked
const subjectOptions = [
  { name: 'English Language', essential: true, icon: '📝' },
  { name: 'English Literature', essential: true, icon: '📚' },
  { name: 'Maths', essential: true, icon: '📐' },
  { name: 'Triple Science', essential: false, icon: '🔬' },
  { name: 'Combined Science', essential: false, icon: '🧪' },
  { name: 'Computer Science', essential: false, icon: '💻' },
  { name: 'Geography', essential: false, icon: '🌍' },
  { name: 'History', essential: false, icon: '📜' },
  { name: 'French', essential: false, icon: '🇫🇷' },
  { name: 'Spanish', essential: false, icon: '🇪🇸' },
  { name: 'German', essential: false, icon: '🇩🇪' },
  { name: 'Religious Studies', essential: false, icon: '⛪' },
  { name: 'Business Studies', essential: false, icon: '💼' },
  { name: 'Art', essential: false, icon: '🎨' },
  { name: 'Design Technology', essential: false, icon: '🔧' },
  { name: 'Music', essential: false, icon: '🎵' },
  { name: 'Drama', essential: false, icon: '🎭' },
  { name: 'Economics', essential: false, icon: '📈' }
];

const examBoards = ['AQA', 'Edexcel', 'OCR', "I don't know"];
const tiers = ['Foundation', 'Higher', "I don't know"];

const requiresTier = [
  'Maths',
  'Combined Science',
  'Triple Science'
];

const Planner = () => {
  // ==================== STATE MANAGEMENT ====================
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAqaInfo, setShowAqaInfo] = useState(false);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get user session');
          return;
        }

        if (!session) {
          setError('No active session found');
          return;
        }

        setUserId(session.user.id);

        // Fetch user's existing subjects
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('subjects')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('User data fetch error:', userError);
          setError('Failed to load user data');
          return;
        }

        if (user && user.subjects) {
          setSelectedSubjects(user.subjects);
        }

        setLoading(false);

      } catch (err) {
        console.error('Unexpected error in fetchSession:', err);
        setError('Failed to load planner data');
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // ==================== UTILITY FUNCTIONS ====================
  /**
   * Get subject info by name
   * @param {string} subjectName - Name of the subject
   * @returns {object} Subject information
   */
  const getSubjectInfo = (subjectName) => {
    return subjectOptions.find(subj => subj.name === subjectName) || {};
  };

  /**
   * Check if subject is essential
   * @param {string} subjectName - Name of the subject
   * @returns {boolean} Whether the subject is essential
   */
  const isEssentialSubject = (subjectName) => {
    return getSubjectInfo(subjectName).essential || false;
  };

  /**
   * Get subject count with essential subjects highlighted
   * @returns {object} Count information
   */
  const getSubjectCount = () => {
    const total = selectedSubjects.length;
    const essential = selectedSubjects.filter(subj => isEssentialSubject(subj.name)).length;
    const optional = total - essential;
    
    return { total, essential, optional };
  };

  /**
   * Check for duplicate subjects
   * @param {string} subjectName - Subject name to check
   * @param {number} index - Current subject index
   * @returns {boolean} Whether subject is duplicate
   */
  const isDuplicate = (subjectName, index) => {
    return selectedSubjects.some(
      (subj, i) => i !== index && subj.name === subjectName
    );
  };

  /**
   * Check for invalid science combination
   * @returns {boolean} Whether combination is invalid
   */
  const isInvalidScienceCombo = () => {
    const names = selectedSubjects.map(s => s.name);
    return names.includes('Triple Science') && names.includes('Combined Science');
  };

  // ==================== EVENT HANDLERS ====================
  /**
   * Handle changes to subject fields
   * @param {number} index - Subject index
   * @param {string} field - Field to update
   * @param {string} value - New value
   */
  const handleChange = (index, field, value) => {
    const updated = [...selectedSubjects];
    
    // Handle "I don't know" for exam board - default to AQA
    if (field === 'examBoard' && value === "I don't know") {
      updated[index][field] = 'AQA';
      setShowAqaInfo(true);
    } else {
      updated[index][field] = value;
    }
    
    setSelectedSubjects(updated);
  };

  /**
   * Add a new subject to the list
   */
  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { name: '', examBoard: '', tier: '' },
    ]);
  };

  /**
   * Delete a subject from the list
   * @param {number} index - Index of subject to delete
   */
  const handleDeleteSubject = (index) => {
    const updated = [...selectedSubjects];
    updated.splice(index, 1);
    setSelectedSubjects(updated);
  };

  /**
   * Save subjects to database
   */
  const handleSaveSubjects = async () => {
    if (!userId) {
      setError('No user session found');
      return;
    }

    if (isInvalidScienceCombo()) {
      setError('You cannot choose both Triple and Combined Science');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ subjects: selectedSubjects })
        .eq('id', userId);

      if (error) {
        console.error('Save error:', error);
        setError('Failed to save subjects');
        return;
      }

      setShowDialog(true);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save subjects');
    } finally {
      setSaving(false);
    }
  };

  // ==================== UI COMPONENTS ====================
  /**
   * Subject count display component
   */
  const SubjectCount = () => {
    const count = getSubjectCount();
    
    return (
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{count.total}</div>
            <div className="text-sm text-gray-600">Total Subjects</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              <FaStar className="text-yellow-500" />
              {count.essential}
            </div>
            <div className="text-sm text-gray-600">Essential</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{count.optional}</div>
            <div className="text-sm text-gray-600">Optional</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {count.essential >= 3 ? '✅ Complete' : '⚠️ Incomplete'}
            </div>
            <div className="text-xs text-gray-500">
              {count.essential >= 3 ? 'All essential subjects selected' : 'Need 3 essential subjects'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * Individual subject card component
   */
  const SubjectCard = ({ subject, index }) => {
    const subjectInfo = getSubjectInfo(subject.name);
    const isEssential = isEssentialSubject(subject.name);
    const isDuplicateSubject = subject.name && isDuplicate(subject.name, index);
    const isComplete = subject.name && subject.examBoard;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`relative mb-6 p-6 rounded-2xl shadow-lg transition-all duration-300 ${
          isEssential 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
            : 'bg-white border border-gray-200'
        } ${isComplete ? 'ring-2 ring-green-200' : ''} ${isDuplicateSubject ? 'ring-2 ring-red-200' : ''}`}
      >
        {/* Essential subject indicator */}
        {isEssential && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
            <FaStar size={12} />
          </div>
        )}

        {/* Subject icon and name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">{subjectInfo.icon}</div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject {isEssential && <span className="text-yellow-600">*</span>}
            </label>
            <select
              className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                isEssential 
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200' 
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
              } ${isDuplicateSubject ? 'border-red-300' : ''}`}
              value={subject.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((subj) => (
                <option
                  key={subj.name}
                  value={subj.name}
                  disabled={isDuplicate(subj.name, index)}
                >
                  {subj.icon} {subj.name} {subj.essential ? '(Essential)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exam board and tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exam Board
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
              value={subject.examBoard}
              onChange={(e) => handleChange(index, 'examBoard', e.target.value)}
            >
              <option value="">Select Exam Board</option>
              {examBoards.map((board) => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
          </div>

          {requiresTier.includes(subject.name) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tier
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
                value={subject.tier}
                onChange={(e) => handleChange(index, 'tier', e.target.value)}
              >
                <option value="">Select Tier</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {isComplete && (
              <div className="flex items-center gap-1 text-green-600">
                <FaCheck size={14} />
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
            {isDuplicateSubject && (
              <div className="flex items-center gap-1 text-red-600">
                <FaExclamationTriangle size={14} />
                <span className="text-sm font-medium">Duplicate</span>
              </div>
            )}
          </div>

          <motion.button
            onClick={() => handleDeleteSubject(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
            title="Remove subject"
          >
            <FaTrash size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ {error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-10 px-6">
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8">
          <motion.h2 
            className="text-4xl font-extrabold text-gray-800 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            🎯 Your Study Subjects
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Configure your subjects to get personalized study plans and recommendations.
          </motion.p>
        </div>

        {/* Subject Count */}
        <SubjectCount />

        {/* Subjects List */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <AnimatePresence>
            {selectedSubjects.map((subject, index) => (
              <SubjectCard key={index} subject={subject} index={index} />
            ))}
          </AnimatePresence>

          {/* Error Messages */}
          <AnimatePresence>
            {isInvalidScienceCombo() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 font-medium mb-6 p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <FaExclamationTriangle />
                You can't choose both Triple and Combined Science.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <motion.button
              onClick={handleAddSubject}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 font-semibold"
            >
              <FaPlus /> Add Subject
            </motion.button>

            <motion.button
              onClick={handleSaveSubjects}
              disabled={isInvalidScienceCombo() || saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 font-semibold ${
                isInvalidScienceCombo() || saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save All
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Success Dialog */}
      <Transition.Root show={showDialog} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    ✅ Subjects Saved!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your subjects have been successfully saved to your profile.
                    </p>
                  </div>

                  <div className="mt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none transition-all duration-200"
                      onClick={() => setShowDialog(false)}
                    >
                      Close
                    </motion.button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* AQA Info Dialog */}
      <Transition.Root show={showAqaInfo} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowAqaInfo}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <FaInfoCircle className="text-blue-500 text-xl" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Exam Board Set to AQA
                    </Dialog.Title>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Since you selected "I don't know", we've set your exam board to AQA, which is the most common choice. 
                      Please check with your teacher to confirm this is correct for your school.
                    </p>
                  </div>

                  <div className="mt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-all duration-200"
                      onClick={() => setShowAqaInfo(false)}
                    >
                      Got it!
                    </motion.button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Planner;
