import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BadgePopup = ({ badge, onClose }) => {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border shadow-xl px-6 py-4 rounded-xl z-50 w-80 text-center"
        >
          <h3 className="text-xl font-bold mb-1">🎉 {badge.title}</h3>
          <p className="text-gray-700 text-sm">{badge.description}</p>
          <button
            onClick={onClose}
            className="mt-3 text-sm text-purple-600 hover:underline"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default BadgePopup;