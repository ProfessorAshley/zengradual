import React, { useState } from 'react';
import { supabase } from '../supabaseclient';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError('Sign-up failed: ' + signUpError.message);
      setIsSubmitting(false);
      return;
    }

    const user = data?.user;
    if (!user) {
      setError('Sign-up succeeded, but user data was not returned.');
      setIsSubmitting(false);
      return;
    }

    // Insert user profile
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        username: username,
        xp: 0,
        streak: 0,
        subjects: [],
        first_name: firstName,
        last_name: lastName,
      },
    ]);

    if (insertError) {
      setError('User account created, but profile setup failed: ' + insertError.message);
    } else {
      setShowModal(true); // Show confirmation modal
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-8">
      {/* Auth Box */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? 'Login to ZenGradual' : 'Sign Up for ZenGradual'}
        </h2>

        {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-2 mt-1 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white p-2 rounded-md transition ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 text-white text-center max-w-lg">
        <h3 className="text-xl font-bold mb-2">Why ZenGradual?</h3>
        <p className="text-sm">
          ZenGradual helps you stay consistent with revision using gamified XP,
          streaks, and progress tracking. Build your streak, earn rewards, and
          rise through the leaderboard!
        </p>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showModal} onClose={() => {}} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-2">Confirm Your Email</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              We’ve sent a confirmation email to <span className="font-medium">{email}</span>.
              Please check your inbox to verify your account before logging in.
            </Dialog.Description>
            <button
              onClick={() => {
                setShowModal(false);
                navigate('/');
              }}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Got it
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AuthPage;
