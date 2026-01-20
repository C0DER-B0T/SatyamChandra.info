import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Zap, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AboutFormData } from '../../types/types';

const About = () => {
  const [aboutData, setAboutData] = useState<AboutFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const aboutRef = doc(db, 'about', 'main');
      const aboutSnap = await getDoc(aboutRef);
      
      if (aboutSnap.exists()) {
        setAboutData(aboutSnap.data() as AboutFormData);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No about information available. Please add content through the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About Me
          </h2>
          {aboutData.tagline && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border-l-4 border-blue-600">
                <p className="text-xl text-gray-700 dark:text-gray-200 font-medium text-center leading-relaxed">
                  {aboutData.tagline}
                </p>
              </div>
            </div>
          )}

          {/* EXP Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
              {/* Level Badge - Outside the bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-lg font-bold text-white">
                      Level {aboutData.level || 1}
                    </span>
                  </motion.div>
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <button className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors">
                      ?
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-0 top-8 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl">
                      <p className="font-bold mb-1">🎮 EXP System</p>
                      <p className="mb-2">Track my productivity and growth!</p>
                      <p className="text-green-400">+10 EXP: Coding consistently, intense gym sessions</p>
                      <p className="text-blue-400">+5 EXP: Projects, hackathons, good test scores</p>
                      <p className="text-orange-400">-5 EXP: Wasted time</p>
                      <p className="text-red-400">-10 EXP: Procrastination</p>
                    </div>
                  </motion.div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {aboutData.currentExp || 0}/{aboutData.maxExp || 100} EXP
                </span>
              </div>

              {/* Sleek Progress Bar */}
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 flex items-center justify-end pr-3"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Percentage Text */}
                  {((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) > 0.1 && (
                    <span className="relative z-10 text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) * 100)}%
                    </span>
                  )}
                </motion.div>

                {/* Sparkle Particles */}
                {((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) > 0.5 && (
                  <>
                    <motion.div
                      className="absolute top-0.5 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="absolute top-0.5 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                      className="absolute top-0.5 left-3/4 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                    />
                  </>
                )}
              </div>

              {/* Level Up Message */}
              {(aboutData.currentExp || 0) >= (aboutData.maxExp || 100) && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-3 text-sm font-bold text-yellow-600 dark:text-yellow-400"
                >
                  🎉 Ready to Level Up! 🎉
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Profile Picture */}
          {aboutData.profilePicture && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-2xl opacity-20" />
                <img
                  src={aboutData.profilePicture}
                  alt="Profile"
                  className="relative w-80 h-80 rounded-full object-cover border-8 border-blue-400 dark:border-blue-600 shadow-2xl"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {aboutData.shortBio && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    Introduction
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                  {aboutData.shortBio}
                </p>
              </div>
            )}

            {aboutData.fullBio && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    About
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-line">
                  {aboutData.fullBio}
                </p>
              </div>
            )}

            {aboutData.currentFocus && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Current Focus
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {aboutData.currentFocus}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mission Statement */}
        {aboutData.mission && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-8 border-l-4 border-purple-600"
          >
            <div className="flex items-start space-x-4">
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  My Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {aboutData.mission}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default About;