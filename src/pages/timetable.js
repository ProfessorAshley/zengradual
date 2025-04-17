// dear whoever is reading this, ignore this piece of code, thank you :D

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`);

const subjects = [
  'Maths',
  'Science',
  'English Lit',
  'English Lang',
  'Computer Sci'
];

const Timetable = () => {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');

  const handleAddEvent = () => {
    if (selectedSlot && selectedSubject) {
      setEvents([...events, { ...selectedSlot, subject: selectedSubject }]);
      setSelectedSlot(null);
      setSelectedSubject('');
    }
  };

  const handleDeleteEvent = (day, hour) => {
    setEvents(events.filter(e => !(e.day === day && e.hour === hour)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-6">
      <motion.h1
        className="text-3xl font-bold text-center text-purple-700 mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📅 Study Timetable
      </motion.h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-purple-200 p-3 text-left rounded-tl-2xl">Time</th>
              {days.map(day => (
                <th key={day} className="bg-purple-200 p-3 text-left">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="bg-indigo-100 p-2 font-semibold">{hour}</td>
                {days.map(day => {
                  const event = events.find(e => e.day === day && e.hour === hour);
                  return (
                    <td
                      key={day + hour}
                      className="p-2 border hover:bg-purple-100 transition-all cursor-pointer rounded-2xl"
                      onClick={() => setSelectedSlot({ day, hour })}
                    >
                      {event ? (
                        <div
                          className="bg-purple-500 text-white px-2 py-1 rounded-xl shadow hover:bg-red-500 transition-all"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteEvent(day, hour);
                          }}
                        >
                          {event.subject}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSlot && (
        <motion.div
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-xl p-4 z-50 w-80"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold mb-2 text-purple-700">Add Event</h2>
          <p className="mb-2 text-sm text-gray-600">{selectedSlot.day} at {selectedSlot.hour}</p>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          >
            <option value="">Select a subject</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <button
            onClick={handleAddEvent}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Add to Timetable
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Timetable;
