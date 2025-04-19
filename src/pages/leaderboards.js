import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion } from 'framer-motion';
import { FaMedal } from 'react-icons/fa';

const Leaderboards = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, xp')
        .order('xp', { ascending: false })
        .limit(100);

      if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 py-10 px-6">
      <motion.h1
        className="text-4xl font-bold text-center text-purple-800 mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🏆 Leaderboards
      </motion.h1>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between px-6 py-4 transition-all ${index < 3 ? 'bg-yellow-50' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold text-purple-700 w-6">{index + 1}</div>
                {index < 3 && <FaMedal className={`text-yellow-${index === 0 ? '400' : index === 1 ? '300' : '500'}`} />}
                <span className="text-gray-800 font-medium">{user.username}</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">{user.xp} XP</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
