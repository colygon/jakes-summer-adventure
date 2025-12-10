import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
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

const locations = [
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
    name: "Cape Cod",
    coordinates: [41.6688, -70.2962],
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
  },
  {
    id: 4,
    name: "Barnstable, Cape Cod",
    coordinates: [41.7003, -70.3002],
    description: "Family friend's house - social adventures",
    icon: "🏡",
    details: "Hanging out with friends and their kids, 45 minutes from main Cape Cod stay"
  }
];

const InteractiveMap = () => {
  return (
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
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

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
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="paw-prints">
            🐾 🐾 🐾
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default InteractiveMap;