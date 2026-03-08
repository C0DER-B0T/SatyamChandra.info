import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Conditionally render based on location
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Smooth springs for the trailing ring
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(0, springConfig);
  const cursorYSpring = useSpring(0, springConfig);

  useEffect(() => {
    // If admin path, don't attach listeners to save performance
    if (isAdminPath) return;

    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      // Update spring targets
      cursorXSpring.set(e.clientX - 16); // Center the 32px ring
      cursorYSpring.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Triggers hover state if the element is clickable or has interactive tags
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorXSpring, cursorYSpring, isAdminPath]);

  if (isAdminPath) {
    return null;
  }

  return (
    <>
      <style>{`
        body {
          cursor: none;
        }
        a, button, [role="button"], input, select, textarea {
          cursor: none !important;
        }
      `}</style>
      
      {/* Main tiny dot (instant follow) */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-[9999]"
        style={{
          x: mousePosition.x - 4, // Center the 8px dot
          y: mousePosition.y - 4,
        }}
      />
      
      {/* Trailing animated ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-blue-500 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)',
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};

export default CustomCursor;