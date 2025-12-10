// Firebase configuration for Jake's Summer Adventure
// Using a read-only public configuration for demo purposes
// In production, these would be secured with proper rules

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Public Firebase config (read/write enabled for demo)
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "jakes-summer-adventure.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "jakes-summer-adventure.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// For demo purposes, we'll use localStorage with auto-sync simulation
// In production, replace with actual Firebase

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.log('Using localStorage fallback for demo');
  db = null;
}

// Demo database that simulates Firebase with localStorage
class DemoFirestore {
  constructor() {
    this.listeners = new Map();
  }

  async saveData(path, data) {
    try {
      const key = `jake_summer_${path}`;
      console.log(`Saving to localStorage with key: ${key}`, data);
      localStorage.setItem(key, JSON.stringify(data));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Notify listeners
      if (this.listeners.has(path)) {
        this.listeners.get(path).forEach(callback => callback(data));
      }

      console.log(`Successfully saved to localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async loadData(path) {
    try {
      const key = `jake_summer_${path}`;
      const data = localStorage.getItem(key);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  onDataChange(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      if (this.listeners.has(path)) {
        this.listeners.get(path).delete(callback);
      }
    };
  }
}

// Create demo firestore instance
const demoDb = new DemoFirestore();

// Database service for Jake's summer data
export const summerDb = {
  // Save learning timeline progress
  async saveTimelineProgress(progress) {
    return await demoDb.saveData('timeline_progress', progress);
  },

  // Load learning timeline progress
  async loadTimelineProgress() {
    return await demoDb.loadData('timeline_progress');
  },

  // Save book projects
  async saveBookProjects(books) {
    return await demoDb.saveData('book_projects', books);
  },

  // Load book projects
  async loadBookProjects() {
    return await demoDb.loadData('book_projects');
  },

  // Save writing notes
  async saveWritingNotes(notes) {
    return await demoDb.saveData('writing_notes', notes);
  },

  // Load writing notes
  async loadWritingNotes() {
    return await demoDb.loadData('writing_notes');
  },

  // Save book content
  async saveBookContent(content) {
    return await demoDb.saveData('book_content', content);
  },

  // Load book content
  async loadBookContent() {
    return await demoDb.loadData('book_content');
  },

  // Save map locations
  async saveMapLocations(locations) {
    return await demoDb.saveData('map_locations', locations);
  },

  // Load map locations
  async loadMapLocations() {
    return await demoDb.loadData('map_locations');
  },

  // Save audio cache
  async saveAudioCache(audioCache) {
    return await demoDb.saveData('audio_cache', audioCache);
  },

  // Load audio cache
  async loadAudioCache() {
    return await demoDb.loadData('audio_cache');
  },

  // Listen for data changes
  onTimelineChange(callback) {
    return demoDb.onDataChange('timeline_progress', callback);
  },

  onBookProjectsChange(callback) {
    return demoDb.onDataChange('book_projects', callback);
  },

  onWritingNotesChange(callback) {
    return demoDb.onDataChange('writing_notes', callback);
  },

  onBookContentChange(callback) {
    return demoDb.onDataChange('book_content', callback);
  },

  onMapLocationsChange(callback) {
    return demoDb.onDataChange('map_locations', callback);
  },

  onAudioCacheChange(callback) {
    return demoDb.onDataChange('audio_cache', callback);
  }
};

// Auto-save helper with debouncing
export function createAutoSaver(saveFunction, delay = 1000) {
  let timeoutId;

  return (data) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(data);
    }, delay);
  };
}

export default { summerDb, createAutoSaver };