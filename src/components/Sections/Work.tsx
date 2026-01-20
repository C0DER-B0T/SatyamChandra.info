import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code2, Users, Rocket, Lightbulb, Loader, MapPin } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Experience } from '../../types/types';

const Work = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'experience'));
      const expData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Experience[];
      setExperiences(expData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching experience:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="work" className="py-20 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Learning Journey & Experience
          </h2>
          
          {/* Tagline Box */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 border-l-4 border-purple-600">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                <Lightbulb className="w-7 h-7 mr-3 text-purple-600 dark:text-purple-400" />
                Passionate Learner & Problem Solver
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                As a dedicated student with a strong foundation in AI/ML, I combine academic knowledge with practical experience. My curiosity drives me to continuously learn and apply new technologies to solve real-world challenges.
              </p>
            </div>
          </div>
        </motion.div>

        {experiences.length > 0 ? (
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white h-full"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Briefcase className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{exp.jobRole}</h3>
                      </div>
                      <p className="text-lg font-medium mb-2">{exp.companyName}</p>
                      <div className="flex items-center space-x-2 text-blue-100 mb-2">
                        <MapPin className="w-4 h-4" />
                        <p className="text-sm">{exp.location}</p>
                      </div>
                      <p className="text-blue-100">{exp.duration}</p>
                    </motion.div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {exp.activityDescription}
                      </p>
                      
                      {exp.keyContributions && exp.keyContributions.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-600" />
                            Key Contributions
                          </h4>
                          <ul className="space-y-2">
                            {exp.keyContributions.map((contribution, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * i }}
                                viewport={{ once: true }}
                                className="flex items-start space-x-2 text-gray-600 dark:text-gray-300"
                              >
                                <Rocket className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                <span>{contribution}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exp.technicalSkills && exp.technicalSkills.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Code2 className="w-5 h-5 mr-2 text-blue-600" />
                              Technical Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {exp.technicalSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {exp.softSkills && exp.softSkills.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
                              Soft Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {exp.softSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No work experience available. Please add content through the admin panel.
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;