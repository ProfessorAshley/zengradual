import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseclient';
import '../App.css';

function Navbar({ session }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // simple and works
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  return (
    <nav className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-purple-700">ZenGradual</h1>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="text-gray-700 hover:text-purple-600">Home</Link>
        <Link to="/dashboard" className="text-gray-700 hover:text-purple-600">Dashboard</Link>
        <Link to="/planner" className="text-gray-700 hover:text-purple-600">Planner</Link>
        <Link to="/journal" className="text-gray-700 hover:text-purple-600">Journal</Link>

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
                <Link
                  to="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Profile
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
