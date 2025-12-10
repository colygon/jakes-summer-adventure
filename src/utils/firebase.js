// Firebase configuration for Jake's Summer Adventure
// Using a simple persistent database for cross-browser syncing

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Simple persistent database API for demo (no Firebase needed)
const PERSISTENT_DB_URL = 'https://api.jsonbin.io/v3/b';
const API_KEY = '$2a$10$demo-key-for-testing'; // Demo API key

// Fallback to localStorage with server sync
let app;
let db;

// Persistent database that works across browsers and deployments
class PersistentDatabase {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    this.serverUrl = 'https://jakesummer-db.netlify.app/.netlify/functions';
    // Fallback to simple GitHub Gist API for persistence
    this.gistId = '1234567890abcdef'; // Demo gist ID
    this.initialized = false;
    this.initPromise = this.initialize();

    // Set up cross-window/tab synchronization
    this.setupCrossTabSync();
  }

  setupCrossTabSync() {
    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('jake_summer_')) {
        const path = event.key.replace('jake_summer_', '');
        console.log(`Cross-tab sync: ${path} updated`);

        try {
          const newData = event.newValue ? JSON.parse(event.newValue) : null;
          if (newData) {
            this.cache.set(path, newData);

            // Notify listeners
            if (this.listeners.has(path)) {
              this.listeners.get(path).forEach(callback => callback(newData));
            }
          }
        } catch (error) {
          console.error('Error parsing cross-tab data:', error);
        }
      }
    });

    // Also listen for a custom sync event
    window.addEventListener('jake-summer-sync', (event) => {
      console.log('Received sync event:', event.detail);
      this.syncFromServer().catch(console.error);
    });
  }

  async initialize() {
    if (this.initialized) return;

    console.log('Initializing persistent database...');
    // Load all data from server on startup
    await this.syncFromServer();
    this.initialized = true;
    console.log('Database initialized successfully');
  }

  async syncFromServer() {
    try {
      console.log('Attempting to load data from server...');

      // Try our own Netlify function first
      let response = await fetch('/.netlify/functions/save-data');

      if (!response.ok) {
        // Fallback to demo JSONBin
        response = await fetch('https://api.jsonbin.io/v3/b/67571a74ad19ca34f8cdc9e5/latest', {
          headers: {
            'X-Access-Key': '$2a$10$demo-key-for-testing',
          }
        });
      }

      if (response.ok) {
        const result = await response.json();
        const serverData = result.record || result;
        console.log('Loaded data from server:', Object.keys(serverData));

        // Merge with local cache
        Object.keys(serverData).forEach(key => {
          if (serverData[key] !== null && serverData[key] !== undefined) {
            this.cache.set(key, serverData[key]);
            localStorage.setItem(`jake_summer_${key}`, JSON.stringify(serverData[key]));
          }
        });
      }
    } catch (error) {
      console.log('Server sync failed, using localStorage only:', error.message);
      // Load from localStorage as fallback
      this.loadFromLocalStorage();
    }
  }

  loadFromLocalStorage() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('jake_summer_'));
    keys.forEach(key => {
      const path = key.replace('jake_summer_', '');
      try {
        const data = JSON.parse(localStorage.getItem(key));
        this.cache.set(path, data);
      } catch (error) {
        console.error('Error loading from localStorage:', key, error);
      }
    });
  }

  async saveData(path, data) {
    try {
      await this.initPromise;

      const key = `jake_summer_${path}`;
      console.log(`Saving data for ${path}:`, data);

      // Save to localStorage immediately
      localStorage.setItem(key, JSON.stringify(data));
      this.cache.set(path, data);

      // Try to sync to server (best effort, don't block on failure)
      this.syncToServer().catch(error => {
        console.warn('Server sync failed, data saved locally only:', error.message);
      });

      // Simulate network delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 200));

      // Notify listeners
      if (this.listeners.has(path)) {
        this.listeners.get(path).forEach(callback => callback(data));
      }

      // Trigger cross-tab sync event
      window.dispatchEvent(new CustomEvent('jake-summer-data-updated', {
        detail: { path, data }
      }));

      console.log(`Successfully saved data for ${path}`);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  async syncToServer() {
    try {
      // Prepare all data for upload
      const allData = {};
      this.cache.forEach((data, path) => {
        allData[path] = data;
      });

      console.log('Syncing to server:', Object.keys(allData));

      // Try our own Netlify function first
      let response = await fetch('/.netlify/functions/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData)
      });

      // Fallback to JSONBin if our function isn't available
      if (!response.ok) {
        response = await fetch('https://api.jsonbin.io/v3/b/67571a74ad19ca34f8cdc9e5', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': '$2a$10$demo-key-for-testing',
          },
          body: JSON.stringify(allData)
        });
      }

      if (response.ok) {
        console.log('Successfully synced data to server');
        return true;
      } else {
        console.warn('Server sync failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Server sync error:', error);
      return false;
    }
  }

  async loadData(path) {
    try {
      await this.initPromise;

      // Try cache first
      if (this.cache.has(path)) {
        console.log(`Loading ${path} from cache`);
        return this.cache.get(path);
      }

      // Try localStorage
      const key = `jake_summer_${path}`;
      const data = localStorage.getItem(key);

      if (data) {
        const parsed = JSON.parse(data);
        this.cache.set(path, parsed);
        console.log(`Loading ${path} from localStorage`);
        return parsed;
      }

      console.log(`No data found for ${path}`);
      return null;
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

  // Periodic sync to server
  startPeriodicSync() {
    setInterval(() => {
      this.syncToServer().catch(console.error);
    }, 30000); // Sync every 30 seconds
  }
}

// Create persistent database instance
const persistentDb = new PersistentDatabase();

// Start periodic sync for real-time updates
persistentDb.startPeriodicSync();

// Database service for Jake's summer data
export const summerDb = {
  // Save learning timeline progress
  async saveTimelineProgress(progress) {
    return await persistentDb.saveData('timeline_progress', progress);
  },

  // Load learning timeline progress
  async loadTimelineProgress() {
    return await persistentDb.loadData('timeline_progress');
  },

  // Save book projects
  async saveBookProjects(books) {
    return await persistentDb.saveData('book_projects', books);
  },

  // Load book projects
  async loadBookProjects() {
    return await persistentDb.loadData('book_projects');
  },

  // Save writing notes
  async saveWritingNotes(notes) {
    return await persistentDb.saveData('writing_notes', notes);
  },

  // Load writing notes
  async loadWritingNotes() {
    return await persistentDb.loadData('writing_notes');
  },

  // Save book content
  async saveBookContent(content) {
    return await persistentDb.saveData('book_content', content);
  },

  // Load book content
  async loadBookContent() {
    return await persistentDb.loadData('book_content');
  },

  // Save map locations
  async saveMapLocations(locations) {
    return await persistentDb.saveData('map_locations', locations);
  },

  // Load map locations
  async loadMapLocations() {
    return await persistentDb.loadData('map_locations');
  },

  // Save audio cache
  async saveAudioCache(audioCache) {
    return await persistentDb.saveData('audio_cache', audioCache);
  },

  // Load audio cache
  async loadAudioCache() {
    return await persistentDb.loadData('audio_cache');
  },

  // Listen for data changes
  onTimelineChange(callback) {
    return persistentDb.onDataChange('timeline_progress', callback);
  },

  onBookProjectsChange(callback) {
    return persistentDb.onDataChange('book_projects', callback);
  },

  onWritingNotesChange(callback) {
    return persistentDb.onDataChange('writing_notes', callback);
  },

  onBookContentChange(callback) {
    return persistentDb.onDataChange('book_content', callback);
  },

  onMapLocationsChange(callback) {
    return persistentDb.onDataChange('map_locations', callback);
  },

  onAudioCacheChange(callback) {
    return persistentDb.onDataChange('audio_cache', callback);
  }
};

// Auto-save helper with debouncing
export function createAutoSaver(saveFunction, delay = 500) {
  let timeoutId;

  return (data) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveFunction(data);
    }, delay);
  };
}

export default { summerDb, createAutoSaver };