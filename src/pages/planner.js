import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { FaTrash, FaPlus } from 'react-icons/fa';

const subjectOptions = [
  'English Language',
  'English Literature',
  'Maths',
  'Triple Science',
  'Combined Science',
  'Computer Science',
  'Geography',
  'History',
];


const examBoards = ['AQA', 'Edexcel', 'OCR'];
const tiers = ['Foundation', 'Higher'];

const Planner = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [userId, setUserId] = useState(null);



  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        // Fetch  subjects
        const { data: user, error } = await supabase
          .from('users')
          .select('subjects')
          .eq('id', session.user.id)
          .single();
        if (user && user.subjects) {
          setSelectedSubjects(user.subjects);
        }
      }
    };
    fetchSession();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...selectedSubjects];
    updated[index][field] = value;
    setSelectedSubjects(updated);
  };

  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { name: '', examBoard: '', tier: '' },
    ]);
  };

  const handleDeleteSubject = (index) => {
    const updated = [...selectedSubjects];
    updated.splice(index, 1);
    setSelectedSubjects(updated);
  };

  const handleSaveSubjects = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('users')
      .update({ subjects: selectedSubjects })
      .eq('id', userId);

    if (error) {
      console.error('Error saving subjects:', error.message);
    } else {
      alert('✅ Subjects saved!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Your Study Subjects</h2>

        {selectedSubjects.map((subject, index) => (
          <div
            key={index}
            className="mb-6 bg-gray-50 p-5 rounded-xl shadow flex flex-col sm:flex-row gap-4 items-center"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm mb-1 font-medium">Subject</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={subject.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm mb-1 font-medium">Exam Board</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={subject.examBoard}
                onChange={(e) => handleChange(index, 'examBoard', e.target.value)}
              >
                <option value="">Select Exam Board</option>
                {examBoards.map((board) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm mb-1 font-medium">Tier</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={subject.tier}
                onChange={(e) => handleChange(index, 'tier', e.target.value)}
              >
                <option value="">Select Tier</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleDeleteSubject(index)}
              className="text-red-600 hover:text-red-800 transition mt-3 sm:mt-0"
              title="Remove subject"
            >
              <FaTrash size={18} />
            </button>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <button
            onClick={handleAddSubject}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            <FaPlus /> Add Subject
          </button>

          <button
            onClick={handleSaveSubjects}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            💾 Save All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner;
