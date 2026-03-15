import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Loader } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Certificate } from '../../types/types';

const Certifications = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'certificates'));
      const certsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[];
      const levelOrder: Record<string, number> = { 'Superior': 5, 'Advanced': 4, 'Medium': 3, 'Basic': 2, 'Minor': 1 };
      const sorted = certsData.sort((a, b) => {
        const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
        if (levelDiff !== 0) return levelDiff;
        
        const aOrder = a.order !== undefined ? a.order : -1;
        const bOrder = b.order !== undefined ? b.order : -1;
        if (bOrder !== aOrder) {
          return bOrder - aOrder;
        }

        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      setCertificates(sorted);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="certifications" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Certifications
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional certifications and specialized training
          </p>
        </motion.div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={8}
                  tiltMaxAngleY={8}
                  glareEnable={true}
                  glareMaxOpacity={0.3}
                  glareColor="#ffffff"
                  glarePosition="all"
                  glareBorderRadius="12px"
                  scale={1.02}
                  transitionSpeed={3000}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full"
                >
                {cert.certificateImage && (
                  <div className="relative h-48">
                    <img
                      src={cert.certificateImage}
                      alt={cert.certificateName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center flex-wrap gap-2">
                          {cert.certificateName}
                          {cert.level && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              cert.level === 'Superior' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              cert.level === 'Advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              cert.level === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              cert.level === 'Basic' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {cert.level}
                            </span>
                          )}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center justify-between">
                          <span>{cert.issuingOrganization}</span>
                          {cert.date && <span className="text-gray-500 dark:text-gray-400 ml-4">{cert.date}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-600 dark:text-gray-300 mb-4">
                    {cert.description}
                  </p>

                  {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Skills & Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cert.skillsLearned.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cert.verificationLink && (
                    <motion.a
                      href={cert.verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      whileHover={{ x: 5 }}
                    >
                      Verify Certificate
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </motion.a>
                  )}
                </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No certifications available. Please add certifications through the admin panel.
          </div>
        )}
      </div>
    </section>
  );
};

export default Certifications;