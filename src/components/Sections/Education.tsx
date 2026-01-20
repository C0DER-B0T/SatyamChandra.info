import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Loader } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Education } from '../../types/types';

const EducationSection = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'education'));
      const eduData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Education[];
      setEducations(eduData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="education" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Education
          </h2>
          
          {/* Tagline Box */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-6 border-l-4 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 mr-3 text-blue-600 dark:text-blue-400" />
                Believe in Skills, Not Just Degrees
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                While formal education provides a foundation, true expertise comes from continuous learning and practical experience. I focus on developing real-world skills and staying current with industry trends.
              </p>
            </div>
          </div>
        </motion.div>

        {educations.length > 0 ? (
          <div className="space-y-8">
            {educations.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {edu.courseTitle}
                      </h3>
                      <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {edu.instituteName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {edu.duration}
                      </p>
                      
                      {edu.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {edu.description}
                        </p>
                      )}

                      {edu.keyAchievements && edu.keyAchievements.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                            Key Achievements
                          </h4>
                          <ul className="space-y-2">
                            {edu.keyAchievements.map((achievement, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                                <span className="text-gray-600 dark:text-gray-300">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No education entries available. Please add content through the admin panel.
          </div>
        )}
      </div>
    </section>
  );
};

export default EducationSection;