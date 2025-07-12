import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [yearGroup, setYearGroup] = useState('');
  const [userType, setUserType] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  
  // New states for magic link and enhanced reset password
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        velocity: Math.random() * 3 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    setConfettiPieces(pieces);
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);
    generateConfetti();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    setAnimateIn(true);
    
    // Handle URL parameters for email confirmation and password reset
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    if (accessToken && refreshToken) {
      // Handle email confirmation or password reset
      handleAuthCallback(accessToken, refreshToken, type);
    }
  }, [location]);

  const handleAuthCallback = async (accessToken, refreshToken, type) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setError('Authentication failed: ' + error.message);
        return;
      }

      if (data?.user) {
        if (type === 'recovery') {
          // Password reset - redirect to dashboard
          navigate('/dashboard');
        } else {
          // Email confirmation - show success message
          setShowModal(true);
        }
      }
    } catch (error) {
      setError('Failed to complete authentication: ' + error.message);
    }
  };

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

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    if (!yearGroup || !userType) {
      setError('Please select your year group and user type');
      setIsSubmitting(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
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

    // Insert user profile with new fields
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        username: username,
        xp: 0,
        streak: 0,
        subjects: [],
        first_name: firstName,
        last_name: lastName,
        year: yearGroup,
        type: userType,
      },
    ]);

    if (insertError) {
      setError('User account created, but profile setup failed: ' + insertError.message);
    } else {
      setShowModal(true); // Show confirmation modal
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });

    if (error) {
      setForgotPasswordError('Failed to send reset email: ' + error.message);
    } else {
      setForgotPasswordSuccess(true);
      triggerConfetti(); // Trigger confetti animation
    }

    setIsSubmitting(false);
  };

  // New magic link handler
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setMagicLinkError('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    });

    if (error) {
      setMagicLinkError('Failed to send magic link: ' + error.message);
    } else {
      setMagicLinkSuccess(true);
      triggerConfetti(); // Trigger confetti animation
    }

    setIsSubmitting(false);
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess(false);
    setForgotPasswordError('');
  };

  const resetMagicLinkForm = () => {
    setShowMagicLink(false);
    setMagicLinkEmail('');
    setMagicLinkSuccess(false);
    setMagicLinkError('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFirstName('');
    setLastName('');
    setYearGroup('');
    setUserType('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-4 py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
                animation: `fall ${piece.velocity}s linear infinite`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Auth Box */}
      <div 
        className={`bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-700 ease-out ${
          animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Welcome Back' : 'Join ZenGradual'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Continue your learning journey' : 'Start your path to mastery'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="yearGroup" className="block text-sm font-medium text-gray-700">Year Group</label>
                  <select
                    id="yearGroup"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={yearGroup}
                    onChange={(e) => setYearGroup(e.target.value)}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="GCSE">GCSE</option>
                    <option value="ALEVEL">A Level</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    id="userType"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleAuthMode}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Enhanced Auth Options */}
        {isLogin && (
          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowMagicLink(true)}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Magic Link
              </button>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Reset Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className={`mt-8 text-white text-center max-w-lg transform transition-all duration-700 ease-out ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`} style={{ transitionDelay: '200ms' }}>
        <h3 className="text-2xl font-bold mb-3">Why ZenGradual?</h3>
        <p className="text-sm leading-relaxed opacity-90">
          ZenGradual helps you stay consistent with revision using gamified XP,
          streaks, and progress tracking. Build your streak, earn rewards, and
          rise through the leaderboard!
        </p>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showModal} onClose={() => {}} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transform transition-all duration-300">
            <Dialog.Title className="text-lg font-bold mb-2">Confirm Your Email</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              We've sent a confirmation email to <span className="font-medium">{email}</span>.
              Please check your inbox to verify your account before logging in.
            </Dialog.Description>
            <button
              onClick={() => {
                setShowModal(false);
                navigate('/');
              }}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Got it
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Enhanced Forgot Password Modal */}
      <Dialog open={showForgotPassword} onClose={resetForgotPasswordForm} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transform transition-all duration-300">
            {!forgotPasswordSuccess ? (
              <>
                <div className="text-center mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-bold mb-2">Reset Your Password</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600">
                    Enter your email address and we'll send you a secure link to reset your password.
                  </Dialog.Description>
                </div>
                
                {forgotPasswordError && (
                  <div className="text-red-500 mb-4 text-sm p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">{forgotPasswordError}</div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div className="mb-6">
                    <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForgotPasswordForm}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-bold mb-2 text-green-600">Check Your Email!</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 mb-6">
                    We've sent a password reset link to <span className="font-medium text-blue-600">{forgotPasswordEmail}</span>.
                    Please check your inbox and follow the instructions to reset your password.
                  </Dialog.Description>
                  <button
                    onClick={resetForgotPasswordForm}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Magic Link Modal */}
      <Dialog open={showMagicLink} onClose={resetMagicLinkForm} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transform transition-all duration-300">
            {!magicLinkSuccess ? (
              <>
                <div className="text-center mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-bold mb-2">Sign in with Magic Link</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600">
                    Enter your email and we'll send you a secure magic link to sign in instantly.
                  </Dialog.Description>
                </div>
                
                {magicLinkError && (
                  <div className="text-red-500 mb-4 text-sm p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">{magicLinkError}</div>
                )}

                <form onSubmit={handleMagicLink}>
                  <div className="mb-6">
                    <label htmlFor="magicEmail" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="magicEmail"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetMagicLinkForm}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Magic Link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-bold mb-2 text-green-600">Check Your Email!</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 mb-6">
                    We've sent a magic link to <span className="font-medium text-purple-600">{magicLinkEmail}</span>.
                    Click the link in your email to sign in instantly.
                  </Dialog.Description>
                  <button
                    onClick={resetMagicLinkForm}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
