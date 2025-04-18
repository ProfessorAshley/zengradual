import React, { useEffect, useState, Fragment } from 'react';
import { supabase } from '../supabaseclient';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { Dialog, Transition, Listbox } from '@headlessui/react';

const subjectOptions = [
  'English Language',
  'English Literature',
  'Maths',
  'Triple Science',
  'Combined Science',
  'Computer Science',
  'Geography',
  'History',
  'French',
  'Spanish',
  'German',
  'Religious Studies',
  'Business Studies',
  'Art',
  'Design Technology',
  'Music',
  'Drama',
  'Economics'
];

const examBoards = ['AQA', 'Edexcel', 'OCR', "I don't know"];
const tiers = ['Foundation', 'Higher', "I don't know"];

const requiresTier = [
  'Maths',
  'Combined Science',
  'Triple Science'
];

const Planner = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const { data: user } = await supabase
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

    if (!error) {
      setShowDialog(true);
    }
  };

  const isDuplicate = (subjectName, index) => {
    return selectedSubjects.some(
      (subj, i) => i !== index && subj.name === subjectName
    );
  };

  const isInvalidScienceCombo = () => {
    const names = selectedSubjects.map(s => s.name);
    return names.includes('Triple Science') && names.includes('Combined Science');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">🎯 Your Study Subjects</h2>

        {selectedSubjects.map((subject, index) => (
          <div
            key={index}
            className="mb-6 bg-gray-50 p-5 rounded-xl shadow flex flex-col sm:flex-row gap-4 items-center"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm mb-1 font-semibold">Subject</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={subject.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((subj) => (
                  <option
                    key={subj}
                    value={subj}
                    disabled={isDuplicate(subj, index)}
                  >
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm mb-1 font-semibold">Exam Board</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
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
              <div className="flex-1 w-full">
                <label className="block text-sm mb-1 font-semibold">Tier</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
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

            <button
              onClick={() => handleDeleteSubject(index)}
              className="text-red-600 hover:text-red-800 transition mt-3 sm:mt-0"
              title="Remove subject"
            >
              <FaTrash size={18} />
            </button>
          </div>
        ))}

        {isInvalidScienceCombo() && (
          <p className="text-red-600 font-medium mb-4">❗ You can't choose both Triple and Combined Science.</p>
        )}

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
            disabled={isInvalidScienceCombo()}
          >
            💾 Save All
          </button>
        </div>
      </div>

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
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none"
                      onClick={() => setShowDialog(false)}
                    >
                      Close
                    </button>
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
