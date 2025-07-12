import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMedal, FaCrown, FaTrophy, FaAward, FaFire, FaStar, FaSearch, FaFilter, FaCalendar, FaUsers, FaChartLine, FaRocket, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Listbox, Transition } from '@headlessui/react';

const Leaderboards = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('xp');
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'xp', label: 'Sort by XP' }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch leaderboard data
        const { data, error } = await supabase
          .from('users')
          .select('username, xp, created_at')
          .order('xp', { ascending: false })
          .limit(100);

        if (data) {
          setUsers(data);
          setFilteredUsers(data);
          
          // Find current user's rank
          if (user) {
            const userIndex = data.findIndex(u => u.username === user.email?.split('@')[0]);
            setUserRank(userIndex !== -1 ? userIndex + 1 : null);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.created_at) >= filterDate
      );
    }

    // Sort (only by XP for now)
    filtered.sort((a, b) => b.xp - a.xp);

    setFilteredUsers(filtered);
  }, [users, searchTerm, timeFilter, sortBy]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaCrown className="text-3xl text-yellow-400" />;
      case 2: return <FaTrophy className="text-2xl text-gray-400" />;
      case 3: return <FaMedal className="text-2xl text-orange-500" />;
      default: return <FaAward className="text-xl text-purple-400" />;
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      const colors = ['bg-gradient-to-r from-yellow-400 to-yellow-600', 'bg-gradient-to-r from-gray-400 to-gray-600', 'bg-gradient-to-r from-orange-400 to-orange-600'];
      return `text-white ${colors[rank - 1]}`;
    }
    return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
  };

  const getLevel = (xp) => Math.floor(xp / 100) + 1;

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

      <div className="relative z-10">
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
            Leaderboards
            <FaTrophy className="text-yellow-400" />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Compete with the best learners
          </motion.p>
        </motion.div>

        {/* Current User Rank Card */}
        {userRank && (
          <motion.div
            className="max-w-md mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-1 rounded-2xl shadow-2xl">
              <div className="bg-gray-900 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <FaFire className="text-2xl text-orange-400 animate-pulse" />
                  <span className="text-white font-bold text-lg">Your Rank</span>
                  <FaFire className="text-2xl text-orange-400 animate-pulse" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">#{userRank}</div>
                <div className="text-purple-200">
                  {users[userRank - 1]?.xp || 0} XP
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          className="max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Time Filter */}
              <Listbox value={timeFilter} onChange={setTimeFilter}>
                <div className="relative">
                  <Listbox.Button className="relative w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-left">
                    <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                    <span className="block truncate">
                      {timeOptions.find(option => option.value === timeFilter)?.label}
                    </span>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                  </Listbox.Button>
                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-in"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {timeOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 px-4 ${
                              active ? 'bg-purple-600 text-white' : 'text-white'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {option.label}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              {/* Toggle Stats */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <FaChartLine />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        {showStats && (
          <motion.div
            className="max-w-4xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <FaUsers className="text-3xl text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">{filteredUsers.length}</div>
              <div className="text-purple-200">Active Players</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {filteredUsers[0]?.xp || 0}
              </div>
              <div className="text-purple-200">Highest XP</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <FaChartLine className="text-3xl text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {Math.floor(filteredUsers.reduce((sum, user) => sum + user.xp, 0) / filteredUsers.length) || 0}
              </div>
              <div className="text-purple-200">Average XP</div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white text-center">Top Performers</h2>
            </div>
            
            <div className="divide-y divide-white/10">
              <AnimatePresence>
                {filteredUsers.map((user, index) => {
                  const isTop3 = index < 3;
                  const isCurrentUser = currentUser && user.username === currentUser.email?.split('@')[0];
                  const rank = index + 1;
                  const level = getLevel(user.xp);

                  return (
                    <motion.div
                      key={user.username}
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-l-4 border-yellow-400' 
                          : isTop3 
                            ? 'bg-gradient-to-r from-purple-400/10 to-pink-400/10' 
                            : 'hover:bg-white/5'
                      }`}
                      whileHover={{ 
                        scale: 1.02, 
                        x: 10,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                      }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <div className="flex items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                              isTop3 ? getRankBadge(rank) : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
                            }`}>
                              {rank}
                            </div>
                            {isTop3 && (
                              <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                {getRankIcon(rank)}
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-lg">{user.username}</span>
                                {isCurrentUser && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                  >
                                    <FaStar className="text-yellow-400 text-sm" />
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-purple-200 text-sm">
                                <span>Level {level}</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                                    style={{ width: `${(user.xp % 100) / 100 * 100}%` }}
                                  />
                                </div>
                                <span>{user.xp % 100}/100 XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{user.xp}</div>
                          <div className="text-purple-200 text-sm">XP</div>
                        </div>
                      </div>
                      
                      {isCurrentUser && (
                        <motion.div
                          className="absolute inset-0 border-2 border-yellow-400 rounded-lg"
                          animate={{ 
                            boxShadow: ["0 0 0 rgba(255, 215, 0, 0.4)", "0 0 20px rgba(255, 215, 0, 0.8)", "0 0 0 rgba(255, 215, 0, 0.4)"]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboards;
