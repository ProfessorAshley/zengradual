import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}


// Navbar partially made by AI i hate messing with components

const NAV_LINKS = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Planner', to: '/planner', dropdown: [
    { name: 'Journal', to: '/journal' },
    { name: 'Timetable', to: '/timetable' },
  ]},
  { name: 'Revision', to: '/revision', dropdown: [
    { name: 'Lessons', to: '/lessons' },
    { name: 'Leaderboards', to: '/leaderboards' },
  ]},
];

function Navbar({ session }) {
  const [username, setUsername] = useState('');
  const [mounted, setMounted] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null); // for desktop hover
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownTimeout = useRef();

  // Fetch user info
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setUsername(data.username);
        }
      }
      setMounted(true);
    };
    fetchUserDetails();
  }, [session]);

  // Animated underline for active link
  const isActive = (to) => location.pathname.startsWith(to);

  // Modern dropdown animation classes
  const dropdownAnim = {
    enter: 'transition ease-out duration-200',
    enterFrom: 'opacity-0 scale-95 -translate-y-2',
    enterTo: 'opacity-100 scale-100 translate-y-0',
    leave: 'transition ease-in duration-100',
    leaveFrom: 'opacity-100 scale-100 translate-y-0',
    leaveTo: 'opacity-0 scale-95 -translate-y-2',
  };

  // Dark glassmorphism style
  const glass = 'backdrop-blur-md bg-black/95 shadow-2xl border-b border-gray-900';

  // Desktop hover handlers for dropdowns
  const handleDropdownEnter = (name) => {
    clearTimeout(dropdownTimeout.current);
    setHoveredDropdown(name);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setHoveredDropdown(null), 120);
  };

  return (
    // I spent too much time on this, and it kinda works so who cares also padding is a pain to work with :(
    <Disclosure as="nav" className={classNames(glass, 'z-50 transition-colors duration-300')}> 
      {({ open }) => (
        <>
          {/* Navbar container with entrance animation */}
          <Transition
            appear
            show={mounted}
            enter="transition-all duration-500"
            enterFrom="-translate-y-10 opacity-0"
            enterTo="translate-y-0 opacity-100"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
                  ZenGradual
                </Link>

                {/* Desktop Nav */}
                <div className="hidden sm:flex space-x-2 items-center font-medium text-sm">
                  {NAV_LINKS.map((link) => (
                    <div
                      key={link.name}
                      className="relative flex items-center"
                      onMouseEnter={() => link.dropdown && handleDropdownEnter(link.name)}
                      onMouseLeave={() => link.dropdown && handleDropdownLeave()}
                    >
                      <Link
                        to={link.to}
                        className={classNames(
                          'px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1',
                          isActive(link.to)
                            ? 'text-purple-200 font-bold' : 'text-gray-200 hover:text-purple-300',
                          'relative'
                        )}
                        // On desktop, clicking always navigates
                      >
                        {link.name}
                        {link.dropdown && (
                          <FaChevronDown className={classNames('text-xs mt-0.5 transition-transform duration-200', hoveredDropdown === link.name ? 'rotate-180' : '')} />
                        )}
                        {/* Animated underline */}
                        <span
                          className={classNames(
                            'absolute left-1/2 -translate-x-1/2 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300',
                            isActive(link.to) ? 'w-8 opacity-100' : 'w-0 opacity-0',
                          )}
                        />
                      </Link>
                      {/* Desktop Dropdown (hover) */}
                      {link.dropdown && (
                        <Transition
                          show={hoveredDropdown === link.name}
                          as={Fragment}
                          {...dropdownAnim}
                        >
                          {/* Dropdown moved lower with extra margin and padding to avoid overlap and allow button click */}
                          <div className="absolute top-6 mt-5 pt-2 w-44 rounded-xl shadow-2xl bg-black/95 border border-gray-900 origin-top-left z-20 overflow-hidden">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.name}
                                to={item.to}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-all duration-150"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </Transition>
                      )}
                    </div>
                  ))}

                  {/* Account Dropdown */}
                  {session ? (
                    <Menu as="div" className="relative ml-2">
                      <Menu.Button className="text-sm bg-gray-800 text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm">
                        {username || 'Account'}
                      </Menu.Button>
                      <Transition as={Fragment} {...dropdownAnim}>
                        <Menu.Items className="absolute right-0 mt-2 w-44 bg-black/95 border border-gray-900 rounded-xl shadow-2xl z-20 origin-top-right focus:outline-none overflow-hidden">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => navigate(`/profile/${username}`)}
                                className={classNames(
                                  active ? 'bg-purple-900 text-purple-200 scale-105' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-all duration-150 rounded-md'
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
                                  active ? 'bg-purple-900 text-purple-200 scale-105' : '',
                                  'block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-all duration-150 rounded-md'
                                )}
                              >
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={async () => {
                                  const { error } = await supabase.auth.signOut();
                                  if (!error) navigate('/login');
                                }}
                                className={classNames(
                                  active ? 'bg-purple-900 text-purple-200 scale-105' : '',
                                  'w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-all duration-150 rounded-md'
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
                      className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-all duration-200 shadow-sm ml-2"
                    >
                      Log In
                    </Link>
                  )}
                </div>

                {/* Mobile Button */}
                <div className="sm:hidden flex items-center gap-2">
                  <Disclosure.Button
                    className="text-sm px-4 py-2 border border-gray-700 rounded-lg transition-colors duration-200 bg-gray-900/90 text-gray-100 shadow-md"
                  >
                    {open ? 'Close Menu' : 'Open Menu'}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </Transition>

          {/* Mobile Nav - animated slide in */}
          <Transition
            show={open}
            enter="transition-all duration-400"
            enterFrom="-translate-y-8 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition-all duration-300"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="-translate-y-8 opacity-0"
          >
            <Disclosure.Panel className="sm:hidden bg-black/98 border-t border-gray-900 px-4 pt-4 pb-2 text-sm space-y-2 transition-colors duration-300 shadow-xl rounded-b-2xl">
              {NAV_LINKS.map((link) => (
                <div key={link.name} className="mb-1">
                  {!link.dropdown ? (
                    <Link
                      to={link.to}
                      className={classNames(
                        'block px-3 py-2 rounded-lg transition-all duration-200',
                        isActive(link.to)
                          ? 'text-purple-200 font-bold' : 'text-gray-200 hover:text-purple-300',
                        'relative'
                      )}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <Menu as="div" className="relative w-full">
                      <Menu.Button className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-200 hover:text-purple-300 w-full text-left">
                        {link.name}
                        <FaChevronDown className="text-xs mt-0.5 transition-transform duration-200" />
                      </Menu.Button>
                      <Transition as={Fragment} {...dropdownAnim}>
                        <Menu.Items className="absolute left-0 mt-1 w-44 rounded-xl shadow-2xl bg-black/98 border border-gray-900 origin-top-left z-20 overflow-hidden">
                          {link.dropdown.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.to}
                                  className={classNames(
                                    'block px-4 py-2 text-sm',
                                    active ? 'bg-purple-900 text-purple-200' : 'text-gray-200 hover:bg-gray-800',
                                    'transition-all duration-150'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              ))}
              {session ? (
                <>
                  <Link to={`/profile/${username}`} className="block px-3 py-2 rounded-lg text-gray-100 hover:text-purple-300">View Profile</Link>
                  <Link to="/settings" className="block px-3 py-2 rounded-lg text-gray-100 hover:text-purple-300">Settings</Link>
                  <button
                    onClick={async () => {
                      const { error } = await supabase.auth.signOut();
                      if (!error) navigate('/login');
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800">
                  Log In
                </Link>
              )}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
