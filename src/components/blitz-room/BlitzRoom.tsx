import React, { useState, useEffect } from 'react';
import { fetchQuizzes, getRandomQuizByCategory } from '../../services/battle-arena.service'; 
import { useNavigate } from 'react-router-dom';
import './BlitzRoom.css';

const BlitzQuizRoom: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const fetchedQuizzes = await fetchQuizzes();
        const uniqueCategories = Array.from(new Set(fetchedQuizzes.map((quiz) => quiz.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    loadQuizzes();
  }, []);

  const handleStartBlitzQuiz = async () => {
    if (selectedCategory) {
      setLoading(true);
      try {
        const randomQuiz = await getRandomQuizByCategory(selectedCategory);
        setLoading(false);
        navigate(`/blitz-mode/${randomQuiz.quizID}`);
      } catch (error) {
        console.error('Error starting Blitz Quiz:', error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="quiz-room-container">
      <h3>Select a Category for Blitz Quiz</h3>
      <select
        className="form-control"
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((category, idx) => (
          <option key={idx} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary mt-3"
        onClick={handleStartBlitzQuiz}
        disabled={!selectedCategory || loading}
      >
        {loading ? 'Loading...' : 'Start Blitz Quiz'}
      </button>
    </div>
  );
};

export default BlitzQuizRoom;
