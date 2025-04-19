import React, { useEffect, useState } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { supabase } from '../supabaseclient';

const questionTypes = ['multiple', 'write', 'text'];

const Admin = () => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filterType, setFilterType] = useState('');

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('*');
    setLessons(data);
  };

  const fetchQuestions = async (lessonId) => {
    const { data } = await supabase.from('questions').select('*').eq('lesson_id', lessonId);
    setQuestions(data);
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
    for (const q of questions) {
      const questionToSave = {
        lesson_id: selectedLesson.id,
        ...q,
      };

      if (q.id) {
        await supabase.from('questions').update(questionToSave).eq('id', q.id);
      } else {
        await supabase.from('questions').insert([questionToSave]);
      }
    }
    fetchQuestions(selectedLesson.id);
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: 'multiple', number: 1, question: '', options: '[]', answer: '' }]);
  };

  const filteredQuestions = filterType ? questions.filter((q) => q.type === filterType) : questions;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">🛠️ Admin - Manage Questions</h1>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm ${
              selectedLesson?.id === lesson.id ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 hover:bg-purple-200'
            }`}
          >
            {lesson.title}
          </button>
        ))}
      </div>

      {selectedLesson && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold text-purple-700 mb-2 sm:mb-0">Questions for: {selectedLesson.title}</h2>
            <Listbox value={filterType} onChange={setFilterType}>
              <div className="relative w-40">
                <Listbox.Button className="w-full rounded-md bg-purple-100 py-2 px-3 text-purple-800 text-sm">
                  {filterType || 'Filter Type'}
                </Listbox.Button>
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10">
                    <Listbox.Option value="">All</Listbox.Option>
                    {questionTypes.map((type) => (
                      <Listbox.Option
                        key={type}
                        value={type}
                        className="cursor-pointer hover:bg-purple-100 px-3 py-1"
                      >
                        {type}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => (
              <div key={idx} className="bg-purple-50 p-4 rounded-lg shadow-sm space-y-2">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-purple-800">Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      {questionTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-sm font-medium text-purple-800">Number</label>
                    <input
                      type="number"
                      value={q.number}
                      onChange={(e) => updateQuestion(idx, 'number', parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-800">Question</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>

                {q.type === 'multiple' && (
                  <div>
                    <label className="block text-sm font-medium text-purple-800">Options (JSON array)</label>
                    <textarea
                      value={q.options}
                      onChange={(e) => updateQuestion(idx, 'options', e.target.value)}
                      rows={2}
                      className="w-full p-2 border rounded-md bg-white font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-purple-800">Answer</label>
                  <input
                    type="text"
                    value={q.answer}
                    onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={addQuestion} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              + Add Question
            </button>
            <button onClick={saveQuestions} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              💾 Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
