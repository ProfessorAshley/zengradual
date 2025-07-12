import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaCoins, FaCheck, FaArrowRight, FaRocket, FaCrown, FaMedal, FaAward, FaCalendar, FaGift, FaCrosshairs, FaBolt } from 'react-icons/fa';

const Missions = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [totalGold, setTotalGold] = useState(0);
  const [celebrationAnimation, setCelebrationAnimation] = useState(null);

  // Daily mission definitions
  const dailyMissions = [
    {
      id: 'xp_30',
      title: "Earn 30 XP",
      description: "Gain 30 experience points today",
      icon: FaStar,
      type: 'xp',
      target: 30,
      reward: 50,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'xp_75',
      title: "Earn 75 XP",
      description: "Gain 75 experience points today",
      icon: FaFire,
      type: 'xp',
      target: 75,
      reward: 100,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'xp_150',
      title: "Earn 150 XP",
      description: "Gain 150 experience points today",
      icon: FaBolt,
      type: 'xp',
      target: 150,
      reward: 200,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'renew_streak',
      title: "Renew Your Streak",
      description: "Complete a lesson to maintain your streak",
      icon: FaFire,
      type: 'streak',
      target: 1,
      reward: 75,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'wildcard',
      title: "Complete Any Lesson",
      description: "Finish any lesson today",
      icon: FaCrosshairs,
      type: 'wildcard',
      target: 1,
      reward: 60,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
            setTotalGold(data.gold || 0);
            
            // Check if missions need to be reset (new day)
            await checkAndResetMissions(data);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const checkAndResetMissions = async (user) => {
    const today = new Date().toISOString().split('T')[0];
    const lastMissionReset = user.last_mission_reset ? new Date(user.last_mission_reset).toISOString().split('T')[0] : null;

    if (!lastMissionReset || lastMissionReset !== today) {
      // Reset missions for new day
      const { error } = await supabase
        .from('users')
        .update({ 
          last_mission_reset: new Date().toISOString(),
          completed_missions: [],
          daily_xp_earned: 0,
          daily_lessons_completed: 0
        })
        .eq('id', user.id);

      if (!error) {
        setUserData(prev => ({
          ...prev,
          last_mission_reset: new Date().toISOString(),
          completed_missions: [],
          daily_xp_earned: 0,
          daily_lessons_completed: 0
        }));
      }
    }

    // Load current mission progress
    loadMissionProgress(user);
  };

  const loadMissionProgress = (user) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyXP = user.daily_xp_earned || 0;
    const dailyLessons = user.daily_lessons_completed || 0;
    const completedMissions = user.completed_missions || [];
    const currentStreak = user.streak || 0;

    const missionProgress = dailyMissions.map(mission => {
      let progress = 0;
      let completed = completedMissions.includes(mission.id);
      let newlyCompleted = false;

      switch (mission.type) {
        case 'xp':
          progress = Math.min(dailyXP, mission.target);
          break;
        case 'streak':
          progress = currentStreak > 0 ? 1 : 0;
          break;
        case 'wildcard':
          progress = Math.min(dailyLessons, mission.target);
          break;
        default:
          progress = 0;
      }

      // Check if mission was just completed
      if (progress >= mission.target && !completed) {
        newlyCompleted = true;
        // Trigger celebration for newly completed missions
        setTimeout(() => {
          setCelebrationAnimation({
            missionId: mission.id,
            reward: mission.reward,
            timestamp: Date.now(),
            type: 'completion'
          });
          setTimeout(() => setCelebrationAnimation(null), 3000);
        }, 1000);
      }

      return {
        ...mission,
        progress,
        completed: progress >= mission.target,
        newlyCompleted,
        progressPercent: (progress / mission.target) * 100
      };
    });

    setMissions(missionProgress);
    setCompletedMissions(completedMissions);
  };

  const claimMissionReward = async (missionId) => {
    if (!userData) return;

    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission || !mission.completed) return;

      // Add gold to user
      const newGold = totalGold + mission.reward;
      
      // Add mission to completed list
      const newCompletedMissions = [...completedMissions, missionId];

      const { error } = await supabase
        .from('users')
        .update({ 
          gold: newGold,
          completed_missions: newCompletedMissions
        })
        .eq('id', userData.id);

      if (!error) {
        setTotalGold(newGold);
        setCompletedMissions(newCompletedMissions);
        setMissions(prev => prev.map(m => 
          m.id === missionId ? { ...m, claimed: true } : m
        ));
        
        // Trigger celebration animation
        setCelebrationAnimation({
          missionId,
          reward: mission.reward,
          timestamp: Date.now()
        });
        
        // Clear celebration after 3 seconds
        setTimeout(() => {
          setCelebrationAnimation(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

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
          Error loading missions
        </motion.div>
      </div>
    );
  }

  const completedCount = completedMissions.length;
  const totalReward = missions.filter(m => m.completed && !m.claimed).reduce((sum, m) => sum + m.reward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-6 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
        
        {/* Larger glowing orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-4 h-4 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-sm"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Celebration Animation */}
        <AnimatePresence>
          {celebrationAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              {/* Background overlay */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
              
              {/* Celebration card */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                
                <div className="relative z-10">
                  {/* Celebration emojis */}
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ 
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    {celebrationAnimation.type === 'completion' ? '🎉' : '💰'}
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold mb-2">
                    {celebrationAnimation.type === 'completion' ? 'Mission Complete!' : 'Reward Claimed!'}
                  </h2>
                  
                  <p className="text-xl mb-4">
                    {celebrationAnimation.type === 'completion' 
                      ? 'You\'ve completed a mission!' 
                      : `You earned ${celebrationAnimation.reward} Gold!`
                    }
                  </p>
                  
                  {/* Animated coins */}
                  <div className="flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [-20, -40, -60], opacity: [0, 1, 0] }}
                        transition={{ 
                          delay: i * 0.1,
                          duration: 1,
                          ease: "easeOut"
                        }}
                        className="text-2xl"
                      >
                        💰
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-2xl font-bold mt-4">
                    +{celebrationAnimation.reward} Gold
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
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
            <FaCrosshairs className="text-yellow-400" />
            Daily Missions
            <FaCrosshairs className="text-yellow-400" />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Complete tasks to earn <span className="text-yellow-400 font-bold">Gold</span> 💰
          </motion.p>
        </motion.div>

        {/* Enhanced Gold Display */}
        <motion.div
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-8 border border-yellow-400/30 mb-8 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <FaCoins className="text-4xl text-yellow-400" />
              </motion.div>
              <div className="text-5xl font-bold text-white">{totalGold}</div>
            </div>
            <div className="text-yellow-200 text-lg font-semibold">Total Gold</div>
            {totalReward > 0 && (
              <motion.div
                className="mt-4 p-4 bg-green-500/30 rounded-xl border border-green-400/50 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-green-200 font-bold text-lg">
                  +{totalReward} Gold available to claim! 💰
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaCalendar className="text-3xl text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{completedCount}/5</div>
            <div className="text-purple-200">Missions Completed</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaStar className="text-3xl text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{userData.daily_xp_earned || 0}</div>
            <div className="text-purple-200">XP Earned Today</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaFire className="text-3xl text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{userData.streak || 0}</div>
            <div className="text-purple-200">Current Streak</div>
          </div>
        </motion.div>

        {/* Enhanced Missions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {missions.map((mission, index) => {
            const IconComponent = mission.icon;
            
            return (
              <motion.div
                key={mission.id}
                className={`backdrop-blur-lg rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden ${
                  mission.completed 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50 shadow-lg shadow-green-500/20' 
                    : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/50'
                }`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: mission.newlyCompleted ? 1.05 : 1
                }}
                transition={{ 
                  delay: 0.6 + index * 0.1,
                  duration: mission.newlyCompleted ? 0.6 : 0.3
                }}
                whileHover={{ scale: 1.03, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Newly completed glow effect */}
                {mission.newlyCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: 2 }}
                  />
                )}
                
                {/* Animated background glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${mission.color} opacity-10 blur-xl`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-6">
                    <motion.div 
                      className={`p-4 rounded-2xl bg-gradient-to-r ${mission.color} shadow-lg relative`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconComponent className="text-white text-2xl" />
                      {mission.newlyCompleted && (
                        <motion.div
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          NEW!
                        </motion.div>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                      <p className="text-sm text-purple-200 leading-relaxed">{mission.description}</p>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-purple-200 mb-3">
                      <span className="font-semibold">Progress</span>
                      <span className="font-bold">{mission.progress}/{mission.target}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className={`h-full rounded-full shadow-lg ${
                          mission.completed 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                            : 'bg-gradient-to-r from-purple-400 to-pink-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${mission.progressPercent}%` }}
                        transition={{ duration: 1.5, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Reward and Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <FaCoins className="text-yellow-400 text-xl" />
                      </motion.div>
                      <span className="text-yellow-400 font-bold text-lg">+{mission.reward}</span>
                    </div>
                    
                    {mission.completed ? (
                      mission.claimed ? (
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-full">
                          <FaCheck className="text-lg" />
                          <span className="text-sm font-semibold">Claimed</span>
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => claimMissionReward(mission.id)}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-yellow-500/30"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Claim Reward
                        </motion.button>
                      )
                    ) : (
                      <div className="text-purple-300 text-sm font-semibold bg-purple-500/20 px-4 py-2 rounded-full">
                        {mission.progressPercent < 100 ? 'In Progress' : 'Complete!'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/revision">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-2xl text-white text-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaRocket className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Start Learning</h3>
              <p className="text-blue-100">Complete lessons to earn XP and gold</p>
            </motion.div>
          </Link>

          <Link to="/shop">
            <motion.div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white text-center hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCoins className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Visit Shop</h3>
              <p className="text-yellow-100">Spend your hard-earned gold</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Reset Info */}
        <motion.div
          className="mt-8 text-center text-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <p className="text-sm">
            Missions reset daily at midnight. Complete them all to maximize your gold earnings! 💰
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Missions; 