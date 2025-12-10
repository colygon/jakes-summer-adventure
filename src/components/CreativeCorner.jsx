import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAutoSaveData } from '../hooks/useAutoSaveData';
import BookReader from './BookReader';
import BookWriter from './BookWriter';
import '../styles/CreativeCorner.css';

const initialBookIdeas = [
  {
    id: 1,
    title: "Adventures with Zuzu",
    genre: "Adventure",
    description: "A tale of a boy and his dog exploring amazing places",
    pages: 0,
    targetPages: 150,
    color: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "Math Magic in the Galapagos",
    genre: "Educational Fiction",
    description: "Discovering mathematical patterns in nature",
    pages: 12,
    targetPages: 100,
    color: "from-teal-500 to-green-600"
  },
  {
    id: 3,
    title: "Summer of Discovery",
    genre: "Adventure",
    description: "A summer that changes everything",
    pages: 25,
    targetPages: 200,
    color: "from-orange-500 to-red-600"
  }
];

const writingTips = [
  "Start with what you know - your own experiences",
  "Write a little bit every day, even if it's just 5 minutes",
  "Don't worry about perfection in your first draft",
  "Let your imagination run wild!",
  "Read lots of books to inspire your own writing"
];

const generateBookCover = (book) => {
  // Create a data URL for the book cover based on title and genre
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 400;

  // Extract gradient colors from book.color
  const gradientMap = {
    'from-blue-500 to-purple-600': ['#3b82f6', '#9333ea'],
    'from-green-500 to-teal-600': ['#22c55e', '#0d9488'],
    'from-orange-500 to-red-600': ['#f97316', '#dc2626'],
    'from-purple-500 to-pink-600': ['#a855f7', '#ec4899'],
    'from-blue-400 to-teal-500': ['#60a5fa', '#14b8a6'],
    'from-teal-500 to-green-600': ['#14b8a6', '#059669'],
    'from-red-500 to-orange-600': ['#ef4444', '#ea580c'],
    'from-indigo-500 to-purple-600': ['#6366f1', '#9333ea'],
    'from-cyan-500 to-blue-600': ['#06b6d4', '#2563eb'],
    'from-emerald-500 to-teal-600': ['#10b981', '#0d9488']
  };

  const [color1, color2] = gradientMap[book.color] || ['#3b82f6', '#9333ea'];

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle texture overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add title text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;

  // Wrap text for long titles
  const words = book.title.split(' ');
  const maxWidth = canvas.width - 40;
  let line = '';
  let y = 120;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, canvas.width / 2, y);
      line = words[n] + ' ';
      y += 30;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // Add genre
  ctx.font = '16px "Open Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(book.genre, canvas.width / 2, y + 50);

  // Add decorative element based on genre with background circle for visibility
  const genreIcons = {
    'Adventure': '🏔️',
    'Educational Fiction': '🧮',
    'Fantasy': '✨',
    'Mystery': '🔍',
    'Sci-Fi': '🚀',
    'Romance': '💕',
    'Horror': '👻'
  };

  const icon = genreIcons[book.genre] || '📚';

  // Draw background circle for emoji visibility
  const iconX = canvas.width / 2;
  const iconY = canvas.height - 60;
  ctx.beginPath();
  ctx.arc(iconX, iconY - 10, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw emoji on top of background
  ctx.font = '40px Arial';
  ctx.fillText(icon, iconX, iconY);

  return canvas.toDataURL();
};

const BookCard = ({ book, index, onDelete, onRead, onWrite }) => {
  const progressPercentage = (book.pages / book.targetPages) * 100;
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    // Generate book cover when component mounts or book changes
    try {
      const imageUrl = generateBookCover(book);
      setCoverImage(imageUrl);
    } catch (error) {
      console.warn('Failed to generate book cover:', error);
      setCoverImage(null);
    }
  }, [book.title, book.genre, book.color]);

  return (
    <motion.div
      className="book-card"
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
    >
      <div className={`book-cover ${!coverImage ? `bg-gradient-to-r ${book.color}` : ''}`} style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="book-spine"></div>
        <div className="book-content">
          {!coverImage && (
            <>
              <h3>{book.title}</h3>
              <span className="genre-tag">{book.genre}</span>
              <p>{book.description}</p>
            </>
          )}

          <div className="writing-progress">
            <div className="progress-text">
              {book.pages} pages written (target: {book.targetPages})
              {progressPercentage === 100 && <span className="book-complete">📖 Complete!</span>}
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              ></motion.div>
            </div>
            <div className="book-actions">
              <button className="read-book-btn" onClick={() => onRead(book)}>
                📖 Read
              </button>
              <button className="write-book-btn" onClick={() => onWrite(book)}>
                ✍️ Write
              </button>
              <button className="delete-book-btn" onClick={() => onDelete(book.id)}>
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AddBookForm = ({ onAdd, onClose }) => {
  const [newBook, setNewBook] = useState({
    title: '',
    genre: '',
    description: '',
    targetPages: 100
  });

  // Beach and nature themed colors that stand out from sandy background
  const colors = [
    "from-blue-500 to-purple-600",      // Ocean to deep purple
    "from-green-500 to-teal-600",       // Seaweed to teal
    "from-orange-500 to-red-600",       // Sunset orange to coral
    "from-purple-500 to-pink-600",      // Purple to tropical pink
    "from-blue-400 to-teal-500",        // Light ocean to turquoise
    "from-teal-500 to-green-600",       // Turquoise to palm green
    "from-red-500 to-orange-600",       // Coral to sunset
    "from-indigo-500 to-purple-600",    // Deep ocean to purple
    "from-cyan-500 to-blue-600",        // Cyan waves to ocean
    "from-emerald-500 to-teal-600"      // Emerald sea to teal
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBook.title && newBook.genre) {
      onAdd({
        ...newBook,
        id: Date.now(),
        pages: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      onClose();
    }
  };

  return (
    <motion.div
      className="add-book-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Add New Book Project</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Book Title"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Genre"
          value={newBook.genre}
          onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={newBook.description}
          onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target Pages"
          value={newBook.targetPages}
          onChange={(e) => setNewBook({ ...newBook, targetPages: parseInt(e.target.value) || 100 })}
          min="1"
        />
        <div className="form-buttons">
          <button type="submit">Add Book</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
};

const WritingWorkspace = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [notes, setNotes, { saveStatus, isLoading, lastSaved }] = useAutoSaveData('notes', '');

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % writingTips.length);
  };

  // Debug logging for persistence
  useEffect(() => {
    console.log('WritingWorkspace: Notes state changed:', notes);
    console.log('WritingWorkspace: Save status:', saveStatus);
    console.log('WritingWorkspace: Last saved:', lastSaved);
    console.log('WritingWorkspace: Is loading:', isLoading);
  }, [notes, saveStatus, lastSaved, isLoading]);

  return (
    <motion.div
      className="writing-workspace"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Title Section with Writing Tip Below */}
      <div className="workspace-content-column">
        <div className="workspace-header">
          <h3>Writing Workspace</h3>
          <span className="workspace-icon">✍️</span>
        </div>

        {/* Writing Tip Below Title in Same Column */}
        <div className="tip-section">
          <h4>Writing Tip of the Day</h4>
          <motion.div
            className="tip-card-mini"
            key={currentTip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p>{writingTips[currentTip]}</p>
            <button onClick={nextTip} className="next-tip-btn">
              Next Tip 💡
            </button>
          </motion.div>
        </div>

        {/* Writing Area Below Tip */}
        <div className="notebook">
          <div className="notebook-lines">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          <div className="notes-container">
            <textarea
              className="writing-notes"
              placeholder="Write your story ideas, notes, or start your book here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="notes-save-status">
              {isLoading && <span className="loading">🔄 Loading...</span>}
              {saveStatus === 'saving' && <span className="saving">💾 Saving...</span>}
              {saveStatus === 'saved' && <span className="saved">✓ Saved{lastSaved ? ` at ${lastSaved}` : ''}</span>}
              {saveStatus === 'error' && <span className="error">⚠ Save Error</span>}
              {!isLoading && notes.length > 0 && <span className="char-count">{notes.length} characters</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreativeCorner = () => {
  const [bookIdeas, setBookIdeas, { isLoading, saveStatus, lastSaved }] = useAutoSaveData('books', initialBookIdeas);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBookForReading, setSelectedBookForReading] = useState(null);
  const [selectedBookForWriting, setSelectedBookForWriting] = useState(null);

  // Listen for custom event to open book reader from book writer
  useEffect(() => {
    const handleOpenBookReader = (event) => {
      const { book } = event.detail;
      setSelectedBookForWriting(null);
      setSelectedBookForReading(book);
    };

    window.addEventListener('openBookReader', handleOpenBookReader);

    return () => {
      window.removeEventListener('openBookReader', handleOpenBookReader);
    };
  }, []);

  const handleUpdatePages = (bookId, pages, targetPages) => {
    console.log('CreativeCorner: Updating book pages:', {
      bookId,
      pages,
      targetPages
    });
    setBookIdeas(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId) {
          console.log('CreativeCorner: Found book to update:', book.title);
          return { ...book, pages, targetPages };
        }
        return book;
      })
    );
  };

  const handleAddBook = (newBook) => {
    console.log('Adding new book to database:', newBook);
    setBookIdeas(prevBooks => {
      const updatedBooks = [...prevBooks, newBook];
      console.log('Updated book list (will auto-save):', updatedBooks);
      return updatedBooks;
    });
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book project?')) {
      setBookIdeas(prevBooks => prevBooks.filter(book => book.id !== bookId));
    }
  };

  const totalPages = bookIdeas.reduce((sum, book) => sum + book.pages, 0);
  const totalTargetPages = bookIdeas.reduce((sum, book) => sum + book.targetPages, 0);
  const overallProgress = totalTargetPages > 0 ? (totalPages / totalTargetPages * 100).toFixed(1) : 0;

  return (
    <section className="creative-section">
      <motion.div
        className="creative-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="section-title"
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Creative Corner 📖
          {saveStatus === 'saving' && <span className="save-status-indicator">💾 Saving...</span>}
          {saveStatus === 'saved' && <span className="save-status-indicator">✓</span>}
          {saveStatus === 'error' && <span className="save-status-indicator">⚠ Error</span>}
        </motion.h2>

        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Every great author started with a single page
        </motion.p>

        <div className="writing-stats">
          <div className="stat-card">
            <h4>Total Pages Written</h4>
            <p className="stat-number">{totalPages}</p>
          </div>
          <div className="stat-card">
            <h4>Overall Progress</h4>
            <p className="stat-number">{overallProgress}%</p>
          </div>
          <div className="stat-card">
            <h4>Active Projects</h4>
            <p className="stat-number">{bookIdeas.length}</p>
          </div>
        </div>

        <div className="book-shelf">
          <div className="shelf-header">
            <h3>Book Projects</h3>
            <button className="add-book-btn" onClick={() => setShowAddForm(true)}>
              + New Book
            </button>
          </div>

          {showAddForm && (
            <AddBookForm
              onAdd={handleAddBook}
              onClose={() => setShowAddForm(false)}
            />
          )}

          <div className="books-grid">
            {bookIdeas.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                onDelete={handleDeleteBook}
                onRead={(book) => setSelectedBookForReading(book)}
                onWrite={(book) => setSelectedBookForWriting(book)}
              />
            ))}
          </div>
        </div>

        <WritingWorkspace />

        <motion.div
          className="inspiration-quote"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <blockquote>
            "The beautiful thing about learning is that nobody can take it away from you."
            <cite>— B.B. King</cite>
          </blockquote>
        </motion.div>

        {/* Book Reader Modal */}
        <BookReader
          book={selectedBookForReading}
          isOpen={!!selectedBookForReading}
          onClose={() => setSelectedBookForReading(null)}
          onEdit={() => {
            setSelectedBookForWriting(selectedBookForReading);
            setSelectedBookForReading(null);
          }}
        />

        {/* Book Writer Modal */}
        <BookWriter
          book={selectedBookForWriting}
          isOpen={!!selectedBookForWriting}
          onClose={() => setSelectedBookForWriting(null)}
          onUpdateBook={handleUpdatePages}
        />
      </motion.div>
    </section>
  );
};

export default CreativeCorner;