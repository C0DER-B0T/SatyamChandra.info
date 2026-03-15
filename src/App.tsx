import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load sections for better performance
const Hero = lazy(() => import('./components/Sections/Hero'));
const About = lazy(() => import('./components/Sections/About'));
const Education = lazy(() => import('./components/Sections/Education'));
const Work = lazy(() => import('./components/Sections/Work'));
const Skills = lazy(() => import('./components/Sections/Skills'));
const Projects = lazy(() => import('./components/Sections/Projects'));
const Certifications = lazy(() => import('./components/Sections/Certifications'));
const Achievements = lazy(() => import('./components/Sections/Achievements'));
const Contact = lazy(() => import('./components/Sections/Contact'));

import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ParticlesBackground from './components/ParticlesBackground';
import ParticleCursor from './components/ParticleCursor';

const sectionIds = [
  'home',
  'about',
  'education',
  'work',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'contact',
];

const PortfolioHome = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for previous
  const lastScrollTime = useRef(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (activeTab === tab || isNavigating) return;
    
    const currentIndex = sectionIds.indexOf(activeTab);
    const nextIndex = sectionIds.indexOf(tab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    
    setIsNavigating(true);
    setActiveTab(tab);
    // Increased timeout to ensure animation state is stable
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  }, [activeTab, isNavigating]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Allow scrolling within the section if it has overflow
      let target = e.target as HTMLElement;
      let isInternalScroll = false;

      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        const overflow = style.overflowY;
        if ((overflow === 'auto' || overflow === 'scroll') && target.scrollHeight > target.clientHeight) {
          if (e.deltaY > 0 && target.scrollTop + target.clientHeight < target.scrollHeight - 1) {
            isInternalScroll = true;
            break;
          }
          if (e.deltaY < 0 && target.scrollTop > 1) {
            isInternalScroll = true;
            break;
          }
        }
        target = target.parentElement as HTMLElement;
      }

      if (isInternalScroll) return;

      // Prevent default scroll behavior if not internal scroll
      if (e.cancelable) e.preventDefault();

      // Prevent multiple navigation triggers
      const now = Date.now();
      if (now - lastScrollTime.current < 1000 || isNavigating) return;

      const currentIndex = sectionIds.indexOf(activeTab);
      
      // Use sign of deltaY for more cross-browser consistency
      if (e.deltaY > 0) {
        // Scroll down - next tab
        if (currentIndex < sectionIds.length - 1) {
          lastScrollTime.current = now;
          handleTabChange(sectionIds[currentIndex + 1]);
        }
      } else if (e.deltaY < 0) {
        // Scroll up - previous tab
        if (currentIndex > 0) {
          lastScrollTime.current = now;
          handleTabChange(sectionIds[currentIndex - 1]);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || isNavigating) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      const now = Date.now();

      if (Math.abs(deltaY) > 50 && now - lastScrollTime.current > 1000) {
        const currentIndex = sectionIds.indexOf(activeTab);
        if (deltaY > 0) {
          // Swipe up - next tab
          if (currentIndex < sectionIds.length - 1) {
            lastScrollTime.current = now;
            handleTabChange(sectionIds[currentIndex + 1]);
          }
        } else {
          // Swipe down - previous tab
          if (currentIndex > 0) {
            lastScrollTime.current = now;
            handleTabChange(sectionIds[currentIndex - 1]);
          }
        }
      }
      touchStartY.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, isNavigating, handleTabChange]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4"
        >
          Loading...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-gray-600 dark:text-gray-400"
        >
          Welcome to my Portfolio
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      <ParticlesBackground />
      <ParticleCursor />
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <ThemeToggle />
      
      <main className="md:ml-20 pt-16 md:pt-0 h-screen relative">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                y: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
                opacity: 0,
                scale: 0.98
              }),
              center: {
                zIndex: 1,
                y: 0,
                opacity: 1,
                scale: 1
              },
              exit: (direction: number) => ({
                zIndex: 0,
                y: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
                opacity: 0,
                scale: 1.02
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 400, damping: 40, mass: 1 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 }
            }}
            className="h-full w-full overflow-y-auto overflow-x-hidden no-scrollbar absolute inset-0 bg-white dark:bg-gray-900"
          >
            <div className="min-h-full w-full">
               <Suspense fallback={
                 <div className="flex items-center justify-center h-full">
                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               }>
                 {activeTab === 'home' && <Hero />}
                 {activeTab === 'about' && <About />}
                 {activeTab === 'education' && <Education />}
                 {activeTab === 'work' && <Work />}
                 {activeTab === 'skills' && <Skills />}
                 {activeTab === 'projects' && <Projects />}
                 {activeTab === 'certifications' && <Certifications />}
                 {activeTab === 'achievements' && <Achievements />}
                 {activeTab === 'contact' && <Contact />}
               </Suspense>
             </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ParticlesBackground />
        <ParticleCursor />
        <Routes>
          {/* Public Portfolio Route */}
          <Route path="/" element={<PortfolioHome />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;