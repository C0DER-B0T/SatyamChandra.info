import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load sections for maximum initial performance
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
import { ThemeProvider } from './context/ThemeContext';
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
  const touchStartX = useRef<number | null>(null);
  const touchTarget = useRef<HTMLElement | null>(null);

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
    
    // Smooth scroll to top of main container when tab changes
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Increased timeout to ensure animation state is stable
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  }, [activeTab, isNavigating]);

  const checkInternalScroll = useCallback((target: HTMLElement, deltaY: number) => {
    let current = target;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflow = style.overflowY;
      if ((overflow === 'auto' || overflow === 'scroll') && current.scrollHeight > current.clientHeight) {
        if (deltaY > 0 && current.scrollTop + current.clientHeight < current.scrollHeight - 5) {
          return true;
        }
        if (deltaY < 0 && current.scrollTop > 5) {
          return true;
        }
      }
      current = current.parentElement as HTMLElement;
    }
    return false;
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Use a lock to prevent processing inputs during navigation
      if (isNavigating) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      
      const isInternal = checkInternalScroll(e.target as HTMLElement, e.deltaY);
      if (isInternal) return;

      // Prevent default scroll behavior if not internal scroll
      if (e.cancelable) e.preventDefault();

      // Prevent multiple navigation triggers with a robust cooldown
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return;

      const currentIndex = sectionIds.indexOf(activeTab);
      
      // Increased threshold for wheel sensitivity
      if (e.deltaY > 30) {
        if (currentIndex < sectionIds.length - 1) {
          lastScrollTime.current = now;
          handleTabChange(sectionIds[currentIndex + 1]);
        }
      } else if (e.deltaY < -30) {
        if (currentIndex > 0) {
          lastScrollTime.current = now;
          handleTabChange(sectionIds[currentIndex - 1]);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchTarget.current = e.target as HTMLElement;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || isNavigating) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchCurrentY;
      
      // Prevent pull-to-refresh on mobile when at the top of the page
      if (deltaY < 0 && window.scrollY === 0) {
        const isInternal = checkInternalScroll(touchTarget.current!, deltaY);
        if (!isInternal && e.cancelable) e.preventDefault();
      }

      // If it's a significant vertical swipe, and we're not internally scrolling,
      // prevent default to ensure smooth navigation and no browser interference
      if (Math.abs(deltaY) > 10) {
        const isInternal = checkInternalScroll(touchTarget.current!, deltaY);
        if (!isInternal && e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartX.current === null || isNavigating) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY.current - touchEndY;
      const deltaX = touchStartX.current - touchEndX;
      const now = Date.now();

      // If it's more of a horizontal swipe than vertical, ignore it for tab navigation
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        touchStartY.current = null;
        touchStartX.current = null;
        return;
      }

      // Sensitivity check: must be a significant swipe (80px) and cooldown passed
      if (Math.abs(deltaY) > 80 && now - lastScrollTime.current > 1000) {
        const isInternal = checkInternalScroll(touchTarget.current!, deltaY);
        if (isInternal) {
          touchStartY.current = null;
          return;
        }

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
      touchTarget.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, isNavigating, handleTabChange, checkInternalScroll]);

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
          className="text-lg text-gray-600 dark:text-gray-400 text-center px-4"
        >
          Use Desktop For Better Viewing Experience
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <ThemeToggle />

      {/* Persistent Experience Hint */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-max">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-black/60 dark:bg-white/20 backdrop-blur-lg text-white dark:text-white text-[11px] py-2 px-4 rounded-full border border-white/20 shadow-lg whitespace-nowrap"
        >
          Use Desktop for better experience
        </motion.div>
      </div>
      
      <main className="md:ml-20 pt-16 md:pt-0 h-screen relative bg-white dark:bg-gray-900 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                y: direction > 0 ? '30%' : direction < 0 ? '-30%' : 0,
                opacity: 0,
                scale: 0.95,
                filter: 'blur(10px)'
              }),
              center: {
                zIndex: 1,
                y: 0,
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)'
              },
              exit: (direction: number) => ({
                zIndex: 0,
                y: direction < 0 ? '30%' : direction > 0 ? '-30%' : 0,
                opacity: 0,
                scale: 1.05,
                filter: 'blur(10px)'
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 250, damping: 25 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 },
              filter: { duration: 0.3 }
            }}
            className="h-full w-full overflow-y-auto overflow-x-hidden no-scrollbar bg-white dark:bg-gray-900 gpu-accel"
          >
            <div className="min-h-full w-full">
              <Suspense fallback={null}>
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