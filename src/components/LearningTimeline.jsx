import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import '../styles/LearningTimeline.css';

const initialEvents = [
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

const TimelineItem = ({ event, index, isActive, onClick, onProgressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProgress, setTempProgress] = useState(event.progress);

  const handleProgressClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setTempProgress(event.progress);
  };

  const handleProgressSave = (e) => {
    e.stopPropagation();
    onProgressUpdate(event.id, tempProgress);
    setIsEditing(false);
  };

  const handleProgressCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setTempProgress(event.progress);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    const newProgress = Math.min(100, event.progress + 10);
    onProgressUpdate(event.id, newProgress);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    const newProgress = Math.max(0, event.progress - 10);
    onProgressUpdate(event.id, newProgress);
  };

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
          <div className="progress-label">
            Progress: {event.progress}%
            {event.progress === 100 && <span className="complete-badge">✅ Complete!</span>}
          </div>

          {!isEditing ? (
            <div className="progress-controls">
              <button
                className="progress-btn decrease"
                onClick={handleDecrease}
                disabled={event.progress === 0}
              >
                -10%
              </button>
              <div className="progress-bar" onClick={handleProgressClick}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${event.progress}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: event.progress === 100
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))'
                  }}
                ></motion.div>
              </div>
              <button
                className="progress-btn increase"
                onClick={handleIncrease}
                disabled={event.progress === 100}
              >
                +10%
              </button>
            </div>
          ) : (
            <div className="progress-editor">
              <input
                type="range"
                min="0"
                max="100"
                value={tempProgress}
                onChange={(e) => setTempProgress(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="progress-slider"
              />
              <div className="progress-value">{tempProgress}%</div>
              <div className="editor-buttons">
                <button className="save-btn" onClick={handleProgressSave}>Save</button>
                <button className="cancel-btn" onClick={handleProgressCancel}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <motion.div
            className="timeline-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <p>{event.details}</p>
            {event.progress === 100 && (
              <motion.div
                className="achievement-message"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                🎉 Awesome job completing this goal!
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const LearningTimeline = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [timelineEvents, setTimelineEvents] = useLocalStorage('jakeTimelineProgress', initialEvents);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    const total = timelineEvents.reduce((sum, event) => sum + event.progress, 0) / timelineEvents.length;
    setTotalProgress(Math.round(total));
  }, [timelineEvents]);

  const handleEventClick = (eventId) => {
    setActiveEvent(activeEvent === eventId ? null : eventId);
  };

  const handleProgressUpdate = (eventId, newProgress) => {
    setTimelineEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, progress: newProgress } : event
      )
    );
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setTimelineEvents(initialEvents);
    }
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

        <div className="overall-progress">
          <h3>Overall Summer Progress: {totalProgress}%</h3>
          <div className="overall-progress-bar">
            <motion.div
              className="overall-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          {totalProgress === 100 && (
            <motion.div
              className="summer-complete"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1 }}
            >
              🏆 Amazing Summer Achievement! All Goals Completed! 🎊
            </motion.div>
          )}
        </div>

        <div className="timeline-container">
          {timelineEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={index}
              isActive={activeEvent === event.id}
              onClick={handleEventClick}
              onProgressUpdate={handleProgressUpdate}
            />
          ))}
        </div>

        <motion.div
          className="timeline-actions"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="reset-btn" onClick={handleResetAll}>
            Reset All Progress
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LearningTimeline;