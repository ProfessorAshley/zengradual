import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '../App.css';

function Planner() {
    return (
      <div className="flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 to-purple-100 p-8">
        <h2 className="text-3xl font-semibold text-purple-700 mb-4">Planner</h2>
        <p className="text-gray-600">This is where you'll add exams, topics, and track your study progress.</p>
      </div>
    );
  }

export default Planner;