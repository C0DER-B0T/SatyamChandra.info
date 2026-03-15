import { motion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, Code2, FolderOpen, Award, Mail, Trophy } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <User className="w-5 h-5" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'skills', label: 'Skills', icon: <Code2 className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-5 h-5" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed top-0 left-0 h-16 md:h-screen w-full md:w-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg z-50 transition-all duration-300">
      <div className="flex flex-row md:flex-col items-center justify-around md:justify-start md:py-8 h-full md:space-y-8 px-4 md:px-0">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative p-2 md:p-3 rounded-lg transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={tab.label}
          >
            <div className="flex flex-col items-center">
              {tab.icon}
              <span className="text-[10px] md:hidden mt-1">{tab.label}</span>
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-100 dark:bg-blue-900 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 