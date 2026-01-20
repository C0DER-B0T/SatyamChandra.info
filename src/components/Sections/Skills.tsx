import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Loader } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { SkillCategory } from '../../types/types';

const Skills = () => {
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const skillsSnapshot = await getDocs(collection(db, 'skills'));
      const skillsData = skillsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SkillCategory[];
      setSkills(skillsData.sort((a, b) => a.order - b.order).filter(cat => cat.skills.length > 0));
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  if (skills.length === 0) {
    return (
      <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No skills available. Please add skills through the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Code2 className="w-10 h-10 mr-3 text-blue-600 dark:text-blue-400" />
            Skills & Expertise
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Technical skills and professional expertise in AI/ML development
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3" />
                {category.category}
              </h3>

              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skillIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: skillIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {skill.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.confidence}%` }}
                        transition={{ duration: 1, delay: skillIndex * 0.1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continuous Learning Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Continuous Learning</h3>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            I'm constantly expanding my skill set and staying up-to-date with the latest advancements in AI/ML technologies. 
            My commitment to continuous learning ensures that I can deliver cutting-edge solutions to complex problems.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;