import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import '../styles/CreativeCorner.css';

const initialBookIdeas = [
  {
    id: 1,
    title: "Adventures with Zuzu",
    genre: "Adventure",
    description: "A tale of a boy and his dog exploring amazing places",
    pages: 0,
    targetPages: 150,
    color: "from-green-400 to-blue-500"
  },
  {
    id: 2,
    title: "Math Magic in the Galapagos",
    genre: "Educational Fiction",
    description: "Discovering mathematical patterns in nature",
    pages: 12,
    targetPages: 100,
    color: "from-purple-400 to-pink-500"
  },
  {
    id: 3,
    title: "Summer of Discovery",
    genre: "Coming-of-Age",
    description: "A summer that changes everything",
    pages: 25,
    targetPages: 200,
    color: "from-orange-400 to-red-500"
  }
];

const writingTips = [
  "Start with what you know - your own experiences",
  "Write a little bit every day, even if it's just 5 minutes",
  "Don't worry about perfection in your first draft",
  "Let your imagination run wild!",
  "Read lots of books to inspire your own writing"
];

const BookCard = ({ book, index, onUpdatePages, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState(book);
  const progressPercentage = (book.pages / book.targetPages) * 100;

  const handleSave = () => {
    onUpdatePages(book.id, editedBook.pages, editedBook.targetPages);
    setIsEditing(false);
  };

  const handleAddPages = () => {
    const newPages = Math.min(book.targetPages, book.pages + 5);
    onUpdatePages(book.id, newPages, book.targetPages);
  };

  return (
    <motion.div
      className="book-card"
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
    >
      <div className={`book-cover bg-gradient-to-r ${book.color}`}>
        <div className="book-spine"></div>
        <div className="book-content">
          <h3>{book.title}</h3>
          <span className="genre-tag">{book.genre}</span>
          <p>{book.description}</p>

          <div className="writing-progress">
            {!isEditing ? (
              <>
                <div className="progress-text">
                  {book.pages} / {book.targetPages} pages
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
                  <button className="add-pages-btn" onClick={handleAddPages}>
                    +5 pages
                  </button>
                  <button className="edit-book-btn" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                  <button className="delete-book-btn" onClick={() => onDelete(book.id)}>
                    🗑️
                  </button>
                </div>
              </>
            ) : (
              <div className="book-editor">
                <label>
                  Pages Written:
                  <input
                    type="number"
                    value={editedBook.pages}
                    onChange={(e) => setEditedBook({ ...editedBook, pages: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={editedBook.targetPages}
                  />
                </label>
                <label>
                  Target Pages:
                  <input
                    type="number"
                    value={editedBook.targetPages}
                    onChange={(e) => setEditedBook({ ...editedBook, targetPages: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </label>
                <div className="editor-buttons">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
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

  const colors = [
    "from-blue-400 to-purple-500",
    "from-green-400 to-teal-500",
    "from-yellow-400 to-orange-500",
    "from-pink-400 to-red-500",
    "from-indigo-400 to-blue-500"
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
  const [notes, setNotes] = useLocalStorage('jakeWritingNotes', '');

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % writingTips.length);
  };

  return (
    <motion.div
      className="writing-workspace"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="workspace-header">
        <h3>Writing Workspace</h3>
        <span className="workspace-icon">✍️</span>
      </div>

      <div className="notebook">
        <div className="notebook-lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <textarea
          className="writing-notes"
          placeholder="Write your story ideas, notes, or start your book here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="tip-section">
        <h4>Writing Tip of the Day</h4>
        <motion.div
          className="tip-card-mini"
          key={currentTip}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>{writingTips[currentTip]}</p>
          <button onClick={nextTip} className="next-tip-btn">
            Next Tip 💡
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const CreativeCorner = () => {
  const [bookIdeas, setBookIdeas] = useLocalStorage('jakeBookProjects', initialBookIdeas);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdatePages = (bookId, pages, targetPages) => {
    setBookIdeas(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, pages, targetPages } : book
      )
    );
  };

  const handleAddBook = (newBook) => {
    setBookIdeas(prevBooks => [...prevBooks, newBook]);
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
                onUpdatePages={handleUpdatePages}
                onDelete={handleDeleteBook}
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
      </motion.div>
    </section>
  );
};

export default CreativeCorner;