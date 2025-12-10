import { motion } from 'framer-motion';
import { useState } from 'react';
import '../styles/ZuzuAdventures.css';

const dogFriendlyTips = [
  {
    id: 1,
    title: "Flight Preparation",
    tip: "Book pet-friendly airlines and prepare comfort items",
    icon: "✈️",
    details: "Zuzu can fly! Make sure to have all vaccination records, a comfortable carrier, and favorite toys for the journey."
  },
  {
    id: 2,
    title: "Beach Safety",
    tip: "Fresh water, shade, and paw protection for hot sand",
    icon: "🏖️",
    details: "Bring plenty of fresh water, portable shade, and consider paw balm for hot sand at Cape Cod beaches."
  },
  {
    id: 3,
    title: "Adventure Gear",
    tip: "Leash, waste bags, and identification tags",
    icon: "🎒",
    details: "Always carry essentials: sturdy leash, waste bags, updated ID tags, and a first-aid kit for adventures."
  },
  {
    id: 4,
    title: "Accommodation",
    tip: "Verify pet policies and fees beforehand",
    icon: "🏨",
    details: "Double-check hotel pet policies, additional fees, and nearby dog parks or walking areas."
  }
];

const zuzuGallery = [
  {
    id: 1,
    alt: "Zuzu at the beach",
    emoji: "🐕🏖️",
    caption: "Ready for Cape Cod adventures!"
  },
  {
    id: 2,
    alt: "Zuzu on a plane",
    emoji: "🐕✈️",
    caption: "Flying to new destinations"
  },
  {
    id: 3,
    alt: "Zuzu hiking",
    emoji: "🐕🥾",
    caption: "Exploring nature trails"
  },
  {
    id: 4,
    alt: "Zuzu with books",
    emoji: "🐕📚",
    caption: "Study buddy for homework time"
  }
];

const TipCard = ({ tip, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="tip-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="tip-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="tip-icon">{tip.icon}</span>
        <h3>{tip.title}</h3>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>

      <p className="tip-summary">{tip.tip}</p>

      {isExpanded && (
        <motion.div
          className="tip-details"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <p>{tip.details}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const ZuzuAdventures = () => {
  return (
    <section className="zuzu-section">
      <motion.div
        className="zuzu-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="section-title"
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Zuzu's Adventures 🐕
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Every adventure is better with your best friend!
        </motion.p>

        <div className="zuzu-gallery">
          <h3>Zuzu's Journey</h3>
          <div className="gallery-grid">
            {zuzuGallery.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="gallery-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                viewport={{ once: true }}
              >
                <div className="photo-emoji">{photo.emoji}</div>
                <p className="photo-caption">{photo.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="travel-tips">
          <h3>Dog-Friendly Travel Tips</h3>
          <div className="tips-grid">
            {dogFriendlyTips.map((tip, index) => (
              <TipCard key={tip.id} tip={tip} index={index} />
            ))}
          </div>
        </div>

        <motion.div
          className="paw-trail"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ZuzuAdventures;