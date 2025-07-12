import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaBook, FaCoins, FaUsers, FaChartLine, FaCalendar, FaCheck, FaArrowRight, FaRocket, FaCrown, FaMedal, FaAward, FaChevronDown, FaChevronUp, FaFlag } from 'react-icons/fa';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  // Task definitions
  const tasks = [
    {
      id: 'subjects',
      title: "Pick Your Subjects",
      description: "Configure your study subjects in the planner",
      icon: FaBook,
      condition: (user) => user.subjects && user.subjects.length > 0 && user.subjects.some(s => s.name),
      reward: 50
    },
    {
      id: 'first_lesson',
      title: "Complete Your First Lesson",
      description: "Start your learning journey with a revision session",
      icon: FaStar,
      condition: (user) => user.xp > 0,
      reward: 25
    },
    {
      id: 'fifty_xp',
      title: "Earn 50 XP",
      description: "Build momentum by earning 50 experience points",
      icon: FaFire,
      condition: (user) => user.xp >= 50,
      reward: 100
    },
    {
      id: 'three_day_streak',
      title: "Maintain a 3-Day Streak",
      description: "Show dedication with a 3-day study streak",
      icon: FaMedal,
      condition: (user) => user.streak >= 3,
      reward: 75
    },
    {
      id: 'level_two',
      title: "Reach Level 2",
      description: "Level up by earning 100 XP total",
      icon: FaCrown,
      condition: (user) => user.xp >= 100,
      reward: 150
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
            
            // Check if all tasks are completed and collapse if so
            const allCompleted = tasks.every(task => task.condition(data));
            if (allCompleted) {
              setShowTasks(false);
            }
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

  const getLevel = (xp) => Math.floor(xp / 100) + 1;
  const getXPInLevel = (xp) => xp % 100;
  const getXPToNextLevel = (xp) => 100 - (xp % 100);

  const getCompletedTasks = (user) => {
    return tasks.filter(task => task.condition(user));
  };

  const getNextTask = (user) => {
    return tasks.find(task => !task.condition(user));
  };

  const getTaskProgress = (user) => {
    const completed = getCompletedTasks(user).length;
    return Math.min(completed, user.taskprogression?.length || 0);
  };

  const updateTaskProgression = async (taskId) => {
    if (!userData) return;

    try {
      const currentProgression = userData.taskprogression || [];
      
      // Only add if not already completed
      if (!currentProgression.includes(taskId)) {
        const newProgression = [...currentProgression, taskId];
        
        const { error } = await supabase
          .from('users')
          .update({ taskprogression: newProgression })
          .eq('id', userData.id);

        if (!error) {
          setUserData({
            ...userData,
            taskprogression: newProgression
          });
        }
      }
    } catch (error) {
      console.error('Error updating task progression:', error);
    }
  };

  // Check for newly completed tasks and update progression
  useEffect(() => {
    if (!userData) return;

    const completedTasks = getCompletedTasks(userData);
    const currentProgression = userData.taskprogression || [];

    completedTasks.forEach(task => {
      if (!currentProgression.includes(task.id)) {
        updateTaskProgression(task.id);
      }
    });
  }, [userData]);

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
          Error loading dashboard
        </motion.div>
      </div>
    );
  }

  const level = getLevel(userData.xp);
  const xpInLevel = getXPInLevel(userData.xp);
  const xpToNextLevel = getXPToNextLevel(userData.xp);
  const completedTasks = getCompletedTasks(userData);
  const nextTask = getNextTask(userData);
  const taskProgress = getTaskProgress(userData);
  const allTasksCompleted = completedTasks.length === tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
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
            <FaTrophy className="text-yellow-400" />
            Dashboard
            <FaTrophy className="text-yellow-400" />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back, <span className="text-yellow-400 font-bold">{userData.username}</span> 👋
          </motion.p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaStar className="text-3xl text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{userData.xp}</div>
            <div className="text-purple-200">Total XP</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaFire className="text-3xl text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{userData.streak}</div>
            <div className="text-purple-200">Day Streak</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaCrown className="text-3xl text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">Level {level}</div>
            <div className="text-purple-200">Current Level</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaAward className="text-3xl text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{completedTasks.length}</div>
            <div className="text-purple-200">Tasks Completed</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <FaCoins className="text-3xl text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">{userData.gold || 0}</div>
            <div className="text-purple-200">Gold</div>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Level Progress</h2>
            <div className="text-purple-200">
              {xpInLevel}/100 XP to Level {level + 1}
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(xpInLevel / 100) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-purple-200">
              <span className="font-semibold">{xpToNextLevel}</span> XP needed
            </div>
            <div className="text-purple-200">
              <span className="font-semibold">{userData.xp}</span> total XP
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/revision">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-2xl text-white text-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBook className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Start Revision</h3>
              <p className="text-blue-100">Begin your study session</p>
            </motion.div>
          </Link>

          <Link to="/leaderboards">
            <motion.div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white text-center hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrophy className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Leaderboards</h3>
              <p className="text-yellow-100">See your ranking</p>
            </motion.div>
          </Link>

          <Link to="/timetable">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white text-center hover:from-green-600 hover:to-emerald-600 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCalendar className="text-4xl mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Timetable</h3>
              <p className="text-green-100">Plan your study</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div 
            className="p-6 cursor-pointer"
            onClick={() => setShowTasks(!showTasks)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
              <div className="flex items-center gap-4">
                <div className="text-purple-200">
                  {completedTasks.length}/{tasks.length} completed
                </div>
                {showTasks ? <FaChevronUp className="text-white" /> : <FaChevronDown className="text-white" />}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showTasks && (
              <motion.div
                className="px-6 pb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {tasks.map((task, index) => {
                    const isCompleted = task.condition(userData);
                    const IconComponent = task.icon;
                    
                    return (
                      <motion.div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            isCompleted ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            {isCompleted ? (
                              <FaCheck className="text-white text-xl" />
                            ) : (
                              <IconComponent className="text-white text-xl" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${
                              isCompleted ? 'text-green-200' : 'text-white'
                            }`}>
                              {task.title}
                            </h3>
                            <p className={`text-sm ${
                              isCompleted ? 'text-green-300' : 'text-purple-200'
                            }`}>
                              {task.description}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isCompleted ? 'text-green-400' : 'text-purple-300'
                            }`}>
                              +{task.reward} XP
                            </div>
                            {isCompleted && (
                              <div className="text-xs text-green-400">Completed!</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Missions Button - Show when all tasks completed */}
                {allTasksCompleted && (
                  <motion.div
                    className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center gap-4">
                      <FaFlag className="text-3xl text-purple-400" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">🎉 All Tasks Completed!</h3>
                        <p className="text-purple-200">Ready for more challenges? Check out the missions!</p>
                      </div>
                      <Link to="/missions">
                        <motion.button
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaArrowRight className="inline mr-2" />
                          Go to Missions
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subjects */}
        {userData.subjects && userData.subjects.length > 0 && (
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.subjects.filter(subj => subj.name).map((subj, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-4 border border-purple-400/30"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                >
                  <h3 className="text-lg font-bold text-white mb-2">{subj.name}</h3>
                  {subj.examBoard && subj.examBoard !== "I don't know" && (
                    <p className="text-purple-200 text-sm">Board: {subj.examBoard}</p>
                  )}
                  {subj.tier && subj.tier !== "" && (
                    <p className="text-purple-200 text-sm">Tier: {subj.tier}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        {nextTask && !allTasksCompleted && (
          <motion.div
            className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center gap-4">
              <FaRocket className="text-3xl text-yellow-400" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Next Task</h3>
                <p className="text-yellow-200">{nextTask.title}</p>
                <p className="text-yellow-300 text-sm">{nextTask.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">+{nextTask.reward} XP</div>
                <div className="text-xs text-yellow-300">Reward</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
