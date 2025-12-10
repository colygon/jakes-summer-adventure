import Hero from './components/Hero';
import InteractiveMap from './components/InteractiveMap';
import DestinationsShowcase from './components/DestinationsShowcase';
import LearningTimeline from './components/LearningTimeline';
import ZuzuAdventures from './components/ZuzuAdventures';
import CreativeCorner from './components/CreativeCorner';
import './styles/App.css';

function App() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <div id="hero">
        <Hero />
      </div>
      <div id="map">
        <InteractiveMap />
      </div>
      <div id="destinations">
        <DestinationsShowcase />
      </div>
      <div id="timeline">
        <LearningTimeline />
      </div>
      <div id="zuzu">
        <ZuzuAdventures />
      </div>
      <div id="creative">
        <CreativeCorner />
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Jake's Epic Summer Adventure 2024</p>
          <div className="footer-icons">
            <button
              className="footer-icon-btn"
              onClick={scrollToTop}
              title="Back to Top"
              aria-label="Back to top"
            >
              🌊
            </button>
            <button
              className="footer-icon-btn"
              onClick={() => scrollToSection('destinations')}
              title="Destinations"
              aria-label="Go to destinations section"
            >
              ✈️
            </button>
            <button
              className="footer-icon-btn"
              onClick={() => scrollToSection('creative')}
              title="Books & Creative Corner"
              aria-label="Go to books section"
            >
              📚
            </button>
            <button
              className="footer-icon-btn"
              onClick={() => scrollToSection('zuzu')}
              title="Zuzu Adventures"
              aria-label="Go to Zuzu adventures section"
            >
              🐕
            </button>
            <button
              className="footer-icon-btn"
              onClick={() => scrollToSection('creative')}
              title="Writing Workspace"
              aria-label="Go to writing workspace"
            >
              ✍️
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;