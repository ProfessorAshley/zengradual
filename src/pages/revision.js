import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseclient';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Revision = () => {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [didStudyToday, setDidStudyToday] = useState(false);
  const [xpGraphData, setXpGraphData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const userId = session.user.id;

        const { data, error } = await supabase
          .from('users')
          .select('xp, streak')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setXP(data.xp);
          setStreak(data.streak);
        }

        // Check if they studied today
        const today = new Date().toISOString().split('T')[0];
        const { data: logs } = await supabase
          .from('lesson_logs')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', today);

        if (logs?.length) {
          setDidStudyToday(true);
        }

        // Fetch XP Graph Data (last 7 days)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        const startISO = startDate.toISOString().split('T')[0];

        const { data: xpLogs } = await supabase
          .from('lesson_logs')
          .select('created_at, xp')
          .eq('user_id', userId)
          .gte('created_at', startISO);

        if (xpLogs) {
          const tempMap = {};
          xpLogs.forEach(log => {
            const date = new Date(log.created_at).toISOString().split('T')[0];
            tempMap[date] = (tempMap[date] || 0) + log.xp;
          });

          const graphData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split('T')[0];
            return {
              date: key.substring(5),
              xp: tempMap[key] || 0
            };
          });

          setXpGraphData(graphData);
        }
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-200 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          📚 Welcome to Revision Zone
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Track your streaks, earn XP, and you can do it!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-xl font-semibold text-purple-700 mb-2">🔥 Current Streak</h2>
            <p className="text-4xl font-bold text-gray-800">{streak} days</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-xl font-semibold text-blue-600 mb-2">⭐ Total XP</h2>
            <p className="text-4xl font-bold text-gray-800">{xp} XP</p>
          </motion.div>
        </div>

        {/* Daily Check-in Box */}
        <motion.div
          className="mb-12 p-6 bg-white rounded-xl shadow-lg text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            ✅ Daily Check-In
          </h3>
          <p className="text-gray-600 mb-4">
            {didStudyToday
              ? "Nice! You've already studied today. Keep the streak going!"
              : "You haven't completed a lesson today yet. Jump in to keep your streak alive!"}
          </p>
          <Link to="/lessons">
            <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition">
              Go to Lessons
            </button>
          </Link>
        </motion.div>

        {/* XP Graph */}
        <motion.div
          className="mb-16 bg-white p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 XP Gained Over the Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={xpGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="xp" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="p-8 bg-white rounded-xl shadow-md text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Ashley's placeholder
          <br />
          Other modes are coming soon!
        </motion.div>
      </div>
    </div>
  );
};

export default Revision;
