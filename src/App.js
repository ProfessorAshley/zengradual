import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { supabase } from './supabaseclient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      setSession(session);
      setLoading(false);
    };
  
    init();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  

  const { badge, dismiss } = useBadgeSystem(userProfile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100">
        <Navbar session={session} />
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
          <Route path="/login" element={<AuthPage />} />
        </Routes>

        {/* 🏅 Badge Notification */}
        {badge && <BadgePopup badge={badge} onClose={dismiss} />}
      </div>
    </Router>
  );
}

export default App;
