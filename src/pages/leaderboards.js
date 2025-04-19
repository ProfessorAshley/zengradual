import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion } from 'framer-motion';
import { FaMedal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const medalColors = ['text-yellow-400', 'text-gray-400', 'text-orange-500'];

const Leaderboards = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      <motion.div
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="divide-y divide-gray-200">
          {users.map((user, index) => {
            const isTop3 = index < 3;
            const rankColor = medalColors[index] || 'text-gray-500';

            return (
              <motion.div
                key={user.username}
                onClick={() => navigate(`/profile/${user.username}`)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-200 ${
                  isTop3 ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                } hover:shadow-lg rounded-sm`}
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-purple-700 w-6">{index + 1}</div>
                  {isTop3 && <FaMedal className={`text-2xl ${rankColor}`} />}
                  <span className="text-gray-800 font-medium hover:underline">{user.username}</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">{user.xp} XP</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboards;
