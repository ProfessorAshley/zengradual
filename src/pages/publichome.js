import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';

function PublicHome() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Testimonials data
  const testimonials = [
    {
      name: "Not Real Person",
      role: "A-Level Student",
      content: "ZenGradual completely transformed my revision approach. The personalized planner helped me stay on track, and the gamified system made studying actually enjoyable!",
      avatar: "👩‍🎓"
    },
    {
      name: "Not Real Person",
      role: "GCSE Student",
      content: "I was struggling with organization until I found ZenGradual. The progress tracking and journal features helped me understand my strengths and weaknesses.",
      avatar: "👨‍🎓"
    },
    {
      name: "Not Real Person",
      role: "Parent",
      content: "As a parent, I love how ZenGradual keeps my daughter motivated and organized. The structured approach has improved her confidence significantly.",
      avatar: "👩‍👧"
    }
  ];

  // Features data
  const features = [
    {
      icon: "🎯",
      title: "Smart Planning",
      description: "AI-powered study planners that adapt to your exam boards and learning style"
    },
    {
      icon: "📝",
      title: "Reflection Journal",
      description: "Secure, private journal to track your thoughts, goals, and learning journey"
    },
    {
      icon: "🎮",
      title: "Gamified Learning",
      description: "Earn XP, unlock achievements, and stay motivated with our reward system"
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description: "Visual dashboards showing your strengths and areas for improvement"
    },
    {
      icon: "⏰",
      title: "Time Management",
      description: "Efficient scheduling tools to maximize your study sessions"
    },
    {
      icon: "🎓",
      title: "Exam Focus",
      description: "Specialized content for GCSEs, A-Levels, and other qualifications"
    }
  ];

  // Stats data
  const stats = [
    { number: "aaaaaa+", label: "Students Helped" },
    { number: "bbbbbb%", label: "Success Rate" },
    { number: "cccccc+", label: "Subjects Covered" },
    { number: "ddd/ddd", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center min-h-screen px-8 py-16"
      >
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-6 leading-tight"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ZenGradual
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Your all-in-one toolkit for smarter revision. Whether you're tackling GCSEs or A-Levels, 
            ZenGradual gives you the structure, clarity, and motivation you need—without the overwhelm.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              🚀 Get Started Free
            </Link>
            <Link
              to="/planner"
              className="bg-white border-2 border-purple-600 hover:bg-purple-50 text-purple-600 px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              📋 Try the Planner
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-white"
      >
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-br from-purple-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose ZenGradual?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built by students, for students. Our platform combines proven study techniques 
              with modern technology to help you achieve your academic goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-white"
      >
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of students who have transformed their study habits
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 md:p-12 rounded-2xl shadow-lg"
              >
                <div className="text-center">
                  <div className="text-6xl mb-6">{testimonials[activeTestimonial].avatar}</div>
                  <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  <div className="font-semibold text-gray-800">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-purple-600">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? 'bg-purple-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-purple-600 to-blue-600"
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Study Habits?
          </motion.h2>
          <motion.p
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Join thousands of students who have already improved their grades and confidence 
            with ZenGradual. Start your journey today!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link
              to="/dashboard"
              className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              🚀 Start Learning Now
            </Link>
            <Link
              to="/planner"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              📋 Explore Features
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 bg-gray-800 text-white"
      >
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="text-2xl font-bold mb-4">ZenGradual</div>
          <p className="text-gray-400 mb-6">
            Built by students, for students. ✨
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
            <span>Support</span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default PublicHome;
