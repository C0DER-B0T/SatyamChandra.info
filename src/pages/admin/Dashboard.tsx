import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { motion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, FolderOpen, Award, Code2, LogOut, Mail } from 'lucide-react';
import HomeManager from '../../components/admin/HomeManager';
import AboutManager from '../../components/admin/AboutManager';
import EducationManager from '../../components/admin/EducationManager';
import ExperienceManager from '../../components/admin/ExperienceManager';
import ProjectsManager from '../../components/admin/ProjectsManager';
import CertificatesManager from '../../components/admin/CertificatesManager';
import SkillsManager from '../../components/admin/SkillsManager';
import ContactManager from '../../components/admin/ContactManager';

type TabType = 'home' | 'about' | 'skills' | 'education' | 'experience' | 'projects' | 'certificates' | 'contact';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tabs = [
    { id: 'home' as TabType, name: 'Home', icon: Home },
    { id: 'about' as TabType, name: 'About', icon: User },
    { id: 'skills' as TabType, name: 'Skills', icon: Code2 },
    { id: 'education' as TabType, name: 'Education', icon: GraduationCap },
    { id: 'experience' as TabType, name: 'Experience', icon: Briefcase },
    { id: 'projects' as TabType, name: 'Projects', icon: FolderOpen },
    { id: 'certificates' as TabType, name: 'Certificates', icon: Award },
    { id: 'contact' as TabType, name: 'Contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Navigation Tabs - Mobile */}
          <div className="md:hidden flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 md:pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && <HomeManager />}
            {activeTab === 'about' && <AboutManager />}
            {activeTab === 'skills' && <SkillsManager />}
            {activeTab === 'education' && <EducationManager />}
            {activeTab === 'experience' && <ExperienceManager />}
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'certificates' && <CertificatesManager />}
            {activeTab === 'contact' && <ContactManager />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
