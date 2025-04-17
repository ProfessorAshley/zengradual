import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar';
import PublicHome from './pages/publichome';
import Dashboard from './pages/dashboard';
import Planner from './pages/planner';
import Journal from './pages/journal';
import AuthPage from './pages/authpage';
import { supabase } from './supabaseclient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (user) => {
    console.log("DBEUG: user is set");
    setSession(user.id);
  }
  
  useEffect(() => {
    // session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Auth state change listener
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
          <Route path="/journal" element={session ? <Journal session={session} /> : <AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
