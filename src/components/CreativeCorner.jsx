import { motion } from 'framer-motion';
import { useState } from 'react';
import '../styles/CreativeCorner.css';

const bookIdeas = [
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

const BookCard = ({ book, index }) => {
  const progressPercentage = (book.pages / book.targetPages) * 100;

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
            <div className="progress-text">
              {book.pages} / {book.targetPages} pages
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WritingWorkspace = () => {
  const [currentTip, setCurrentTip] = useState(0);

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
        <motion.p
          className="writing-sample"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          "The summer breeze carried the scent of salt water as Jake and Zuzu
          stepped onto the sandy shore of Cape Cod..."
        </motion.p>
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

        <div className="book-shelf">
          <h3>Book Ideas</h3>
          <div className="books-grid">
            {bookIdeas.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
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