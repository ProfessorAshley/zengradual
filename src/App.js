import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import Navbar from './components/navbar';
import BadgePopup from './components/badgepopup';
import { useBadgeSystem } from './components/usebadgesystem';

import PublicHome from './pages/publichome';
import Dashboard from './pages/dashboard';
import Planner from './pages/planner';
import Journal from './pages/journal';
import AuthPage from './pages/authpage';
import Leaderboards from './pages/leaderboards';
import Revision from './pages/revision';
import Lessons from './pages/lessons';
import Admin from './pages/admin';
import Profile from './pages/profile';
import Settings from './pages/settings';
import LessonView from './pages/lessonview';
import Timetable from './pages/timetable';
import Drill from './pages/drill';
import Missions from './pages/missions';
import Shop from './pages/shop';
import { supabase } from './supabaseclient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Initializing authentication...');
        
        // Test Supabase connection first
        try {
          const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
          
          if (testError) {
            console.error('Supabase connection test failed:', testError);
            setError(`Database connection failed: ${testError.message}`);
            setLoading(false);
            return;
          }
          
          console.log('Supabase connection test successful');
        } catch (testErr) {
          console.error('Supabase connection test error:', testErr);
          setError(`Connection test failed: ${testErr.message}`);
          setLoading(false);
          return;
        }
        
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();
    
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(`Authentication error: ${sessionError.message}`);
          setLoading(false);
          return;
        }
        
        console.log('Session retrieved:', session ? 'User logged in' : 'No session');
        setSession(session);
        setLoading(false);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(`Failed to initialize authentication: ${err.message}`);
        setLoading(false);
      }
    };
  
    init();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'User logged in' : 'No session');
      setSession(session);
      setLoading(false);
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const { badge, dismiss } = useBadgeSystem(userProfile);

  // Enhanced loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.h2
            className="text-2xl font-bold text-purple-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ZenGradual
          </motion.h2>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Loading your learning journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100">
        <Navbar session={session} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <AuthPage />} />
            <Route path="/planner" element={session ? <Planner session={session} /> : <AuthPage />} />
            <Route path="/journal" element={session ? <Journal user={session.user} /> : <AuthPage />} />
            <Route path="/revision" element={session ? <Revision /> : <AuthPage />} />
            <Route path="/timetable" element={session ? <Timetable /> : <AuthPage />} />
            <Route path="/leaderboards" element={session ? <Leaderboards /> : <AuthPage />} />
            <Route path="/settings" element={session ? <Settings /> : <AuthPage />} />
            <Route path="/admin" element={session ? <Admin /> : <AuthPage />} />
            <Route path="/profile/:username" element={session ? <Profile /> : <AuthPage />} />
            <Route path="/lessons" element={session ? <Lessons user={session.user} /> : <AuthPage />} />
            <Route path="/lessonview/:subject/:topic/:title" element={session ? <LessonView user={session.user} /> : <AuthPage />} />
            <Route path="/drill/:subject/:topic/:count" element={session ? <Drill user={session.user} /> : <AuthPage />} />
            <Route path="/missions" element={session ? <Missions /> : <AuthPage />} />
            <Route path="/shop" element={session ? <Shop /> : <AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </AnimatePresence>

        {/* 🏅 Badge Notification */}
        {badge && <BadgePopup badge={badge} onClose={dismiss} />}
      </div>
    </Router>
  );
}

export default App;
