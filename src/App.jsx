import Hero from './components/Hero';
import InteractiveMap from './components/InteractiveMap';
import DestinationsShowcase from './components/DestinationsShowcase';
import LearningTimeline from './components/LearningTimeline';
import ZuzuAdventures from './components/ZuzuAdventures';
import CreativeCorner from './components/CreativeCorner';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Hero />
      <InteractiveMap />
      <DestinationsShowcase />
      <LearningTimeline />
      <ZuzuAdventures />
      <CreativeCorner />

      <footer className="app-footer">
        <div className="footer-content">
          <p>Jake's Epic Summer Adventure 2024</p>
          <div className="footer-icons">
            🌊 ✈️ 📚 🐕 ✍️
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;