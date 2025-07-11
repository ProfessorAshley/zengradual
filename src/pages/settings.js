import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseclient';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Settings Component
 * Manages user profile, appearance, and account settings
 * Organized into distinct sections for better maintainability
 */
const Settings = () => {
  // ==================== STATE MANAGEMENT ====================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile state - separate from UI state to prevent re-renders during typing
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    email: ''
  });
  
  // UI state - only triggers when actually changed
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true
  });
  
  // Feedback state
  const [message, setMessage] = useState({ type: '', text: '' });

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get user session');
          return;
        }

        if (!session) {
          setError('No active session found');
          return;
        }

        setUser(session.user);

        // Fetch user profile data including dark_mode preference
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, bio, email, dark_mode')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('User data fetch error:', userError);
          setError('Failed to load user data');
          return;
        }

        // Update profile state
        setProfile({
          username: userData?.username || '',
          bio: userData?.bio || '',
          email: session.user.email || ''
        });

        // Set dark mode from database (fallback to localStorage if not in DB)
        const dbDarkMode = userData?.dark_mode;
        const localDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(dbDarkMode !== null ? dbDarkMode : localDarkMode);

        // Load notification preferences from localStorage
        const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
        setNotifications(prev => ({ ...prev, ...savedNotifications }));

        setLoading(false);

      } catch (err) {
        console.error('Unexpected error in fetchUserData:', err);
        setError('Failed to load settings');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ==================== UTILITY FUNCTIONS ====================
  /**
   * Shows a temporary message to the user
   * @param {string} type - 'success' or 'error'
   * @param {string} text - Message text to display
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Handles dark mode toggle with database persistence
   * Updates both local state and database
   */
  const handleDarkModeToggle = async () => {
    if (!user) {
      showMessage('error', 'No user session found');
      return;
    }

    const newDarkMode = !darkMode;
    
    try {
      // Update database first
      const { error } = await supabase
        .from('users')
        .update({ dark_mode: newDarkMode })
        .eq('id', user.id);

      if (error) {
        console.error('Dark mode update error:', error);
        showMessage('error', 'Failed to save theme preference');
        return;
      }

      // Update local state and localStorage
      setDarkMode(newDarkMode);
      localStorage.setItem('darkMode', newDarkMode.toString());
      showMessage('success', 'Theme updated!');
      
    } catch (err) {
      console.error('Dark mode toggle error:', err);
      showMessage('error', 'Failed to update theme');
    }
  };

  /**
   * Handles notification toggle with localStorage persistence
   * @param {string} key - Notification setting key
   */
  const handleNotificationToggle = (key) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    showMessage('success', 'Notification settings updated!');
  };

  // ==================== PROFILE MANAGEMENT ====================
  /**
   * Updates user profile information in the database
   * Includes validation and error handling
   */
  const updateProfile = async () => {
    if (!user) {
      showMessage('error', 'No user session found');
      return;
    }

    // Basic validation
    if (!profile.username.trim()) {
      showMessage('error', 'Username cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          username: profile.username.trim(),
          bio: profile.bio.trim()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        showMessage('error', 'Failed to update profile');
        return;
      }

      showMessage('success', '✅ Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      showMessage('error', 'Failed to update profile');
    }
  };

  // ==================== ACCOUNT MANAGEMENT ====================
  /**
   * Resets all user statistics with confirmation
   * Includes safety confirmation dialog
   */
  const resetStats = async () => {
    if (!user) {
      showMessage('error', 'No user session found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset all your stats? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ xp: 0, streak: 0 })
        .eq('id', user.id);

      if (error) {
        console.error('Stats reset error:', error);
        showMessage('error', 'Failed to reset stats');
        return;
      }

      showMessage('success', '🧹 Stats reset successfully!');
    } catch (err) {
      console.error('Stats reset error:', err);
      showMessage('error', 'Failed to reset stats');
    }
  };

  /**
   * Updates user email address with validation
   * Sends confirmation email to new address
   */
  const updateEmail = async () => {
    if (!user) {
      showMessage('error', 'No user session found');
      return;
    }

    const newEmail = prompt('Enter new email address:');
    if (!newEmail) return;

    // Basic email validation
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      showMessage('error', 'Please enter a valid email address');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) {
        console.error('Email update error:', error);
        showMessage('error', 'Failed to update email');
        return;
      }

      showMessage('success', '📧 Email change requested! Check your inbox.');
    } catch (err) {
      console.error('Email update error:', err);
      showMessage('error', 'Failed to update email');
    }
  };

  /**
   * Updates user password with validation
   * Ensures minimum password strength
   */
  const updatePassword = async () => {
    if (!user) {
      showMessage('error', 'No user session found');
      return;
    }

    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.error('Password update error:', error);
        showMessage('error', 'Failed to update password');
        return;
      }

      showMessage('success', '🔐 Password updated successfully!');
    } catch (err) {
      console.error('Password update error:', err);
      showMessage('error', 'Failed to update password');
    }
  };

  // ==================== UI COMPONENTS ====================
  /**
   * Profile section component
   * Handles username, bio, and email display
   * Uses controlled inputs with proper state management
   */
  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Profile Information</h3>
        
        <div className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter your username"
              maxLength={30}
            />
          </div>
          
          {/* Bio Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {profile.bio.length}/200 characters
            </p>
          </div>
          
          {/* Email Display (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the "Change Email" option below to update
            </p>
          </div>
        </div>
        
        {/* Save Button */}
        <motion.button
          onClick={updateProfile}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
        >
          💾 Save Changes
        </motion.button>
      </div>
    </div>
  );

  /**
   * Appearance section component
   * Handles dark mode toggle with database persistence
   */
  const AppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Appearance</h3>
        
        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Dark Mode</h4>
              <p className="text-sm text-gray-600">Switch between light and dark themes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Notifications section component
   * Handles notification preferences with localStorage persistence
   */
  const NotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Notifications</h3>
        
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-800 capitalize">{key}</h4>
                <p className="text-sm text-gray-600">
                  {key === 'email' && 'Receive email notifications'}
                  {key === 'push' && 'Receive push notifications'}
                  {key === 'reminders' && 'Get daily learning reminders'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Dangerous actions section component
   * Handles account security operations with confirmation dialogs
   */
  const DangerousSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Dangerous Zone</h3>
        <p className="text-sm text-gray-600 mb-4">These actions cannot be undone</p>
        
        <div className="space-y-3">
          {/* Reset Stats Button */}
          <motion.button
            onClick={resetStats}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            🧹 Reset All Stats
          </motion.button>
          
          {/* Change Password Button */}
          <motion.button
            onClick={updatePassword}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            🔐 Change Password
          </motion.button>
          
          {/* Change Email Button */}
          <motion.button
            onClick={updateEmail}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            📧 Change Email
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  // Loading state with smooth animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </motion.div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ {error}</h2>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Tab configuration
  const tabs = {
    Profile: <ProfileSection />,
    Appearance: <AppearanceSection />,
    Notifications: <NotificationsSection />,
    Dangerous: <DangerousSection />
  };

  // Main settings interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-50 p-4 sm:p-8">
      <motion.div
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            ⚙️ Settings
          </motion.h1>
          <motion.p 
            className="text-purple-100 mt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Manage your account and preferences
          </motion.p>
        </div>

        {/* Tab Navigation and Content */}
        <div className="p-6">
          <Tab.Group>
            {/* Tab Navigation */}
            <Tab.List className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
              {Object.keys(tabs).map((tab, index) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all duration-200 focus:outline-none ${
                      selected
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/[0.5]'
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

            {/* Tab Panels with smooth transitions */}
            <Tab.Panels>
              {Object.values(tabs).map((panel, idx) => (
                <Tab.Panel 
                  key={idx} 
                  className="rounded-lg"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {panel}
                  </motion.div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>

          {/* Message Display with smooth animations */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                className={`mt-4 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
