import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCoins, FaShoppingCart, FaGift, FaStar, FaFire, FaCrown, FaMedal, FaAward, FaGem, FaRocket, FaMagic, FaPalette, FaMusic, FaBook, FaTrophy, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const Shop = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalGold, setTotalGold] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Shop items (placeholders for now)
  const shopItems = [
    // Avatars
    {
      id: 'avatar_1',
      name: "Golden Avatar",
      description: "A shiny golden avatar frame",
      category: 'avatars',
      price: 100,
      icon: FaCrown,
      color: 'from-yellow-400 to-orange-500',
      rarity: 'rare'
    },
    {
      id: 'avatar_2',
      name: "Fire Avatar",
      description: "Burning hot avatar frame",
      category: 'avatars',
      price: 150,
      icon: FaFire,
      color: 'from-red-500 to-orange-500',
      rarity: 'epic'
    },
    {
      id: 'avatar_3',
      name: "Crystal Avatar",
      description: "Sparkling crystal avatar frame",
      category: 'avatars',
      price: 200,
      icon: FaGem,
      color: 'from-purple-500 to-pink-500',
      rarity: 'legendary'
    },
    
    // Themes
    {
      id: 'theme_1',
      name: "Dark Theme",
      description: "A sleek dark theme for the app",
      category: 'themes',
      price: 75,
      icon: FaPalette,
      color: 'from-gray-700 to-gray-900',
      rarity: 'common'
    },
    {
      id: 'theme_2',
      name: "Neon Theme",
      description: "Bright neon colors everywhere",
      category: 'themes',
      price: 125,
      icon: FaMagic,
      color: 'from-cyan-400 to-purple-500',
      rarity: 'rare'
    },
    
    // Sound Effects
    {
      id: 'sound_1',
      name: "Victory Fanfare",
      description: "Epic victory sound when completing lessons",
      category: 'sounds',
      price: 50,
      icon: FaMusic,
      color: 'from-green-400 to-blue-500',
      rarity: 'common'
    },
    {
      id: 'sound_2',
      name: "Level Up Sound",
      description: "Satisfying level up sound effect",
      category: 'sounds',
      price: 80,
      icon: FaStar,
      color: 'from-yellow-400 to-orange-500',
      rarity: 'rare'
    },
    
    // XP Boosters
    {
      id: 'booster_1',
      name: "XP Doubler",
      description: "Double XP for 1 hour",
      category: 'boosters',
      price: 200,
      icon: FaRocket,
      color: 'from-purple-500 to-pink-500',
      rarity: 'epic'
    },
    {
      id: 'booster_2',
      name: "Streak Protector",
      description: "Protect your streak for 24 hours",
      category: 'boosters',
      price: 150,
      icon: FaShieldAlt,
      color: 'from-blue-500 to-cyan-500',
      rarity: 'rare'
    },
    
    // Special Items
    {
      id: 'special_1',
      name: "Mystery Box",
      description: "Random reward - could be anything!",
      category: 'special',
      price: 300,
      icon: FaGift,
      color: 'from-pink-500 to-purple-500',
      rarity: 'legendary'
    },
    {
      id: 'special_2',
      name: "Golden Ticket",
      description: "Unlock exclusive content",
      category: 'special',
      price: 500,
      icon: FaTrophy,
      color: 'from-yellow-500 to-orange-500',
      rarity: 'legendary'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: FaShoppingCart },
    { id: 'avatars', name: 'Avatars', icon: FaCrown },
    { id: 'themes', name: 'Themes', icon: FaPalette },
    { id: 'sounds', name: 'Sounds', icon: FaMusic },
    { id: 'boosters', name: 'Boosters', icon: FaRocket },
    { id: 'special', name: 'Special', icon: FaGift }
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

  const purchaseItem = async (item) => {
    if (!userData || totalGold < item.price) return;

    try {
      const newGold = totalGold - item.price;
      
      // Add item to user's inventory (placeholder for now)
      const currentInventory = userData.inventory || [];
      const newInventory = [...currentInventory, item.id];

      const { error } = await supabase
        .from('users')
        .update({ 
          gold: newGold,
          inventory: newInventory
        })
        .eq('id', userData.id);

      if (!error) {
        setTotalGold(newGold);
        setUserData(prev => ({
          ...prev,
          gold: newGold,
          inventory: newInventory
        }));
        
        // Show success message (you could add a toast notification here)
        alert(`Successfully purchased ${item.name}!`);
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Failed to purchase item. Please try again.');
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

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
          Error loading shop
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-10 px-6 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 12 + 12,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
        
        {/* Golden sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-3 h-3 bg-yellow-400/40 rounded-full blur-sm"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [1, 1.8, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
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
            <FaShoppingCart className="text-yellow-400" />
            Shop
            <FaShoppingCart className="text-yellow-400" />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Spend your <span className="text-yellow-400 font-bold">Gold</span> on amazing items! 💰
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
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <FaCoins className="text-4xl text-yellow-400" />
              </motion.div>
              <div className="text-5xl font-bold text-white">{totalGold}</div>
            </div>
            <div className="text-yellow-200 text-lg font-semibold">Available Gold</div>
          </div>
        </motion.div>

        {/* Enhanced Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-lg ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20 border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="text-lg" />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Enhanced Shop Items Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {filteredItems.map((item, index) => {
            const IconComponent = item.icon;
            const canAfford = totalGold >= item.price;
            
            return (
              <motion.div
                key={item.id}
                className={`backdrop-blur-lg rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden ${
                  canAfford 
                    ? 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/50' 
                    : 'border-red-400/30 bg-red-500/10'
                }`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8, rotateY: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 blur-xl`}></div>
                
                <div className="relative z-10">
                  {/* Enhanced Item Icon */}
                  <div className="text-center mb-6">
                    <motion.div 
                      className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${item.color} mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <IconComponent className="text-white text-3xl" />
                    </motion.div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${getRarityColor(item.rarity)} bg-white/10 backdrop-blur-sm`}>
                      {item.rarity.toUpperCase()}
                    </div>
                  </div>

                  {/* Enhanced Item Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                    <p className="text-sm text-purple-200 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Enhanced Price and Purchase */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <FaCoins className="text-yellow-400 text-xl" />
                      </motion.div>
                      <span className="text-yellow-400 font-bold text-lg">{item.price}</span>
                    </div>
                    
                    {canAfford ? (
                      <motion.button
                        onClick={() => purchaseItem(item)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/30"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Buy
                      </motion.button>
                    ) : (
                      <div className="text-red-400 text-sm font-semibold bg-red-500/20 px-4 py-2 rounded-full">
                        Not enough gold
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
            <p className="text-purple-200">Try selecting a different category</p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="flex justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/missions">
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft />
              Back to Missions
            </motion.button>
          </Link>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          className="mt-8 text-center text-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <p className="text-sm">
            More items coming soon! Save your gold for future releases! 🎁
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Shop; 