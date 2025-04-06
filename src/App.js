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
    setSession(user.id);  // TODO: fix it to determine Sign Up or Sign In. Sign Up seems required user's email confirmation
  }
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);  // Once the session is fetched, set loading to false
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);  // Update loading state when session changes
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // Show a loading indicator or spinner while session is being fetched, :D
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar session={session} />
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/dashboard" element={session ? <Dashboard /> : <AuthPage setUser={setUser} />} />
          <Route path="/planner" element={session ? <Planner /> : <AuthPage setUser={setUser}  />} />
          <Route path="/journal" element={session ? <Journal /> : <AuthPage  setUser={setUser} />} />
          <Route path="/login" element={<AuthPage setUser={setUser}  />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
