import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion } from 'framer-motion';

const allBadges = [
  { id: 'xp100', label: 'Beginner', description: 'Earned 100 XP', check: (xp) => xp >= 100 },
  { id: 'xp250', label: 'Rising Star', description: 'Earned 250 XP', check: (xp) => xp >= 250 },
  { id: 'xp500', label: 'Achiever', description: 'Earned 500 XP', check: (xp) => xp >= 500 },
  { id: 'xp1000', label: 'Elite', description: 'Earned 1000 XP', check: (xp) => xp >= 1000 },
  { id: 'streak3', label: 'Consistent', description: '3 Day Streak', check: (_, streak) => streak >= 3 },
  { id: 'streak7', label: 'Committed', description: '7 Day Streak', check: (_, streak) => streak >= 7 },
  { id: 'streak14', label: 'Focused', description: '14 Day Streak', check: (_, streak) => streak >= 14 },
  { id: 'streak21', label: 'Dedicated', description: '21 Day Streak', check: (_, streak) => streak >= 21 },
  { id: 'streak30', label: 'Legendary', description: '30 Day Streak', check: (_, streak) => streak >= 30 },
  { id: 'daily50', label: 'Burst Mode', description: '50 XP in 1 Day', check: (_, __, dailyXP) => dailyXP >= 50 },
  { id: 'daily100', label: 'XP Machine', description: '100 XP in 1 Day', check: (_, __, dailyXP) => dailyXP >= 100 },
];

const Profile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (!error && data) {
        setUserData(data);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [username]);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (!userData) return <div className="p-6 text-red-500">User not found.</div>;

  const { xp = 0, streak = 0, subjects = [], bio, daily_xp = 0 } = userData;

  const earned = allBadges.filter(b => b.check(xp, streak, daily_xp));
  const locked = allBadges.filter(b => !b.check(xp, streak, daily_xp));
  const isAdmin = ['professorashley', 'admin'].includes(username.toLowerCase());

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-100">
      <motion.div
        className={`max-w-4xl mx-auto p-6 rounded-2xl shadow-2xl relative overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background Gradient Overlay */}
        {isAdmin && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-200 via-red-600 to-red-200 opacity-80 rounded-2xl pointer-events-none z-0" />
        )}

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-purple-800 mb-2">@{username}</h1>
          <p className="text-gray-600 mb-6 italic">{bio || 'No bio yet.'}</p>

          <div className="flex flex-wrap gap-6 text-lg font-medium text-purple-700 mb-6">
            <div className="bg-purple-100 rounded-xl px-4 py-2 shadow-sm">
              🧠 XP: <span className="font-bold">{xp}</span>
            </div>
            <div className="bg-orange-100 rounded-xl px-4 py-2 shadow-sm">
              🔥 Streak: <span className="font-bold">{streak} days</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">📚 Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {subjects.map((subj, idx) => (
              <motion.div
                key={idx}
                className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-lg font-bold text-blue-700">{subj.name}</h3>
                <p className="text-sm text-gray-600">Exam Board: {subj.examBoard || 'N/A'}</p>
                <p className="text-sm text-gray-600">Tier: {subj.tier || 'N/A'}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">🏅 Badges Earned</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                className="bg-green-100 text-green-800 px-4 py-3 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="font-bold">{badge.label}</div>
                <div className="text-sm">{badge.description}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">🔒 Locked Badges</h2>
          <div className="flex flex-wrap gap-4 opacity-60">
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg shadow-sm line-through"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="font-bold">{badge.label}</div>
                <div className="text-sm">{badge.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
