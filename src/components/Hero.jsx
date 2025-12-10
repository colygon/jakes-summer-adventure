import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../styles/Hero.css';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('map');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <div className="wave-background" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="hero-content">
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="hero-title"
        >
          Jake's Epic Summer Adventure
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="hero-subtitle"
        >
          Exploring the world with math, books, and Zuzu
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
          className="scroll-indicator"
          onClick={scrollToNextSection}
          style={{ cursor: 'pointer' }}
        >
          <div className="beach-ball"></div>
          <p>Scroll to explore</p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;