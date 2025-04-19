import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('users')
          .select('username, bio')
          .eq('id', session.user.id)
          .eq('bio', session.user.bio)
          .single();
        if (data) {
          setUser(session.user);
          setUsername(data.username || '');
          setBio(data.bio || '');
        }
      }
    };
    getUser();
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .update({ username, bio })
      .eq('id', user.id)
      .eq('bio', user.bio);
    if (!error) setMessage('✅ Profile updated!');
  };

  const resetStats = async () => {
    if (!user) return;
    await supabase.from('users').update({ xp: 0, streak: 0 }).eq('id', user.id);
    setMessage('🧹 Stats reset!');
  };

  const updateEmail = async () => {
    const newEmail = prompt('Enter new email:');
    if (newEmail) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (!error) setMessage('📧 Email change requested!');
    }
  };

  const updatePassword = async () => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) setMessage('🔐 Password updated!');
    }
  };

  const tabs = {
    Profile: (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={updateProfile}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Save Changes
        </button>
      </div>
    ),
    Appearance: (
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode((prev) => !prev)}
          />
          Enable Dark Mode
        </label>
      </div>
    ),
    Dangerous: (
      <div className="space-y-4">
        <button
          onClick={resetStats}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Reset Stats
        </button>
        <button
          onClick={updatePassword}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Change Password
        </button>
        <button
          onClick={updateEmail}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Change Email
        </button>
      </div>
    ),
    Notifications: (
      <div className="text-gray-600">Coming soon: fine-tune your reminder settings here!</div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-50 p-8">
      <motion.div
        className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-purple-700 mb-6">⚙️ Settings</h1>
        <Tab.Group>
          <Tab.List className="flex space-x-2 mb-6">
            {Object.keys(tabs).map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none ${
                    selected
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {Object.values(tabs).map((panel, idx) => (
              <Tab.Panel key={idx} className="rounded p-2">
                {panel}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
        {message && (
          <motion.div
            className="mt-4 p-3 rounded bg-green-100 text-green-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
