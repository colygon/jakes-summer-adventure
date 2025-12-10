import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import '../styles/LearningTimeline.css';

const initialEvents = [
  {
    id: 1,
    title: "Camp Lemma Math Adventures",
    description: "Interactive math camp in San Francisco",
    icon: "🧮",
    details: "Solving complex problems, learning new concepts, and having fun with mathematics",
    progress: 0,
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: 2,
    title: "RSM Homework Completion",
    description: "Finishing up math assignments",
    icon: "📚",
    details: "Completing the last set of RSM homework assignments to wrap up the semester",
    progress: 75,
    color: "from-emerald-600 to-teal-700"
  },
  {
    id: 3,
    title: "Book Writing Project",
    description: "Creative writing and storytelling",
    icon: "✍️",
    details: "Working on a personal book project, developing characters and plot",
    progress: 25,
    color: "from-rose-600 to-pink-700"
  },
  {
    id: 4,
    title: "General Learning & Exploration",
    description: "Discovering new interests and skills",
    icon: "🌟",
    details: "Open time for exploring new topics, reading, and learning whatever sparks curiosity",
    progress: 10,
    color: "from-purple-600 to-violet-700"
  }
];

// Fun activity suggestions and color options
const activitySuggestions = [
  { title: "Learn a New Language", icon: "🌍", description: "Master a new language through apps and practice" },
  { title: "Coding Adventure", icon: "💻", description: "Build websites, games, or apps" },
  { title: "Art & Drawing", icon: "🎨", description: "Express creativity through visual arts" },
  { title: "Music Practice", icon: "🎵", description: "Learn an instrument or compose songs" },
  { title: "Science Experiments", icon: "🧪", description: "Explore chemistry and physics at home" },
  { title: "Cooking Skills", icon: "👩‍🍳", description: "Master new recipes and cooking techniques" },
  { title: "Fitness Challenge", icon: "💪", description: "Get stronger with daily workouts" },
  { title: "Photography Journey", icon: "📸", description: "Capture the world through your lens" },
  { title: "Gardening Project", icon: "🌱", description: "Grow plants and learn about nature" },
  { title: "Reading Marathon", icon: "📖", description: "Dive into new books and stories" }
];

const colorOptions = [
  "from-blue-600 to-indigo-700",
  "from-emerald-600 to-teal-700",
  "from-rose-600 to-pink-700",
  "from-purple-600 to-violet-700",
  "from-amber-600 to-orange-700",
  "from-cyan-600 to-blue-700",
  "from-red-600 to-rose-700",
  "from-green-600 to-emerald-700",
  "from-indigo-600 to-purple-700",
  "from-pink-600 to-rose-700"
];

// Add Activity Modal Component
const AddActivityModal = ({ isOpen, onClose, onAdd }) => {
  const [activityType, setActivityType] = useState('custom');
  const [customActivity, setCustomActivity] = useState({ title: '', description: '', icon: '🎯' });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const handleSubmit = () => {
    const newActivity = activityType === 'custom'
      ? customActivity
      : selectedSuggestion;

    if (!newActivity.title.trim()) return;

    const activity = {
      id: Date.now(),
      title: newActivity.title,
      description: newActivity.description,
      icon: newActivity.icon,
      details: `Working on ${newActivity.title.toLowerCase()} to expand skills and knowledge`,
      progress: 0,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      isUserAdded: true
    };

    onAdd(activity);
    setCustomActivity({ title: '', description: '', icon: '🎯' });
    setSelectedSuggestion(null);
    setActivityType('custom');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="activity-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="activity-modal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Add New Learning Activity 📚</h3>

          <div className="activity-type-selector">
            <button
              className={activityType === 'suggestion' ? 'active' : ''}
              onClick={() => setActivityType('suggestion')}
            >
              ✨ Choose from Ideas
            </button>
            <button
              className={activityType === 'custom' ? 'active' : ''}
              onClick={() => setActivityType('custom')}
            >
              🎯 Create Custom
            </button>
          </div>

          {activityType === 'suggestion' ? (
            <div className="activity-suggestions">
              {activitySuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className={`suggestion-card ${selectedSuggestion === suggestion ? 'selected' : ''}`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <div>
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="custom-activity-form">
              <div className="icon-selector">
                <label>Choose an icon:</label>
                <div className="icon-grid">
                  {['🎯', '📚', '🎨', '💻', '🏃', '🎵', '🧪', '📸', '🌱', '✨'].map(icon => (
                    <button
                      key={icon}
                      className={customActivity.icon === icon ? 'selected' : ''}
                      onClick={() => setCustomActivity(prev => ({ ...prev, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Activity title..."
                value={customActivity.title}
                onChange={(e) => setCustomActivity(prev => ({ ...prev, title: e.target.value }))}
              />

              <textarea
                placeholder="Describe this learning activity..."
                value={customActivity.description}
                onChange={(e) => setCustomActivity(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          )}

          <div className="modal-buttons">
            <button onClick={handleSubmit} className="add-btn">
              {activityType === 'suggestion' ? '✨ Add Activity' : '🎯 Create Activity'}
            </button>
            <button onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TimelineItem = ({ event, index, isActive, onClick, onProgressUpdate, onDelete }) => {
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
            {event.isUserAdded && (
              <button
                className="delete-activity-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
                title="Delete this activity"
              >
                🗑️ Remove Activity
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const LearningTimeline = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [timelineEvents, setTimelineEvents, { isLoading, saveStatus, lastSaved }] = useAutoSaveData('timeline', initialEvents);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleAddActivity = (newActivity) => {
    setTimelineEvents(prevEvents => [...prevEvents, newActivity]);
  };

  const handleDeleteActivity = (activityId) => {
    if (window.confirm('Are you sure you want to remove this activity?')) {
      setTimelineEvents(prevEvents =>
        prevEvents.filter(event => event.id !== activityId)
      );
      if (activeEvent === activityId) {
        setActiveEvent(null);
      }
    }
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
          <div className="progress-header">
            <h3>Overall Summer Progress: {totalProgress}%</h3>
            <div className="save-status">
              {isLoading && <span className="status loading">Loading...</span>}
              {!isLoading && saveStatus === 'saving' && <span className="status saving">Saving...</span>}
              {!isLoading && saveStatus === 'saved' && <span className="status saved">✓ Saved{lastSaved ? ` at ${lastSaved}` : ''}</span>}
              {!isLoading && saveStatus === 'error' && <span className="status error">⚠ Save failed</span>}
            </div>
          </div>
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
              onDelete={handleDeleteActivity}
            />
          ))}
        </div>

        <motion.div
          className="timeline-actions"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="add-activity-btn" onClick={() => setShowAddModal(true)}>
            ✨ Add New Activity
          </button>
          <button className="reset-btn" onClick={handleResetAll}>
            Reset All Progress
          </button>
        </motion.div>
      </motion.div>

      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddActivity}
      />
    </section>
  );
};

export default LearningTimeline;