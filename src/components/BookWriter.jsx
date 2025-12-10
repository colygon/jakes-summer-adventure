import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import '../styles/BookWriter.css';

const BookWriter = ({ book, isOpen, onClose, onUpdateBook }) => {
  const [bookContent, setBookContent, { saveStatus: contentSaveStatus }] = useAutoSaveData('book_content', {});
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const dictationRef = useRef(null);
  const isListeningRef = useRef(false);

  // Target page editing state
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetPageInput, setTargetPageInput] = useState('');
  const [showTargetFeedback, setShowTargetFeedback] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          setDictationText(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        // Handle specific errors for Brave browser
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
          // Don't stop for no-speech errors, just continue
          return;
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted');
          setIsListening(false);
          isListeningRef.current = false;
        } else {
          setIsListening(false);
          isListeningRef.current = false;
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        // If we're supposed to be listening but recognition ended, try to restart
        if (isListeningRef.current) {
          console.log('Attempting to restart speech recognition...');
          setTimeout(() => {
            if (isListeningRef.current && recognitionInstance) {
              try {
                recognitionInstance.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                setIsListening(false);
                isListeningRef.current = false;
              }
            }
          }, 100);
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (book && bookContent[book.id]) {
      const chapters = bookContent[book.id].chapters || [];
      setChapters(chapters);
      console.log('BookWriter: Loaded existing chapters:', chapters.length);

      // Update page count on load
      const totalWords = chapters.reduce((sum, ch) =>
        sum + (ch.content?.split(' ').filter(w => w.length > 0).length || 0), 0
      );
      const estimatedPages = Math.floor(totalWords / 250);
      console.log('BookWriter: Initial page count update:', { totalWords, estimatedPages });
      onUpdateBook(book.id, estimatedPages, book.targetPages);

    } else if (book) {
      // Initialize with sample content
      const initialChapters = [
        {
          id: 1,
          title: "The Beginning",
          content: "Write your story here. Every great adventure starts with a single word..."
        }
      ];
      setChapters(initialChapters);
      setBookContent(prev => ({
        ...prev,
        [book.id]: { chapters: initialChapters }
      }));
      console.log('BookWriter: Created initial chapters for new book');

      // Set initial page count
      const totalWords = initialChapters.reduce((sum, ch) =>
        sum + (ch.content?.split(' ').filter(w => w.length > 0).length || 0), 0
      );
      const estimatedPages = Math.floor(totalWords / 250);
      onUpdateBook(book.id, estimatedPages, book.targetPages);
    }
  }, [book, bookContent]);

  const saveChapters = (newChapters) => {
    console.log('BookWriter: Saving chapters to database:', newChapters.length, 'chapters for book', book.id);
    setChapters(newChapters);
    setBookContent(prev => {
      const updated = {
        ...prev,
        [book.id]: { chapters: newChapters }
      };
      console.log('BookWriter: Updated book content state:', updated);
      return updated;
    });
  };

  const updateCurrentChapter = (content) => {
    const updatedChapters = [...chapters];
    if (updatedChapters[currentChapter]) {
      updatedChapters[currentChapter].content = content;
      saveChapters(updatedChapters);

      // Update the book pages count in the main book list
      const totalWords = updatedChapters.reduce((sum, ch) =>
        sum + (ch.content?.split(' ').filter(w => w.length > 0).length || 0), 0
      );
      const estimatedPages = Math.floor(totalWords / 250); // ~250 words per page
      console.log('BookWriter: Updating page count:', {
        bookId: book.id,
        totalWords,
        estimatedPages,
        targetPages: book.targetPages
      });
      onUpdateBook(book.id, estimatedPages, book.targetPages);
    }
  };

  const addNewChapter = () => {
    if (newChapterTitle.trim()) {
      const newChapter = {
        id: Date.now(),
        title: newChapterTitle.trim(),
        content: "Start writing this chapter..."
      };
      const updatedChapters = [...chapters, newChapter];
      saveChapters(updatedChapters);
      setNewChapterTitle('');
      setIsAddingChapter(false);
      setCurrentChapter(updatedChapters.length - 1);

      // Update book pages count
      const totalWords = updatedChapters.reduce((sum, ch) =>
        sum + (ch.content?.split(' ').filter(w => w.length > 0).length || 0), 0
      );
      const estimatedPages = Math.floor(totalWords / 250); // ~250 words per page
      onUpdateBook(book.id, estimatedPages, book.targetPages);
    }
  };

  const deleteChapter = (chapterIndex) => {
    if (chapters.length > 1 && window.confirm('Delete this chapter?')) {
      const updatedChapters = chapters.filter((_, index) => index !== chapterIndex);
      saveChapters(updatedChapters);
      if (currentChapter >= updatedChapters.length) {
        setCurrentChapter(updatedChapters.length - 1);
      }

      // Update book pages count after deletion
      const totalWords = updatedChapters.reduce((sum, ch) =>
        sum + (ch.content?.split(' ').filter(w => w.length > 0).length || 0), 0
      );
      const estimatedPages = Math.floor(totalWords / 250); // ~250 words per page
      onUpdateBook(book.id, estimatedPages, book.targetPages);
    }
  };

  const getWordCount = () => {
    const currentContent = chapters[currentChapter]?.content || '';
    return currentContent.split(' ').filter(word => word.length > 0).length;
  };

  const getTotalWordCount = () => {
    return chapters.reduce((sum, chapter) =>
      sum + (chapter.content?.split(' ').filter(word => word.length > 0).length || 0), 0
    );
  };

  // Speech recognition functions
  const startDictation = async () => {
    if (recognition && isSupported && !isListening) {
      try {
        // Check microphone permissions first
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          if (permission.state === 'denied') {
            alert('Microphone access is blocked. Please enable microphone access in your browser settings and refresh the page.');
            return;
          }
        }

        setTranscript('');
        setIsListening(true);
        isListeningRef.current = true;
        recognition.start();
        console.log('Speech recognition started');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        isListeningRef.current = false;
        alert('Failed to start speech recognition. Please check your microphone permissions.');
      }
    }
  };

  const stopDictation = () => {
    if (recognition && isListening) {
      isListeningRef.current = false;
      recognition.stop();
      setIsListening(false);
      console.log('Speech recognition stopped by user');
    }
  };

  const clearDictation = () => {
    setDictationText('');
    setTranscript('');
  };

  const insertDictationToChapter = () => {
    if (dictationText.trim()) {
      const currentContent = chapters[currentChapter]?.content || '';
      const updatedContent = currentContent + (currentContent ? '\n\n' : '') + dictationText.trim();

      console.log('Adding dictated text to chapter:', dictationText.trim());
      console.log('Updated chapter content:', updatedContent);

      updateCurrentChapter(updatedContent);

      // Clear dictation after successful addition
      setDictationText('');
      setTranscript('');

      // Show success feedback
      setShowAddedFeedback(true);
      setTimeout(() => setShowAddedFeedback(false), 2000);

      // Provide user feedback
      console.log('Dictated text added to chapter and saved to database');
    }
  };

  // Target page functions
  const startEditingTarget = () => {
    setIsEditingTarget(true);
    setTargetPageInput(book.targetPages.toString());
  };

  const saveTargetPages = () => {
    const newTarget = parseInt(targetPageInput);
    if (newTarget && newTarget > 0) {
      onUpdateBook(book.id, book.pages, newTarget);
      setIsEditingTarget(false);
      setShowTargetFeedback(true);
      setTimeout(() => setShowTargetFeedback(false), 2000);
      console.log('Updated target pages to:', newTarget);
    }
  };

  const cancelEditingTarget = () => {
    setIsEditingTarget(false);
    setTargetPageInput('');
  };

  if (!isOpen || !book) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="book-writer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="book-writer"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="writer-header">
            <div className="book-info">
              <h2>Writing: {book.title}</h2>
            </div>
            <button className="close-writer-btn" onClick={onClose}>✕</button>
          </div>

          <div className="writer-content">
            <div className="chapters-sidebar">
              <div className="chapters-header">
                <h3>Chapters</h3>
                <button
                  className="add-chapter-btn"
                  onClick={() => setIsAddingChapter(true)}
                >
                  +
                </button>
              </div>

              <div className="chapters-list">
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`chapter-item ${index === currentChapter ? 'active' : ''}`}
                    onClick={() => setCurrentChapter(index)}
                  >
                    <div className="chapter-title">{chapter.title}</div>
                    <div className="chapter-info">
                      {(chapter.content?.split(' ').filter(w => w.length > 0).length || 0)} words
                    </div>
                    {chapters.length > 1 && (
                      <button
                        className="delete-chapter-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChapter(index);
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}

                {isAddingChapter && (
                  <div className="add-chapter-form">
                    <input
                      type="text"
                      placeholder="Chapter title..."
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNewChapter()}
                      autoFocus
                    />
                    <div className="form-buttons">
                      <button onClick={addNewChapter}>Add</button>
                      <button onClick={() => setIsAddingChapter(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="writing-area">
              <div className="writing-workspace">
                {/* Live Transcript Panel (Left Page) */}
                <div className="transcript-panel">
                  {/* Voice Control Buttons */}
                  <div className="voice-controls-inline">
                    {isSupported && (
                      <>
                        <button
                          className={`dictate-btn ${isListening ? 'listening' : ''}`}
                          onClick={isListening ? stopDictation : startDictation}
                        >
                          {isListening ? '⏹️ Stop' : '🎤 Dictate'}
                        </button>
                        <button
                          className="clear-btn"
                          onClick={clearDictation}
                          disabled={!dictationText}
                        >
                          🗑️ Clear
                        </button>
                        <button
                          className="insert-btn"
                          onClick={insertDictationToChapter}
                          disabled={!dictationText.trim()}
                        >
                          {showAddedFeedback ? '✅ Added!' : '➡️ Add to Chapter'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="live-transcript-display">
                    <label>Speech Recognition:</label>
                    <div className={`transcript-text ${isListening ? 'listening' : ''}`}>
                      {transcript || (isListening ? "Start speaking..." : "Click 'Dictate' to begin")}
                    </div>
                    <div className="dictation-tips">
                      <h5>Voice Tips:</h5>
                      <ul>
                        <li>Speak clearly and at normal pace</li>
                        <li>Use punctuation commands: "period", "comma", "question mark"</li>
                        <li>Say "new paragraph" for line breaks</li>
                        <li>Edit your text before adding to chapter</li>
                      </ul>
                    </div>
                  </div>

                  <div className="dictated-content">
                    <label>Dictated Text (Edit before adding):</label>
                    <textarea
                      ref={dictationRef}
                      className="dictation-textarea"
                      value={dictationText}
                      onChange={(e) => setDictationText(e.target.value)}
                      placeholder="Your dictated text will appear here for editing..."
                    />
                  </div>

                  <div className="transcript-controls">
                    {!isSupported && (
                      <div className="unsupported-message">
                        Speech recognition not supported in this browser
                      </div>
                    )}
                  </div>

                </div>

                {/* Chapter Text Panel (Right Page) */}
                <div className="text-panel">
                  <div className="text-header">
                    <h4>Chapter Content</h4>
                    <div className="editor-tools">
                      <button
                        className="auto-format-btn"
                        onClick={() => {
                          const content = chapters[currentChapter]?.content || '';
                          const formatted = content
                            .split('.')
                            .map(sentence => sentence.trim())
                            .filter(sentence => sentence.length > 0)
                            .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
                            .join('. ');
                          updateCurrentChapter(formatted + (formatted.endsWith('.') ? '' : '.'));
                        }}
                      >
                        📝 Format
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="chapter-editor"
                    value={chapters[currentChapter]?.content || ''}
                    onChange={(e) => updateCurrentChapter(e.target.value)}
                    placeholder="Your chapter content appears here. Use voice dictation on the left to add content..."
                  />

                </div>
              </div>
            </div>
          </div>


          <div className="writer-footer">
            <div className="book-stats">
              <span>{getTotalWordCount()} words</span>
              <span>{chapters.length} chapters</span>
              <span>{Math.ceil(getTotalWordCount() / 250)} pages</span>
            </div>
            <div className="progress-info">
              Progress: {Math.round((getTotalWordCount() / (book.targetPages * 250)) * 100)}% of target
              {!isEditingTarget ? (
                <button className="set-target-btn" onClick={startEditingTarget}>
                  {showTargetFeedback ? '✅ Target Updated!' : '📋 Set Target'}
                </button>
              ) : (
                <div className="target-edit-form">
                  <input
                    type="number"
                    value={targetPageInput}
                    onChange={(e) => setTargetPageInput(e.target.value)}
                    placeholder="Target pages"
                    className="target-input"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && saveTargetPages()}
                  />
                  <button onClick={saveTargetPages} className="save-target-btn">✓</button>
                  <button onClick={cancelEditingTarget} className="cancel-target-btn">✕</button>
                </div>
              )}
            </div>
            <div className="save-status">
              {contentSaveStatus === 'saving' && <span className="saving">💾 Saving...</span>}
              {contentSaveStatus === 'saved' && <span className="saved">✓ Auto-saved</span>}
              {contentSaveStatus === 'error' && <span className="error">⚠ Save failed</span>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookWriter;