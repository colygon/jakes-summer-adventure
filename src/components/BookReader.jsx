import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import audioCache from '../utils/audioCache';
import '../styles/BookReader.css';

const BookReader = ({ book, isOpen, onClose, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [bookContent, setBookContent] = useAutoSaveData('book_content', {});

  // Sample book content - in real app this would come from the book data
  const sampleContent = {
    1: [
      "Once upon a time, in a small coastal town, there lived a young boy named Jake.",
      "Jake had always dreamed of grand adventures, but never imagined his summer would be so extraordinary.",
      "With his faithful companion Zuzu, a golden retriever with boundless energy, Jake was about to embark on the journey of a lifetime.",
      "Little did he know that mathematics, nature, and creativity would intertwine in the most magical ways."
    ],
    2: [
      "The Galapagos Islands held secrets that could only be unlocked through mathematical thinking.",
      "As Jake observed the unique wildlife, he began to see patterns everywhere - in the shells of tortoises, the flight patterns of birds, and the spiral formations of marine life.",
      "Each discovery led to a new mathematical concept, making learning an adventure rather than a chore.",
      "Zuzu seemed to understand the importance of these moments, sitting quietly as Jake sketched his observations."
    ],
    3: [
      "The summer sun cast long shadows as Jake reflected on all his adventures.",
      "From the mathematical wonders of the Galapagos to the peaceful beaches of Falmouth, every experience had shaped him.",
      "Writing had become his way of preserving these memories, and with each page, he felt himself growing.",
      "This was more than just a summer - it was a transformation, a discovery of who he was meant to become."
    ]
  };

  // Get actual book content from database or use fallback
  const getBookContent = () => {
    if (book && bookContent[book.id] && bookContent[book.id].chapters) {
      // Convert chapters to readable content
      const chapters = bookContent[book.id].chapters;
      const contentArray = [];

      chapters.forEach(chapter => {
        if (chapter.content && chapter.content.trim()) {
          // Split chapter content into readable chunks (paragraphs)
          const paragraphs = chapter.content.split('\n').filter(p => p.trim());
          contentArray.push(...paragraphs);
        }
      });

      return contentArray.length > 0 ? contentArray : [
        `"${book.title}" is ready for your words.`,
        "Start writing to see your story come to life here!",
        "Each chapter you write will appear as pages to read.",
        "Your creativity is the only limit to this adventure."
      ];
    }

    return sampleContent[book?.id] || [
      `This is the beginning of "${book?.title}" by Jake.`,
      "Every great story starts with a single word, a single idea.",
      "As you read these pages, imagine the adventures that await.",
      "The story continues to grow with each passing day..."
    ];
  };

  const bookContentPages = getBookContent();

  const totalPages = Math.ceil(bookContentPages.length / 2);

  const getPageContent = (pageIndex) => {
    const leftPageIndex = pageIndex * 2;
    const rightPageIndex = pageIndex * 2 + 1;

    return {
      left: bookContentPages[leftPageIndex] || "",
      right: bookContentPages[rightPageIndex] || ""
    };
  };

  const generateAudioFromAPI = async (text) => {
    console.log('Generating new audio with ElevenLabs API for text:', text);

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9IzcwKmvwJcw58h3KnlH', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': 'sk_d8f2501b76b5baab289a04ac720e2a10cea9018e247e6a2d'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  };

  const setupAudioPlayback = (audioUrl, cached = false) => {
    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);

    // Set up event listeners
    audio.oncanplaythrough = async () => {
      try {
        setIsGeneratingAudio(false);
        setIsPlaying(true);
        await audio.play();
        console.log(`Audio started playing successfully ${cached ? '(from cache)' : '(newly generated)'}`);
      } catch (playError) {
        console.error('Error playing audio:', playError);
        setIsPlaying(false);
        alert('Failed to play audio. Please try again.');
      }
    };

    audio.onended = () => {
      console.log('Audio playback completed');
      setIsPlaying(false);
      setCurrentAudio(null);
      if (!cached) {
        URL.revokeObjectURL(audioUrl); // Clean up memory for new audio
      }
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setIsGeneratingAudio(false);
      setCurrentAudio(null);
      if (!cached) {
        URL.revokeObjectURL(audioUrl);
      }
      alert('Audio playback failed. Please try again.');
    };

    audio.load();
    return audio;
  };

  const generateOrRetrieveAudio = async (text, bookId, pageIndex) => {
    setIsGeneratingAudio(true);

    try {
      // Check cache first
      console.log('AudioCache: Checking for cached audio...');
      const cachedAudio = await audioCache.getAudioFromCache(bookId, pageIndex, text);

      if (cachedAudio) {
        console.log('AudioCache: Using cached audio');
        setupAudioPlayback(cachedAudio.audioUrl, true);
        return;
      }

      // Generate new audio via API
      console.log('AudioCache: Generating new audio...');
      const audioBlob = await generateAudioFromAPI(text);

      // Store in cache
      await audioCache.storeAudioInCache(bookId, pageIndex, text, audioBlob);

      // Create audio URL and play
      const audioUrl = URL.createObjectURL(audioBlob);
      setupAudioPlayback(audioUrl, false);

    } catch (error) {
      console.error('Error with audio generation/caching:', error);
      setIsGeneratingAudio(false);
      setIsPlaying(false);

      if (error.message.includes('404')) {
        alert('Voice not found. Please check the voice ID configuration.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        alert('Invalid API key. Please check your ElevenLabs API configuration.');
      } else if (error.message.includes('429')) {
        alert('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        alert(`Audio generation failed: ${error.message}`);
      }
    }
  };

  const playAudio = () => {
    const currentPageContent = getPageContent(currentPage);
    const textToRead = `${currentPageContent.left} ${currentPageContent.right}`.trim();

    if (!textToRead) return;

    // Use the caching system to generate or retrieve audio
    generateOrRetrieveAudio(textToRead, book?.id || 'unknown', currentPage);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      console.log('Audio stopped and reset');
    } else {
      setIsPlaying(false);
      console.log('Audio stop requested - no current audio to stop');
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const currentPageContent = getPageContent(currentPage);

  useEffect(() => {
    // Reset page when book changes
    setCurrentPage(0);
    setIsPlaying(false);

    // Clean up any playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  }, [book?.id, bookContent, currentAudio]);

  if (!isOpen || !book) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="book-reader-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="book-reader"
          initial={{ scale: 0.8, rotateY: -30 }}
          animate={{ scale: 1, rotateY: 0 }}
          exit={{ scale: 0.8, rotateY: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="book-cover-header">
            <h2>{book.title}</h2>
            <button className="close-book-btn" onClick={onClose}>✕</button>
          </div>

          <div className="book-spine-visual"></div>

          <div className="book-pages">
            <div className="page left-page">
              <div className="page-number">{currentPage * 2 + 1}</div>
              <div className="page-content">
                <p>{currentPageContent.left}</p>
              </div>
            </div>

            <div className="page right-page">
              <div className="page-number">{currentPage * 2 + 2}</div>
              <div className="page-content">
                <p>{currentPageContent.right}</p>
              </div>
            </div>
          </div>

          <div className="book-controls">
            <div className="navigation-controls">
              <button
                className="nav-btn prev-btn"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>

              <div className="page-indicator">
                Pages {currentPage * 2 + 1}-{currentPage * 2 + 2}
              </div>

              <button
                className="nav-btn next-btn"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                Next →
              </button>
            </div>

            <div className="media-controls">
              {!isPlaying ? (
                <button
                  className="audio-btn play-btn"
                  onClick={playAudio}
                  disabled={isGeneratingAudio}
                >
                  {isGeneratingAudio ? '🔄 Generating...' : '🔊 Play Audio'}
                </button>
              ) : (
                <button
                  className="audio-btn stop-btn"
                  onClick={stopAudio}
                >
                  ⏹️ Stop Audio
                </button>
              )}

              <button
                className="edit-btn"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
              >
                ✏️ Edit Book
              </button>
            </div>
          </div>

          <div className="book-progress">
            <div
              className="progress-bar-reader"
              style={{
                width: `${((currentPage + 1) / totalPages) * 100}%`
              }}
            ></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookReader;