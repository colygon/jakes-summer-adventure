import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import '../styles/DestinationsShowcase.css';

const getDestinationFromMapLocation = (mapLocation) => {
  // Convert map location to destination format
  const colorOptions = [
    "from-blue-400 to-teal-500",
    "from-amber-300 to-orange-400",
    "from-purple-400 to-pink-500",
    "from-green-400 to-emerald-500",
    "from-pink-400 to-rose-500",
    "from-indigo-400 to-purple-500"
  ];

  return {
    id: mapLocation.id,
    name: mapLocation.name,
    image: mapLocation.icon,
    emoji: mapLocation.icon,
    description: mapLocation.description,
    highlights: mapLocation.activities || [
      "Explore local landmarks",
      "Experience culture",
      "Try local cuisine",
      "Adventure activities"
    ],
    color: colorOptions[mapLocation.id % colorOptions.length],
    isUserAdded: mapLocation.isUserAdded
  };
};

const DestinationCard = ({ destination, index, onDelete }) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      className="destination-card"
      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <div className={`card-gradient bg-gradient-to-r ${destination.color}`}>
        <div className="card-content">
          <motion.div
            className="destination-emoji"
            whileHover={{ scale: 1.2, rotate: 15 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {destination.emoji}
          </motion.div>

          <h3 className="destination-name">{destination.name}</h3>
          <p className="destination-description">{destination.description}</p>

          <div className="highlights">
            {destination.highlights.map((highlight, idx) => (
              <motion.span
                key={idx}
                className="highlight-tag"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                {highlight}
              </motion.span>
            ))}
          </div>

          {destination.isUserAdded && (
            <button
              className="delete-destination-btn"
              onClick={() => onDelete(destination.id)}
              title="Delete this destination"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DestinationsShowcase = () => {
  const [mapLocations, setMapLocations] = useAutoSaveData('map_locations', []);

  const destinations = mapLocations.map(getDestinationFromMapLocation);

  const handleDeleteDestination = (destinationId) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      setMapLocations(prevLocations =>
        prevLocations.filter(location => location.id !== destinationId)
      );
    }
  };

  return (
    <section className="destinations-section">
      <motion.div
        className="destinations-container"
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
          Amazing Destinations
        </motion.h2>

        <div className="destinations-grid">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={index}
              onDelete={handleDeleteDestination}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default DestinationsShowcase;