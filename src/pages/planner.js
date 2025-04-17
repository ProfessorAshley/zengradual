import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';

const subjectOptions = [
  'English Language',
  'English Literature',
  'Maths',
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

      if (session) setUserId(session.user.id);
    };
    fetchSession();
  }, []);

  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { name: '', examBoard: '', tier: '' },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...selectedSubjects];
    updated[index][field] = value;
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
      alert('Subjects saved successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Subjects</h2>

        {selectedSubjects.map((subject, index) => (
          <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
            <select
              className="w-full mb-2 p-2 border border-gray-300 rounded"
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

            <select
              className="w-full mb-2 p-2 border border-gray-300 rounded"
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
        ))}

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleAddSubject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Subject
          </button>

          <button
            onClick={handleSaveSubjects}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner;
