// Audio Cache System for BookReader
// Uses database for persistent storage of audio files and text hashes

import { summerDb } from './firebase';

class AudioCacheManager {
  constructor() {
    console.log('AudioCache: Initialized with database backend');
  }

  // Create a hash of the text for comparison
  async createTextHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate cache key
  getCacheKey(bookId, pageIndex) {
    return `${bookId}_page_${pageIndex}`;
  }

  // Check if audio exists in cache and text hasn't changed
  async getAudioFromCache(bookId, pageIndex, currentText) {
    try {
      const cacheKey = this.getCacheKey(bookId, pageIndex);
      const currentTextHash = await this.createTextHash(currentText);

      // Load audio cache from database
      const audioCache = await summerDb.loadAudioCache();
      const cachedEntry = audioCache?.[cacheKey];

      if (cachedEntry && cachedEntry.textHash === currentTextHash) {
        console.log('AudioCache: Cache hit - using stored audio');
        // Convert base64 back to blob and create URL
        const audioBlob = this.base64ToBlob(cachedEntry.audioData, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        return {
          audioUrl,
          cached: true,
          timestamp: cachedEntry.timestamp
        };
      } else if (cachedEntry) {
        console.log('AudioCache: Text changed - cache invalid');
        return null;
      } else {
        console.log('AudioCache: No cached audio found');
        return null;
      }
    } catch (error) {
      console.error('AudioCache: Error accessing cache:', error);
      return null;
    }
  }

  // Convert blob to base64 for storage
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data:mime;base64, prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert base64 back to blob
  base64ToBlob(base64Data, mimeType) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Store audio in cache with text hash
  async storeAudioInCache(bookId, pageIndex, text, audioBlob) {
    try {
      const cacheKey = this.getCacheKey(bookId, pageIndex);
      const textHash = await this.createTextHash(text);

      // Convert blob to base64 for storage
      const audioData = await this.blobToBase64(audioBlob);

      const cacheEntry = {
        bookId: bookId,
        pageIndex: pageIndex,
        textHash: textHash,
        text: text,
        audioData: audioData,
        timestamp: new Date().toISOString(),
        size: audioBlob.size
      };

      // Load existing cache, add/update entry, and save back
      const existingCache = await summerDb.loadAudioCache() || {};
      existingCache[cacheKey] = cacheEntry;

      const success = await summerDb.saveAudioCache(existingCache);

      if (success) {
        console.log(`AudioCache: Stored audio for ${cacheKey} (${audioBlob.size} bytes) in database`);
        return true;
      } else {
        console.error('AudioCache: Failed to save to database');
        return false;
      }
    } catch (error) {
      console.error('AudioCache: Error storing audio:', error);
      return false;
    }
  }

  // Clear cache for specific book
  async clearBookCache(bookId) {
    try {
      const audioCache = await summerDb.loadAudioCache() || {};

      // Filter out entries for this book
      const updatedCache = {};
      for (const [key, entry] of Object.entries(audioCache)) {
        if (entry.bookId !== bookId) {
          updatedCache[key] = entry;
        }
      }

      const success = await summerDb.saveAudioCache(updatedCache);
      if (success) {
        console.log(`AudioCache: Cleared cache for book ${bookId}`);
      }
      return success;
    } catch (error) {
      console.error('AudioCache: Error clearing book cache:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const audioCache = await summerDb.loadAudioCache() || {};
      const entries = Object.values(audioCache);
      const totalSize = entries.reduce((sum, item) => sum + (item.size || 0), 0);

      return {
        totalFiles: entries.length,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        files: entries.map(item => ({
          id: this.getCacheKey(item.bookId, item.pageIndex),
          bookId: item.bookId,
          pageIndex: item.pageIndex,
          timestamp: item.timestamp,
          size: item.size
        }))
      };
    } catch (error) {
      console.error('AudioCache: Error getting cache stats:', error);
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSizeMB: '0.00',
        files: []
      };
    }
  }

  // Clear all cache
  async clearAllCache() {
    try {
      const success = await summerDb.saveAudioCache({});
      if (success) {
        console.log('AudioCache: All cache cleared from database');
      }
      return success;
    } catch (error) {
      console.error('AudioCache: Error clearing all cache:', error);
      return false;
    }
  }
}

// Create singleton instance
const audioCache = new AudioCacheManager();

export default audioCache;