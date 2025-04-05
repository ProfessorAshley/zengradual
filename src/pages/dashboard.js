import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '../App.css';

function Dashboard() {
    return (
      <div className="flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 to-purple-100 p-8 text-center">
        <h2 className="text-3xl font-semibold text-purple-700 mb-4">Welcome Back 👋</h2>
        <p className="text-gray-700 mb-2">Here's a quick look at your progress:</p>
        <ul className="text-gray-600 list-disc list-inside">
          <li>🧠 XP: 1245</li>
          <li>📘 Current Streak: 5 days</li>
          <li>📅 Upcoming Exam: Maths Paper 2 (in 10 days)</li>
        </ul>
        <div className="mt-6 flex gap-4">
          <Link to="/planner" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-md transition">Go to Planner</Link>
          <Link to="/journal" className="bg-white border border-purple-600 hover:bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl shadow-md transition">View Journal</Link>
        </div>
      </div>
    );
  }

export default Dashboard;