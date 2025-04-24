import React, { useEffect, useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { Disclosure, Menu, Transition } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar({ session }) {
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('username, dark_mode')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setUsername(data.username);
          setDarkMode(data.dark_mode);

          // Set dark mode class
          if (data.dark_mode) {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    };

    fetchUserDetails();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
                ZenGradual
              </Link>

              {/* Desktop Nav */}
              <div className="hidden sm:flex space-x-6 items-center font-medium text-sm">
                <Link to="/dashboard" className="hover:text-purple-600 dark:text-white dark:hover:text-purple-400 transition">Dashboard</Link>

                {/* Planner Menu */}
                <div className="relative group">
                  <Link to="/planner" className="hover:text-purple-600 dark:text-white dark:hover:text-purple-400 transition">
                    Planner
                  </Link>
                  <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-md mt-2 w-40 z-10 border dark:border-gray-700">
                    <Link to="/journal" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Journal</Link>
                    <Link to="/timetable" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Timetable</Link>
                  </div>
                </div>

                {/* Revision Menu */}
                <div className="relative group">
                  <Link to="/revision" className="hover:text-purple-600 dark:text-white dark:hover:text-purple-400 transition">
                    Revision
                  </Link>
                  <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-md mt-2 w-40 z-10 border dark:border-gray-700">
                    <Link to="/lessons" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Lessons</Link>
                    <Link to="/leaderboards" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Leaderboards</Link>
                  </div>
                </div>

                {/* Account */}
                {session ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="text-sm bg-gray-100 dark:bg-gray-700 dark:text-white px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                      {username || 'Account'}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100 transform"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-75 transform"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => navigate(`/profile/${username}`)}
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                              )}
                            >
                              View Profile
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                              )}
                            >
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400'
                              )}
                            >
                              Log Out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    to="/login"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                  >
                    Log In
                  </Link>
                )}
              </div>

              {/* Mobile Button */}
              <div className="sm:hidden">
                <Disclosure.Button className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                  {open ? 'Close Menu' : 'Open Menu'}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <Disclosure.Panel className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-2 text-sm space-y-2">
            <Link to="/dashboard" className="block text-gray-700 dark:text-white hover:text-purple-600">Dashboard</Link>
            <Link to="/planner" className="block text-gray-700 dark:text-white hover:text-purple-600">Planner</Link>
            <Link to="/journal" className="block text-gray-700 dark:text-white hover:text-purple-600">Journal</Link>
            <Link to="/timetable" className="block text-gray-700 dark:text-white hover:text-purple-600">Timetable</Link>
            <Link to="/revision" className="block text-gray-700 dark:text-white hover:text-purple-600">Revision</Link>
            <Link to="/lessons" className="block text-gray-700 dark:text-white hover:text-purple-600">Lessons</Link>
            <Link to="/leaderboards" className="block text-gray-700 dark:text-white hover:text-purple-600">Leaderboards</Link>
            {session ? (
              <>
                <Link to={`/profile/${username}`} className="block text-gray-700 dark:text-white hover:text-purple-600">View Profile</Link>
                <Link to="/settings" className="block text-gray-700 dark:text-white hover:text-purple-600">Settings</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                Log In
              </Link>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
