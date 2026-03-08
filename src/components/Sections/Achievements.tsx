import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import Tilt from 'react-parallax-tilt';
import { db } from '../../config/firebase';
import { Achievement } from '../../types/types';
import { Loader, ExternalLink } from 'lucide-react';

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'achievements'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[];
      setAchievements(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="achievements" className="min-h-screen py-20 px-4 flex justify-center items-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </section>
    );
  }

  return (
    <section id="achievements" className="py-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Achievements & Medals
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg mt-4">
            A collection of my professional certifications, awards, and recognitions across various platforms and competitions.
          </p>
        </motion.div>

        {achievements.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No achievements added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={15}
                  tiltMaxAngleY={15}
                  glareEnable={true}
                  glareMaxOpacity={0.2}
                  glareColor="#ffffff"
                  glarePosition="all"
                  glareBorderRadius="12px"
                  scale={1.05}
                  transitionSpeed={2000}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-between text-center hover:shadow-xl transition-shadow h-full"
                >
                <div className="w-full flex-1 flex flex-col items-center justify-center mb-4">
                  {/* Image container using object-contain to keep PNG shape */}
                  <div className="h-40 w-full relative mb-6">
                    <img
                      src={item.badgeImage}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full mb-3">
                    {item.platform}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
                
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                </Tilt>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements;
