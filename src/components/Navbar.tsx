import { motion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, Code2, FolderOpen, Award, Mail, Trophy } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'about', label: 'About', icon: <User className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'skills', label: 'Skills', icon: <Code2 className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4 md:w-5 md:h-5" /> }
  ];

  return (
    <nav className="fixed top-0 left-0 h-16 md:h-screen w-full md:w-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg z-50 transition-all duration-300 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
      {/* Mobile Scroll Gradient Indicators */}
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none z-10 md:hidden" />
      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none z-10 md:hidden" />
      
      <div className="flex flex-row md:flex-col items-center justify-start md:justify-start md:py-8 h-full md:space-y-8 px-4 md:px-0 overflow-x-auto md:overflow-x-visible no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-shrink-0 p-2.5 md:p-3 mx-1 md:mx-auto rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={tab.label}
          >
            <div className="flex items-center justify-center">
              {tab.icon}
            </div>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 