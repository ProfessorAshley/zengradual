import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '../App.css';

function PublicHome() {
    return (
      <div className="flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 to-purple-100 p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">Welcome to <span className="text-purple-600">ZenGradual</span></h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-4">
          ZenGradual helps you plan your revision, reflect on your studies, and improve with smart tools—all in one place. 
          Ideal for GCSE and A-Level students who want structure without the stress.
        </p>
        <p className="text-md text-gray-600 max-w-xl mb-6">
          Features include: custom study planners, a private journal (with encryption coming soon), and a gamified revision tool similar to Duolingo.
          Log in to get started and track your progress.
        </p>
        <div className="flex gap-4">
          <Link to="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-md transition">Get Started</Link>
          <Link to="/planner" className="bg-white border border-purple-600 hover:bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl shadow-md transition">Try the Planner</Link>
        </div>
      </div>
    );
  }

export default PublicHome;