import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../App.css';

function PublicHome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-8"
    >
      <motion.h1
        className="text-6xl font-extrabold text-gray-800 mb-4 text-center leading-tight"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Welcome to <span className="text-purple-600">ZenGradual</span>
      </motion.h1>

      <motion.p
        className="text-lg text-gray-700 max-w-3xl text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Your all-in-one toolkit for smarter revision. Whether you’re tackling GCSEs or A-Levels, ZenGradual gives you the structure, clarity, and motivation you need—without the overwhelm.
      </motion.p>

      <motion.ul
        className="text-md text-gray-600 max-w-2xl text-left mb-6 space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {[
          "🎯 Personalized study planners tailored to your exam boards.",
          "📝 A private, secure journal for tracking reflections and goals.",
          "📈 Gamified revision system to boost consistency and focus.",
          "📊 Progress dashboards to see where you're winning—and what needs improvements.",
        ].map((item, index) => (
          <motion.li
            key={index}
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            className="flex items-start"
          >
            {item}
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link
          to="/dashboard"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg transition duration-300"
        >
          Get Started
        </Link>
        <Link
          to="/planner"
          className="bg-white border border-purple-600 hover:bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl shadow-lg transition duration-300"
        >
          Try the Planner
        </Link>
      </motion.div>

      <motion.div
        className="mt-12 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Built by students, for students. ✨
      </motion.div>
    </motion.div>
  );
}

export default PublicHome;
