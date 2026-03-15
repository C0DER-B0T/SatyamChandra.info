import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Zap, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AboutFormData, HomeFormData } from '../../types/types';

const About = () => {
  const [aboutData, setAboutData] = useState<AboutFormData | null>(null);
  const [homeData, setHomeData] = useState<HomeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // ID Card 3D state
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [swingAngle, setSwingAngle] = useState(0);
  const [isSwinging, setIsSwinging] = useState(false);
  const swingRef = useRef<number | null>(null);

  // Drag state
  const isDragging = useRef(false);
  const lastDragX = useRef(0);
  const dragVelocity = useRef(0);

  const cardRafRef = useRef<number | null>(null);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current) return; // Don't tilt while dragging
    if (isSwinging) return;
    if (!cardRef.current) return;
    
    if (cardRafRef.current) return;

    cardRafRef.current = window.requestAnimationFrame(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      const rotateY = (mouseX / (rect.width / 2)) * 15;
      const rotateX = -(mouseY / (rect.height / 2)) * 8;
      
      setCardRotate({ x: rotateX, y: rotateY });
      cardRafRef.current = null;
    });
  }, [isSwinging]);

  const handleCardMouseLeave = useCallback(() => {
    if (cardRafRef.current) {
      window.cancelAnimationFrame(cardRafRef.current);
      cardRafRef.current = null;
    }
    if (!isSwinging && !isDragging.current) {
      setCardRotate({ x: 0, y: 0 });
    }
  }, [isSwinging]);

  // Start a swing animation with a given initial velocity
  const startSwing = useCallback((initialVelocity: number) => {
    // Cancel any running animation
    if (swingRef.current) {
      cancelAnimationFrame(swingRef.current);
      swingRef.current = null;
    }

    setIsSwinging(true);
    
    let velocity = initialVelocity;
    let angle = swingAngle; // Start from current angle
    const damping = 0.96;
    const gravity = 0.35;
    let frame = 0;
    
    const animate = () => {
      velocity += -angle * gravity;
      velocity *= damping;
      angle += velocity * 0.1;
      frame++;
      
      setSwingAngle(angle);
      
      if (Math.abs(velocity) < 0.05 && Math.abs(angle) < 0.1 && frame > 20) {
        setSwingAngle(0);
        setIsSwinging(false);
        return;
      }
      
      swingRef.current = requestAnimationFrame(animate);
    };
    
    swingRef.current = requestAnimationFrame(animate);
  }, [swingAngle]);

  // Click always triggers a swing (interrupts any current one)
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger click if we just finished dragging
    if (isDragging.current) return;
    
    // Determine direction based on which side was clicked
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clickX = e.clientX - (rect.left + rect.width / 2);
    const direction = clickX > 0 ? 1 : -1;
    
    startSwing(35 * direction);
  }, [startSwing]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastDragX.current = e.clientX;
    dragVelocity.current = 0;
    
    // Cancel any running swing
    if (swingRef.current) {
      cancelAnimationFrame(swingRef.current);
      swingRef.current = null;
    }
    setIsSwinging(false);
    
    const handleDragMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !cardRef.current) return;
      
      const deltaX = moveEvent.clientX - lastDragX.current;
      dragVelocity.current = deltaX * 2; // Track velocity
      lastDragX.current = moveEvent.clientX;
      
      // Convert pixel movement to angle
      const rect = cardRef.current.getBoundingClientRect();
      const angleDelta = (deltaX / rect.width) * 40;
      
      setSwingAngle(prev => {
        const newAngle = prev + angleDelta;
        // Clamp to reasonable range
        return Math.max(-45, Math.min(45, newAngle));
      });
    };
    
    const handleDragEnd = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      
      // Launch swing from current position with drag velocity
      const releaseVelocity = dragVelocity.current;
      if (Math.abs(releaseVelocity) > 1 || Math.abs(swingAngle) > 1) {
        startSwing(releaseVelocity);
      } else {
        setSwingAngle(0);
      }
    };
    
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }, [startSwing, swingAngle]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (swingRef.current) cancelAnimationFrame(swingRef.current);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aboutSnap, homeSnap] = await Promise.all([
        getDoc(doc(db, 'about', 'main')),
        getDoc(doc(db, 'home', 'main')),
      ]);
      
      if (aboutSnap.exists()) {
        setAboutData(aboutSnap.data() as AboutFormData);
      }
      if (homeSnap.exists()) {
        setHomeData(homeSnap.data() as HomeFormData);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </section>
    );
  }

  if (!aboutData) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No about information available. Please add content through the admin panel.</p>
        </div>
      </section>
    );
  }

  // Calculate the total rotation: tilt from mouse + swing from click
  const totalRotateZ = isSwinging ? swingAngle : 0;
  const totalRotateX = isSwinging ? 0 : cardRotate.x;
  const totalRotateY = isSwinging ? 0 : cardRotate.y;

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About Me
          </h2>
          {aboutData.tagline && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border-l-4 border-blue-600">
                <p className="text-xl text-gray-700 dark:text-gray-200 font-medium text-center leading-relaxed">
                  {aboutData.tagline}
                </p>
              </div>
            </div>
          )}

          {/* EXP Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
              {/* Level Badge - Outside the bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-lg font-bold text-white">
                      Level {aboutData.level || 1}
                    </span>
                  </motion.div>
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                  >
                    <button className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors">
                      ?
                    </button>
                    {/* Tooltip */}
                    <div className="absolute left-0 top-8 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl">
                      <p className="font-bold mb-1">🎮 EXP System</p>
                      <p className="mb-2">Track my productivity and growth!</p>
                      <p className="text-green-400">+10 EXP: Coding consistently, intense gym sessions</p>
                      <p className="text-blue-400">+5 EXP: Projects, hackathons, good test scores</p>
                      <p className="text-orange-400">-5 EXP: Wasted time</p>
                      <p className="text-red-400">-10 EXP: Procrastination</p>
                    </div>
                  </motion.div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {aboutData.currentExp || 0}/{aboutData.maxExp || 100} EXP
                </span>
              </div>

              {/* Sleek Progress Bar */}
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 flex items-center justify-end pr-3"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Percentage Text */}
                  {((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) > 0.1 && (
                    <span className="relative z-10 text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) * 100)}%
                    </span>
                  )}
                </motion.div>

                {/* Sparkle Particles */}
                {((aboutData.currentExp || 0) / (aboutData.maxExp || 100)) > 0.5 && (
                  <>
                    <motion.div
                      className="absolute top-0.5 left-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="absolute top-0.5 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                      className="absolute top-0.5 left-3/4 w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      animate={{ y: [-8, 8], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                    />
                  </>
                )}
              </div>

              {/* Level Up Message */}
              {(aboutData.currentExp || 0) >= (aboutData.maxExp || 100) && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-3 text-sm font-bold text-yellow-600 dark:text-yellow-400"
                >
                  🎉 Ready to Level Up! 🎉
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* 3D Metallic ID Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="flex flex-col items-center">
              {/* Lanyard clip at top */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Clip */}
                <div className="w-12 h-5 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 rounded-t-lg shadow-lg border border-gray-500 dark:border-gray-400" />
                {/* Lanyard string */}
                <div className="w-0.5 h-8 bg-gradient-to-b from-gray-400 to-blue-500 dark:from-gray-500 dark:to-blue-400"
                  style={{
                    transform: `rotate(${totalRotateZ * 0.3}deg)`,
                    transformOrigin: 'top center',
                    transition: (isSwinging || isDragging.current) ? 'none' : 'transform 0.15s ease-out',
                  }}
                />
              </div>

              {/* The 3D Card Container — perspective + pivot from top */}
              <div
                ref={cardRef}
                onClick={handleCardClick}
                onMouseDown={handleDragStart}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="select-none"
                style={{
                  perspective: '800px',
                  transformOrigin: 'top center',
                  cursor: isDragging.current ? 'grabbing' : 'grab',
                }}
              >
                <div
                  style={{
                    transform: `rotateX(${totalRotateX}deg) rotateY(${totalRotateY}deg) rotateZ(${totalRotateZ}deg)`,
                    transformOrigin: 'top center',
                    transition: (isSwinging || isDragging.current) ? 'none' : 'transform 0.15s ease-out',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* The actual metallic card */}
                  <div
                    className="relative w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      background: 'linear-gradient(145deg, #e8e8e8 0%, #c0c0c0 25%, #d4d4d4 50%, #b8b8b8 75%, #a8a8a8 100%)',
                      boxShadow: `
                        0 20px 60px rgba(0,0,0,0.3),
                        0 0 0 1px rgba(255,255,255,0.1) inset,
                        ${-totalRotateY * 0.5}px ${totalRotateX * 0.5}px 30px rgba(0,0,0,0.2)
                      `,
                    }}
                  >
                    {/* Dark mode metallic variant */}
                    <div className="hidden dark:block absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(145deg, #2a2a3e 0%, #1e1e2f 25%, #252538 50%, #1a1a2d 75%, #15152a 100%)',
                      }}
                    />

                    {/* Holographic shimmer overlay */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.05) 50%, transparent 55%)',
                        backgroundSize: '200% 200%',
                      }}
                      animate={{
                        backgroundPosition: ['200% 0%', '-200% 0%'],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />

                    {/* Card header band */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-white/30" />
                          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                            Identity Card
                          </span>
                        </div>
                        {aboutData.level && (
                          <span className="text-xs font-bold text-yellow-300 bg-yellow-300/10 px-2 py-0.5 rounded-full">
                            LVL {aboutData.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="relative px-6 py-5 space-y-4">
                      {/* Profile picture row */}
                      <div className="flex items-center space-x-4">
                        {aboutData.profilePicture && (
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl blur-sm opacity-50" />
                            <img
                              src={aboutData.profilePicture}
                              alt="Profile"
                              className="relative w-20 h-20 rounded-xl object-cover border-2 border-white/50 dark:border-gray-500/50 shadow-lg"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-lg font-extrabold text-gray-800 dark:text-white truncate">
                            {homeData?.displayName || 'Developer'}
                          </h3>
                          {homeData?.roles && homeData.roles.length > 0 && (
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                              {homeData.roles[0]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-400/30 dark:border-gray-500/30" />

                      {/* Info fields */}
                      <div className="space-y-2.5">
                        {aboutData.tagline && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Tagline
                            </p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2">
                              {aboutData.tagline}
                            </p>
                          </div>
                        )}

                        {aboutData.currentFocus && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Current Focus
                            </p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2">
                              {aboutData.currentFocus}
                            </p>
                          </div>
                        )}

                        {homeData?.roles && homeData.roles.length > 1 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Interests
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {homeData.roles.slice(0, 4).map((role, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-400/30 dark:border-gray-500/30" />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                            Active
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                          CLICK TO SWING
                        </p>
                      </div>
                    </div>

                    {/* Bottom metallic edge */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {aboutData.shortBio && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    Introduction
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                  {aboutData.shortBio}
                </p>
              </div>
            )}

            {aboutData.fullBio && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    About
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-line">
                  {aboutData.fullBio}
                </p>
              </div>
            )}

            {aboutData.currentFocus && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
                <div className="flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Current Focus
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {aboutData.currentFocus}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mission Statement */}
        {aboutData.mission && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl p-8 border-l-4 border-purple-600"
          >
            <div className="flex items-start space-x-4">
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  My Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {aboutData.mission}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default About;