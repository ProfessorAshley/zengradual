import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';

const Journal = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setEntries(data);

      setLoading(false);
    };

    if (user) fetchEntries();
  }, [user]);

  const handleAddEntry = async () => {
    if (!newEntry.title || !newEntry.description) return;

    const { data, error } = await supabase
      .from('journal')
      .insert([{ title: newEntry.title, description: newEntry.description, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error adding entry:', error);
    } else {
      setNewEntry({ title: '', description: '' });
      setEntries([data[0], ...entries]);
    }
  };

  const handleDeleteEntry = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('journal')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // double check user ownership

    if (error) {
      console.error('Error deleting entry:', error);
    } else {
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <motion.h2
        className="text-3xl font-semibold text-purple-700 mb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📝 Journal
      </motion.h2>

      <p className="text-gray-600 mb-8">This is your private study journal.</p>

      {/* Journal Entry Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mb-8">
        <motion.input
          type="text"
          placeholder="Journal Title"
          value={newEntry.title}
          onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          className="w-full p-3 mb-4 border rounded-md"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.textarea
          placeholder="Write your thoughts..."
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
          className="w-full p-3 mb-4 border rounded-md"
          rows="5"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          onClick={handleAddEntry}
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
          whileHover={{ scale: 1.03 }}
        >
          Add Entry
        </motion.button>
      </div>

      {/* Journal Entries List */}
      {loading ? (
        <div>Loading entries...</div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="w-full max-w-lg space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
                className="bg-white p-6 rounded-lg shadow-lg relative"
              >
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{entry.title}</h3>
                <p className="text-gray-600 mb-4">{entry.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Journal;
