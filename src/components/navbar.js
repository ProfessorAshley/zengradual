import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Navbar({ session }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  return (
    <nav className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center relative z-50">
      <Link to="/">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
          ZenGradual
        </h1>
      </Link>

      <div className="space-x-4 flex items-center">
        <Link to="/dashboard" className="text-gray-700 hover:text-purple-600">Dashboard</Link>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="text-gray-700 hover:text-purple-600">
              <Link to="/planner">Planner</Link>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute z-10 mt-2 w-40 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/journal"
                      className={`${
                        active ? 'bg-gray-100' : 'text-gray-700'
                      } block px-4 py-2 text-sm`}
                    >
                      Journal
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/timetable"
                      className={`${
                        active ? 'bg-gray-100' : 'text-gray-700'
                      } block px-4 py-2 text-sm`}
                    >
                      Timetable
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="text-gray-700 hover:text-purple-600">
              <Link to="/revision">Revision</Link>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute z-10 mt-2 w-40 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <><Link
                      to="/lessons"
                      className={`${active ? 'bg-gray-100' : 'text-gray-700'} block px-4 py-2 text-sm`}
                    >
                      Lessons
                    </Link><Link
                      to="/leaderboards"
                      className={`${active ? 'bg-gray-100' : 'text-gray-700'} block px-4 py-2 text-sm`}
                    >
                        Leaderboards
                      </Link></>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {session ? (
          <div className="relative ml-4">
            <button
              onClick={toggleDropdown}
              className="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 transition"
            >
              {session.user.email}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md z-10">
                <button
                  onClick={() => navigate(`/profile/${session.users}`)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </button>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;