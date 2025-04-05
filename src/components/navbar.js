import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '../App.css';

function Navbar() {
  return (
    <nav className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-purple-700">ZenGradual</h1>
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-purple-600">Home</Link>
        <Link to="/dashboard" className="text-gray-700 hover:text-purple-600">Dashboard</Link>
        <Link to="/planner" className="text-gray-700 hover:text-purple-600">Planner</Link>
        <Link to="/journal" className="text-gray-700 hover:text-purple-600">Journal</Link>
      </div>
    </nav>
  );
}

export default Navbar;