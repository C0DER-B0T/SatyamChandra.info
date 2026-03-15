import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader, Calendar } from 'lucide-react';
import { FaGithub as Github } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import Tilt from 'react-parallax-tilt';
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
      
      // Sort by hierarchy: Superior > Advanced > Medium > Basic > Minor
      // Then by custom `order` value, then by date (newest first)
      const levelOrder: Record<string, number> = { 'Superior': 5, 'Advanced': 4, 'Medium': 3, 'Basic': 2, 'Minor': 1 };
      const sorted = projectsData.sort((a, b) => {
        // Primary sort: by level
        const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
        if (levelDiff !== 0) return levelDiff;
        
        // Secondary sort: by custom explicit order (descending like how things are added)
        const aOrder = a.order !== undefined ? a.order : -1;
        const bOrder = b.order !== undefined ? b.order : -1;
        if (bOrder !== aOrder) {
          return bOrder - aOrder;
        }

        // Tertiary sort: by date (newest first) fallback
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
      case 'Superior':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/30';
      case 'Advanced':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'Medium':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'Basic':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      case 'Minor':
        return 'bg-gray-500 dark:bg-gray-600 text-white border border-gray-400 dark:border-gray-500';
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
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  glareEnable={true}
                  glareMaxOpacity={0.3}
                  glareColor="#ffffff"
                  glarePosition="all"
                  glareBorderRadius="12px"
                  scale={1.02}
                  transitionSpeed={2500}
                  className={`h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative ${
                    project.level === 'Superior' ? 'ring-2 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] hover:-translate-y-2 z-10' : 
                    project.level === 'Advanced' ? 'ring-2 ring-purple-500/80 hover:ring-purple-500 transition-all' : 
                    project.level === 'Medium' ? 'ring-1 ring-blue-500/50 hover:ring-blue-500/80 transition-all' : 
                    project.level === 'Basic' ? 'border border-green-500/30 hover:border-green-500/60 transition-all' : 
                    project.level === 'Minor' ? 'opacity-90 grayscale-[20%]' : ''
                  }`}
                >
                {project.level === 'Superior' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 pointer-events-none z-10" />
                )}
                <div className="relative h-48 z-20">
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
                </Tilt>
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