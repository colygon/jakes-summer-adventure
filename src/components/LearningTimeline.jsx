import { motion } from 'framer-motion';
import { useState } from 'react';
import '../styles/LearningTimeline.css';

const timelineEvents = [
  {
    id: 1,
    title: "Camp Lemma Math Adventures",
    description: "Interactive math camp in San Francisco",
    icon: "🧮",
    details: "Solving complex problems, learning new concepts, and having fun with mathematics",
    progress: 0,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "RSM Homework Completion",
    description: "Finishing up math assignments",
    icon: "📚",
    details: "Completing the last set of RSM homework assignments to wrap up the semester",
    progress: 75,
    color: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    title: "Book Writing Project",
    description: "Creative writing and storytelling",
    icon: "✍️",
    details: "Working on a personal book project, developing characters and plot",
    progress: 25,
    color: "from-orange-500 to-red-600"
  },
  {
    id: 4,
    title: "General Learning & Exploration",
    description: "Discovering new interests and skills",
    icon: "🌟",
    details: "Open time for exploring new topics, reading, and learning whatever sparks curiosity",
    progress: 10,
    color: "from-purple-500 to-pink-600"
  }
];

const TimelineItem = ({ event, index, isActive, onClick }) => {
  return (
    <motion.div
      className={`timeline-item ${isActive ? 'active' : ''}`}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      onClick={() => onClick(event.id)}
    >
      <div className="timeline-marker">
        <motion.div
          className="timeline-icon"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          {event.icon}
        </motion.div>
        <div className="timeline-line"></div>
      </div>

      <motion.div
        className={`timeline-content bg-gradient-to-r ${event.color}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3>{event.title}</h3>
        <p>{event.description}</p>

        <div className="progress-container">
          <div className="progress-label">Progress: {event.progress}%</div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              whileInView={{ width: `${event.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
          </div>
        </div>

        {isActive && (
          <motion.div
            className="timeline-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <p>{event.details}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const LearningTimeline = () => {
  const [activeEvent, setActiveEvent] = useState(null);

  const handleEventClick = (eventId) => {
    setActiveEvent(activeEvent === eventId ? null : eventId);
  };

  return (
    <section className="learning-section">
      <div className="driftwood-background"></div>

      <motion.div
        className="learning-container"
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
          Learning Journey
        </motion.h2>

        <div className="timeline-container">
          {timelineEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={index}
              isActive={activeEvent === event.id}
              onClick={handleEventClick}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LearningTimeline;