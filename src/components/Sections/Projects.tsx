import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Loader, Calendar } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Project } from '../../types/types';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      
      // Sort by hierarchy: Advanced > Medium > Basic, then by date (newest first)
      const levelOrder = { 'Advanced': 3, 'Medium': 2, 'Basic': 1 };
      const sorted = projectsData.sort((a, b) => {
        // Primary sort: by level
        const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
        if (levelDiff !== 0) return levelDiff;
        
        // Secondary sort: by date (newest first)
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      
      setProjects(sorted);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'Medium':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'Basic':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A showcase of my work in AI/ML and software development
          </p>
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  project.level === 'Advanced' ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="relative h-48">
                  {project.coverPhoto ? (
                    <img
                      src={project.coverPhoto}
                      alt={project.projectName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl">📁</span>
                    </div>
                  )}
                  
                  {/* Level Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(project.level)}`}>
                      {project.level}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {project.projectName}
                    </h3>
                    {project.date && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(project.date)}
                      </div>
                    )}
                  </div>

                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {project.objective}
                  </p>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.detailedDescription}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Github className="w-5 h-5" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.liveDemoLink && (
                      <a
                        href={project.liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No projects available yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;