import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/DestinationsShowcase.css';

const destinations = [
  {
    id: 1,
    name: "Galapagos Islands",
    image: "🌊",
    emoji: "🐢",
    description: "Discover unique wildlife in this UNESCO World Heritage site",
    highlights: [
      "Giant tortoises",
      "Marine iguanas",
      "Blue-footed boobies",
      "Snorkeling adventures"
    ],
    color: "from-blue-400 to-teal-500"
  },
  {
    id: 2,
    name: "Falmouth, Cape Cod",
    image: "🏖️",
    emoji: "🦞",
    description: "Three weeks of coastal bliss and beach adventures",
    highlights: [
      "Sandy beaches",
      "Historic lighthouses",
      "Fresh seafood",
      "Family time"
    ],
    color: "from-amber-300 to-orange-400"
  },
  {
    id: 3,
    name: "San Francisco",
    image: "🏙️",
    emoji: "🧮",
    description: "Camp Lemma - Where math meets fun in the city",
    highlights: [
      "Interactive math problems",
      "Golden Gate Bridge",
      "Educational workshops",
      "City exploration"
    ],
    color: "from-purple-400 to-pink-500"
  }
];

const DestinationCard = ({ destination, index }) => {
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
        </div>
      </div>
    </motion.div>
  );
};

const DestinationsShowcase = () => {
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
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default DestinationsShowcase;