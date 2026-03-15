import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader, Linkedin, Twitter, Mail, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { SiGeeksforgeeks, SiHackerrank } from 'react-icons/si';
import { TypeAnimation } from 'react-type-animation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HomeFormData } from '../../types/types';

const Hero = () => {
  const [homeData, setHomeData] = useState<HomeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // 3D Profile Picture state
  const profileRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleProfileMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!profileRef.current) return;
    const rect = profileRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    // Rotate up to 25 degrees
    const rotateY = (mouseX / (rect.width / 2)) * 25;
    const rotateX = -(mouseY / (rect.height / 2)) * 25;
    // Glow position as percentage
    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;
    setRotate({ x: rotateX, y: rotateY });
    setGlow({ x: glowX, y: glowY });
    setIsHovering(true);
  }, []);

  const handleProfileMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
    setIsHovering(false);
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const docRef = doc(db, 'home', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        
        // Migrate old social links format to new format
        if (data.socialLinks && Array.isArray(data.socialLinks)) {
          data.socialLinks = data.socialLinks.map((link: any) => {
            if (!link.iconType) {
              if (link.iconUrl) {
                return { ...link, iconType: 'custom' };
              } else if (link.icon && typeof link.icon === 'string') {
                return {
                  name: link.name,
                  iconType: 'builtin',
                  icon: link.icon,
                  url: link.url,
                };
              }
            }
            return link;
          });
        }
        
        setHomeData(data as HomeFormData);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBuiltinIcon = (iconName: string) => {
    const normalizedName = iconName.trim();
    
    const iconMap: { [key: string]: any } = {
      Github: FaGithub,
      GitHub: FaGithub,
      Linkedin: Linkedin,
      LinkedIn: Linkedin,
      Twitter: Twitter,
      X: Twitter,
      Mail: Mail,
      Email: Mail,
      Facebook: Facebook,
      Instagram: Instagram,
      Youtube: Youtube,
      YouTube: Youtube,
      Discord: MessageCircle,
      Whatsapp: MessageCircle,
      Telegram: MessageCircle,
      Leetcode: MessageCircle,
      Medium: MessageCircle,
      Dev: MessageCircle,
      Stackoverflow: MessageCircle,
      GeeksforGeeks: SiGeeksforgeeks,
      GeeksForGeeks: SiGeeksforgeeks,
      HackerRank: SiHackerrank,
      Hackerrank: SiHackerrank,
    };
    
    const IconComponent = iconMap[normalizedName] || MessageCircle;
    return <IconComponent className="w-6 h-6" />;
  };

  // Create typing animation sequence from roles
  const getTypingSequence = () => {
    if (!homeData || !homeData.roles || homeData.roles.length === 0) {
      return ['Developer', 2000];
    }
    
    const sequence: (string | number)[] = [];
    homeData.roles.forEach((role) => {
      sequence.push(role, 2000); // Show each role for 2 seconds
    });
    return sequence;
  };

  if (loading) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <Loader className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
      </section>
    );
  }

  if (!homeData) return null;

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Hi, I'm <span className="text-blue-600 dark:text-blue-400">{homeData.displayName}</span>
            </motion.h1>
            
            {/* Typing Animation for Roles */}
            <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 dark:text-gray-300 mb-6 min-h-[3rem] flex items-center justify-center lg:justify-start">
              <TypeAnimation
                sequence={getTypingSequence()}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            {/* Description */}
            {homeData.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                {homeData.description}
              </motion.p>
            )}
            
            {/* Social Links */}
            <div className="flex justify-center lg:justify-start flex-wrap gap-4 mb-8">
              {homeData.socialLinks && homeData.socialLinks.length > 0 ? (
                homeData.socialLinks.map((link, index) => {
                  const iconType = link.iconType || 'builtin';
                  const icon = link.icon || '';
                  let iconUrl = (link.iconUrl || '').trim();
                  if (iconUrl.startsWith('(')) iconUrl = iconUrl.substring(1);
                  if (iconUrl.endsWith(')')) iconUrl = iconUrl.substring(0, iconUrl.length - 1);
                  
                  return (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                      title={link.name}
                    >
                      {iconType === 'builtin' && icon ? (
                        getBuiltinIcon(icon)
                      ) : iconUrl ? (
                        <img 
                          src={iconUrl} 
                          alt={link.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <MessageCircle className="w-6 h-6" />
                      )}
                    </motion.a>
                  );
                })
              ) : null}
            </div>

            {/* Resume Button */}
            {homeData.resumeLink && (
              <motion.a
                href={homeData.resumeLink}
                download="Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Download className="w-5 h-5" />
                <span>Download Resume</span>
              </motion.a>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-6 text-sm text-gray-500 dark:text-gray-400"
            >
              💡 Best viewed on desktop for optimal experience
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Profile Picture with Extraordinary Parallax */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center lg:justify-end"
          >
            {homeData.profilePicture ? (
              <div
                ref={profileRef}
                onMouseMove={handleProfileMouseMove}
                onMouseLeave={handleProfileMouseLeave}
                className="relative cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                {/* Outer orbiting ring 1 — moves opposite to tilt for parallax depth */}
                <div
                  className="absolute inset-[-24px] rounded-full pointer-events-none"
                  style={{
                    border: '2px solid transparent',
                    borderImage: 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(168,85,247,0.5), rgba(59,130,246,0.15)) 1',
                    borderRadius: '9999px',
                    transform: `rotateX(${rotate.x * -0.3}deg) rotateY(${rotate.y * -0.3}deg)`,
                    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.6s ease-out',
                    opacity: isHovering ? 1 : 0.3,
                  }}
                />

                {/* Outer orbiting ring 2 — moves WITH tilt but slower */}
                <div
                  className="absolute inset-[-40px] rounded-full pointer-events-none"
                  style={{
                    border: '1px dashed rgba(168,85,247,0.3)',
                    borderRadius: '9999px',
                    transform: `rotateX(${rotate.x * 0.15}deg) rotateY(${rotate.y * 0.15}deg) rotate(${rotate.y * 2}deg)`,
                    transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.8s ease-out',
                    opacity: isHovering ? 0.8 : 0.15,
                  }}
                />

                {/* Glowing backdrop that follows cursor */}
                <div
                  className="absolute inset-[-8px] rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(59,130,246,0.5) 0%, rgba(168,85,247,0.3) 40%, transparent 70%)`,
                    filter: 'blur(20px)',
                    transform: `rotateX(${rotate.x * 0.5}deg) rotateY(${rotate.y * 0.5}deg) scale(${isHovering ? 1.15 : 1})`,
                    transition: isHovering ? 'transform 0.1s ease-out, background 0.1s ease-out' : 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    opacity: isHovering ? 0.8 : 0.3,
                  }}
                />

                {/* Pulsing ambient glow behind picture */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-2xl animate-pulse pointer-events-none"
                  style={{
                    opacity: isHovering ? 0.45 : 0.2,
                    transition: 'opacity 0.4s ease-out',
                  }}
                />

                {/* The actual 3D-rotating profile picture */}
                <div
                  style={{
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovering ? 1.06 : 1})`,
                    transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={homeData.profilePicture}
                    alt={homeData.displayName}
                    className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full object-cover border-8 border-white dark:border-gray-800 shadow-2xl"
                    loading="eager"
                    style={{
                      boxShadow: isHovering
                        ? `${-rotate.y * 0.8}px ${rotate.x * 0.8}px 40px rgba(0,0,0,0.3), ${-rotate.y * 0.3}px ${rotate.x * 0.3}px 80px rgba(59,130,246,0.15)`
                        : '0 25px 50px -12px rgba(0,0,0,0.25)',
                      transition: isHovering ? 'box-shadow 0.1s ease-out' : 'box-shadow 0.6s ease-out',
                    }}
                  />

                  {/* Specular highlight overlay — simulates a light source following the cursor */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
                      opacity: isHovering ? 1 : 0,
                      transition: 'opacity 0.3s ease-out',
                    }}
                  />
                </div>

                {/* Floating particles / dots at different parallax depths */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const radius = 55 + (i % 3) * 8;
                  const depth = 0.2 + (i % 3) * 0.15;
                  return (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full pointer-events-none"
                      style={{
                        background: i % 2 === 0
                          ? 'rgba(59,130,246,0.7)'
                          : 'rgba(168,85,247,0.7)',
                        top: `${50 + Math.sin(angle) * radius}%`,
                        left: `${50 + Math.cos(angle) * radius}%`,
                        transform: `translate(-50%, -50%) translateX(${rotate.y * depth}px) translateY(${-rotate.x * depth}px)`,
                        transition: isHovering ? 'transform 0.12s ease-out, opacity 0.3s ease-out' : 'transform 0.8s ease-out, opacity 0.5s ease-out',
                        opacity: isHovering ? 0.9 : 0.2,
                        boxShadow: isHovering
                          ? `0 0 6px ${i % 2 === 0 ? 'rgba(59,130,246,0.8)' : 'rgba(168,85,247,0.8)'}`
                          : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-8 border-white dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 dark:from-blue-600/20 dark:to-purple-800/20" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-8xl">👨‍💻</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
