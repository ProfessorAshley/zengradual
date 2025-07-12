import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaFire, FaStar, FaCrown, FaMedal, FaAward, FaRocket, FaGem, FaDiamond, FaUsers, FaChartLine, FaCalendar } from 'react-icons/fa';

const allBadges = [
  { id: 'xp100', label: 'Beginner', description: 'Earned 100 XP', icon: FaStar, check: (xp) => xp >= 100 },
  { id: 'xp250', label: 'Rising Star', description: 'Earned 250 XP', icon: FaStar, check: (xp) => xp >= 250 },
  { id: 'xp500', label: 'Achiever', description: 'Earned 500 XP', icon: FaMedal, check: (xp) => xp >= 500 },
  { id: 'xp1000', label: 'Elite', description: 'Earned 1000 XP', icon: FaTrophy, check: (xp) => xp >= 1000 },
  { id: 'streak3', label: 'Consistent', description: '3 Day Streak', icon: FaFire, check: (_, streak) => streak >= 3 },
  { id: 'streak7', label: 'Committed', description: '7 Day Streak', icon: FaFire, check: (_, streak) => streak >= 7 },
  { id: 'streak14', label: 'Focused', description: '14 Day Streak', icon: FaFire, check: (_, streak) => streak >= 14 },
  { id: 'streak21', label: 'Dedicated', description: '21 Day Streak', icon: FaFire, check: (_, streak) => streak >= 21 },
  { id: 'streak30', label: 'Legendary', description: '30 Day Streak', icon: FaCrown, check: (_, streak) => streak >= 30 },
  { id: 'daily50', label: 'Burst Mode', description: '50 XP in 1 Day', icon: FaRocket, check: (_, __, dailyXP) => dailyXP >= 50 },
  { id: 'daily100', label: 'XP Machine', description: '100 XP in 1 Day', icon: FaRocket, check: (_, __, dailyXP) => dailyXP >= 100 },
];

const Profile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          User not found
        </motion.div>
      </div>
    );
  }

  const { xp = 0, streak = 0, subjects = [], bio, daily_xp = 0 } = userData;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpToNextLevel = 100 - xpInLevel;
  const isAdmin = ['professorashley', 'admin'].includes(username.toLowerCase());

  const earned = allBadges.filter(b => b.check(xp, streak, daily_xp));
  const locked = allBadges.filter(b => !b.check(xp, streak, daily_xp));

  const getAchievementIcon = (level) => {
    if (level >= 50) return <FaCrown className="text-blue-400" />;
    if (level >= 30) return <FaGem className="text-purple-400" />;
    if (level >= 20) return <FaRocket className="text-orange-400" />;
    if (level >= 10) return <FaStar className="text-yellow-400" />;
    return null;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUsers },
    { id: 'badges', label: 'Badges', icon: FaTrophy },
    { id: 'subjects', label: 'Subjects', icon: FaChartLine }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FaTrophy className="text-yellow-400" />
            Profile
            <FaTrophy className="text-yellow-400" />
          </motion.h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {username?.charAt(0).toUpperCase()}
                </div>
                {getAchievementIcon(level) && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {getAchievementIcon(level)}
                  </motion.div>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">@{username}</h2>
                  {isAdmin && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FaCrown className="text-yellow-400 text-2xl" />
                    </motion.div>
                  )}
                </div>
                <p className="text-purple-200 text-lg mb-4">{bio || 'No bio yet.'}</p>
                
                {/* Level and XP Progress */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-white">
                      <span className="text-2xl font-bold">Level {level}</span>
                    </div>
                    <div className="text-purple-200">
                      <span className="text-xl font-semibold">{xp} XP</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(xpInLevel / 100) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="text-purple-200 text-sm">
                    {xpInLevel}/100 XP to Level {level + 1}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaFire className="text-orange-400" />
                    <span className="text-white font-bold text-xl">{streak}</span>
                  </div>
                  <div className="text-purple-200 text-sm">Day Streak</div>
                </motion.div>
                
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaChartLine className="text-green-400" />
                    <span className="text-white font-bold text-xl">{daily_xp}</span>
                  </div>
                  <div className="text-purple-200 text-sm">Today's XP</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quick Stats */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaChartLine />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Total XP</span>
                      <span className="text-white font-bold">{xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Current Level</span>
                      <span className="text-white font-bold">{level}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">XP to Next Level</span>
                      <span className="text-white font-bold">{xpToNextLevel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Badges Earned</span>
                      <span className="text-white font-bold">{earned.length}/{allBadges.length}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaCalendar />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <FaFire className="text-orange-400" />
                      <div>
                        <div className="text-white font-semibold">{streak} Day Streak</div>
                        <div className="text-purple-200 text-sm">Keep it up!</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <FaChartLine className="text-green-400" />
                      <div>
                        <div className="text-white font-semibold">{daily_xp} XP Today</div>
                        <div className="text-purple-200 text-sm">Great progress!</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="space-y-8">
                {/* Earned Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaTrophy className="text-yellow-400" />
                    Earned Badges ({earned.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {earned.map((badge, i) => {
                      const IconComponent = badge.icon;
                      return (
                        <motion.div
                          key={badge.id}
                          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 cursor-pointer"
                          whileHover={{ scale: 1.05, y: -5 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="text-2xl text-green-400" />
                            <div className="text-white font-bold text-lg">{badge.label}</div>
                          </div>
                          <div className="text-green-200 text-sm">{badge.description}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Locked Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaAward className="text-gray-400" />
                    Locked Badges ({locked.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locked.map((badge, i) => {
                      const IconComponent = badge.icon;
                      return (
                        <motion.div
                          key={badge.id}
                          className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-lg rounded-2xl p-6 border border-gray-400/30 opacity-60"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="text-2xl text-gray-400" />
                            <div className="text-gray-300 font-bold text-lg">{badge.label}</div>
                          </div>
                          <div className="text-gray-400 text-sm">{badge.description}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaChartLine />
                  Subjects ({subjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subj, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30"
                      whileHover={{ scale: 1.05, y: -5 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                    >
                      <h4 className="text-white font-bold text-lg mb-2">{subj.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-blue-200">
                          <span className="font-semibold">Exam Board:</span> {subj.examBoard || 'N/A'}
                        </div>
                        <div className="text-blue-200">
                          <span className="font-semibold">Tier:</span> {subj.tier || 'N/A'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
