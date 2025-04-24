import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error.message);
        } else {
          setUserData(data);
        }
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div className="text-center mt-10">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome back, <span className="text-purple-600">{userData.username}</span> 👋
        </motion.h1>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer text-center"
            whileHover={{ scale: 1.02 }}
            onClick={() => (window.location.href = '/revision')}
          >
            <h2 className="text-xl font-semibold text-blue-600 mb-1">📘 Revision</h2>
            <p className="text-sm text-gray-500">Go smash some topics</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer text-center"
            whileHover={{ scale: 1.02 }}
            onClick={() => (window.location.href = '/leaderboards')}
          >
            <h2 className="text-xl font-semibold text-yellow-500 mb-1">🏆 Leaderboards</h2>
            <p className="text-sm text-gray-500">See how you stack up</p>
          </motion.div>
        </motion.div>

        {/* XP & Streak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <motion.div
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-2">XP</h2>
            <p className="text-4xl font-bold text-purple-600">{userData.xp}</p>
            <p className="text-sm text-gray-500 mt-1">Your total experience points</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Streak</h2>
            <p className="text-4xl font-bold text-blue-500">{userData.streak} 🔥</p>
            <p className="text-sm text-gray-500 mt-1">Days in a row you've studied</p>
          </motion.div>
        </div>

        {/* Subjects */}
        {userData.subjects && userData.subjects.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Your Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userData.subjects.map((subj, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-purple-600">{subj.name}</h3>
                  {subj.examBoard && subj.examBoard !== "I don't know" && (
                    <p className="text-sm text-gray-600">Board: {subj.examBoard}</p>
                  )}
                  {subj.tier && subj.tier !== "" && (
                    <p className="text-sm text-gray-600">Tier: {subj.tier}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder */}
        <div className="mt-10 bg-white p-6 rounded-xl shadow-inner text-center text-gray-500">
          More stats & features coming soon!
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
