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
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (book && bookContent[book.id]) {
      setChapters(bookContent[book.id].chapters || []);
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
    }
  }, [book, bookContent]);

  const saveChapters = (newChapters) => {
    console.log('Saving chapters to database:', newChapters.length, 'chapters for book', book.id);
    setChapters(newChapters);
    setBookContent(prev => ({
      ...prev,
      [book.id]: { chapters: newChapters }
    }));
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
        sum + (ch.content?.split(' ').length || 0), 0
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
  const startDictation = () => {
    if (recognition && isSupported && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopDictation = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
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
              <div className="stats">
                <span>{getTotalWordCount()} words</span>
                <span>{chapters.length} chapters</span>
                <span>{Math.ceil(getTotalWordCount() / 250)} pages</span>
              </div>
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
              <div className="chapter-header">
                <h3>{chapters[currentChapter]?.title || 'Chapter'}</h3>
                <div className="chapter-stats">
                  {getWordCount()} words in this chapter
                </div>
              </div>

              <div className="writing-workspace">
                {/* Live Transcript Panel (Left Page) */}
                <div className="transcript-panel">
                  <div className="transcript-header">
                    <h4>Live Transcript</h4>
                    <div className="mic-status">
                      {isListening ? '🎤 Listening...' : '🎤 Ready'}
                    </div>
                  </div>

                  <div className="live-transcript-display">
                    <label>Speech Recognition:</label>
                    <div className={`transcript-text ${isListening ? 'listening' : ''}`}>
                      {transcript || (isListening ? "Start speaking..." : "Click 'Dictate' to begin")}
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

                  <div className="dictation-tips">
                    <h5>Voice Tips:</h5>
                    <ul>
                      <li>Speak clearly and at normal pace</li>
                      <li>Use punctuation commands: "period", "comma"</li>
                      <li>Edit text above before adding to chapter</li>
                      <li>Say "new paragraph" for line breaks</li>
                    </ul>
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

                  <div className="writing-tips">
                    <h5>Writing Tips:</h5>
                    <ul>
                      <li>Write in short, clear sentences</li>
                      <li>Use the dictation panel to speak naturally</li>
                      <li>Review and edit dictated text before adding</li>
                      <li>Save frequently - your work auto-saves</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Control Buttons - Always Visible */}
          <div className="voice-controls-bar">
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

          <div className="writer-footer">
            <div className="progress-info">
              Progress: {Math.round((getTotalWordCount() / (book.targetPages * 250)) * 100)}% of target
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