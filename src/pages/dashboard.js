// src/pages/dashboard.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome back, <span className="text-purple-600">{userData.username}</span> 👋
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* XP Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">XP</h2>
            <p className="text-4xl font-bold text-purple-600">{userData.xp}</p>
            <p className="text-sm text-gray-500 mt-1">Your total experience points</p>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Streak</h2>
            <p className="text-4xl font-bold text-blue-500">{userData.streak} 🔥</p>
            <p className="text-sm text-gray-500 mt-1">Days in a row you've studied</p>
          </div>
        </div>

              {userData.subjects && userData.subjects.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Your Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userData.subjects.map((subj, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-purple-600">{subj.name}</h3>
                <p className="text-sm text-gray-600">Board: {subj.examBoard}</p>
                <p className="text-sm text-gray-600">Tier: {subj.tier}</p>
              </div>
            ))}
          </div>
        </div>
      )}


        {/* Placeholder for future features */}
        <div className="mt-10 bg-white p-6 rounded-xl shadow-inner text-center text-gray-500">
          More stats & features coming soon!
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
