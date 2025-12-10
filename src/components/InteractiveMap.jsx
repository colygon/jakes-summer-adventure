import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import 'leaflet/dist/leaflet.css';
import '../styles/InteractiveMap.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const initialLocations = [
  {
    id: 1,
    name: "Galapagos Islands",
    coordinates: [-0.9538, -90.9656],
    description: "Amazing wildlife and unique ecosystem exploration",
    icon: "🐢",
    details: "Home to unique species like giant tortoises and marine iguanas"
  },
  {
    id: 2,
    name: "Falmouth, Cape Cod",
    coordinates: [41.5481, -70.6148],
    description: "Beach relaxation and 3-week coastal adventure",
    icon: "🏖️",
    details: "Beautiful beaches, lighthouses, and family time by the ocean"
  },
  {
    id: 3,
    name: "San Francisco",
    coordinates: [37.7749, -122.4194],
    description: "Camp Lemma - Interactive math learning experience",
    icon: "🧮",
    details: "Educational math camp in the heart of San Francisco"
  }
];

// Component to handle map clicks
const MapClickHandler = ({ onLocationAdd }) => {
  useMapEvents({
    dblclick(e) {
      const { lat, lng } = e.latlng;
      onLocationAdd(lat, lng);
    },
  });
  return null;
};

// Modal for adding new destinations
const AddDestinationModal = ({ isOpen, onClose, coordinates, onAdd }) => {
  const [locationName, setLocationName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateActivities = async (placeName) => {
    // Simple AI simulation - in production you'd use OpenAI API
    const activities = [
      `Explore local ${placeName} landmarks and attractions`,
      `Experience traditional ${placeName} cuisine and culture`,
      `Take guided tours and outdoor adventures in ${placeName}`,
      `Visit museums and historical sites around ${placeName}`,
      `Enjoy local festivals and community events`
    ];
    return activities;
  };

  const handleSubmit = async () => {
    if (!locationName.trim()) return;

    setIsGenerating(true);
    try {
      const activities = await generateActivities(locationName);
      const newLocation = {
        id: Date.now(),
        name: locationName,
        coordinates: coordinates,
        description: `Amazing adventures in ${locationName}`,
        icon: "📍",
        details: `Discover the wonders of ${locationName}`,
        activities: activities,
        isUserAdded: true
      };

      onAdd(newLocation);
      setLocationName('');
      onClose();
    } catch (error) {
      console.error('Error generating activities:', error);
    }
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="destination-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="destination-modal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Add New Destination</h3>
          <p>Location: {coordinates && `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`}</p>

          <input
            type="text"
            placeholder="Enter destination name..."
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />

          <div className="modal-buttons">
            <button onClick={handleSubmit} disabled={!locationName.trim() || isGenerating}>
              {isGenerating ? '🤖 Generating Activities...' : '✈️ Add Destination'}
            </button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InteractiveMap = () => {
  const [locations, setLocations] = useAutoSaveData('map_locations', initialLocations);
  const [showModal, setShowModal] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState(null);

  const handleLocationAdd = (lat, lng) => {
    setClickCoordinates([lat, lng]);
    setShowModal(true);
  };

  const handleAddDestination = (newLocation) => {
    setLocations(prevLocations => [...prevLocations, newLocation]);
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      setLocations(prevLocations =>
        prevLocations.filter(location => location.id !== locationId)
      );
    }
  };

  return (
    <>
      <motion.section
        className="map-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
      <div className="map-container">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="map-title"
        >
          Adventure Map
        </motion.h2>

        <div className="map-wrapper">
          <MapContainer
            center={[20, -40]}
            zoom={2}
            className="leaflet-map"
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            <MapClickHandler onLocationAdd={handleLocationAdd} />

            {locations.map((location, index) => (
              <Marker
                key={location.id}
                position={location.coordinates}
              >
                <Popup className="custom-popup">
                  <div className="popup-content">
                    <span className="location-icon">{location.icon}</span>
                    <h3>{location.name}</h3>
                    <p>{location.description}</p>
                    <small>{location.details}</small>
                    {location.isUserAdded && (
                      <button
                        className="delete-location-btn"
                        onClick={() => handleDeleteLocation(location.id)}
                        title="Delete this destination"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="paw-prints">
            🐾 🐾 🐾
          </div>
        </div>

        <div className="map-instructions">
          <p>💡 <strong>Tip:</strong> Double-click anywhere on the map to add a new destination!</p>
        </div>
      </div>
    </motion.section>

    <AddDestinationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      coordinates={clickCoordinates}
      onAdd={handleAddDestination}
    />
  </>
  );
};

export default InteractiveMap;