import React, { useState, useEffect } from 'react';
import { fetchQuizzes } from '../../services/battle-arena.service'; 
import { useNavigate } from 'react-router-dom';
import QuizDataType from '../../types/QuizDataType';
import './SampleQuizRoom.css'; 

const SampleQuizRoom: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizDataType[]>([]); 
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizDataType[]>([]); 
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDataType | null>(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const fetchedQuizzes = await fetchQuizzes(); 
        setQuizzes(fetchedQuizzes); 
        const uniqueCategories = Array.from(new Set(fetchedQuizzes.map((quiz) => quiz.category)));
        setCategories(uniqueCategories); 
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = quizzes.filter((quiz) => quiz.category === selectedCategory);
      setFilteredQuizzes(filtered); 
    }
  }, [selectedCategory, quizzes]);

  const handleStartSampleQuiz = () => {
    if (selectedQuiz) {
      navigate(`/sample-mode/${selectedQuiz.quizID}`);
    }
  };

  return (
    <div className="quiz-room-container">
      <h3>Select a Category and Quiz for Sample Quiz</h3>
      <select
        className="form-control"
        onChange={(e) => {
          setSelectedCategory(e.target.value); 
          setSelectedQuiz(null); 
        }}
      >
        <option value="">Select Category</option>
        {categories.map((category, idx) => (
          <option key={idx} value={category}>
            {category}
          </option>
        ))}
      </select>
      {selectedCategory && (
        <>
          <h4>Select a Quiz from {selectedCategory}</h4>
          <select
            className="form-control"
            onChange={(e) => {
              const quiz = filteredQuizzes.find((q) => q.quizID === e.target.value);
              setSelectedQuiz(quiz || null); 
            }}
          >
            <option value="">Select Quiz</option>
            {filteredQuizzes.map((quiz) => (
              <option key={quiz.quizID} value={quiz.quizID}>
                {quiz.title}
              </option>
            ))}
          </select>
        </>
      )}
      <button
        className="btn btn-primary mt-3"
        onClick={handleStartSampleQuiz}
        disabled={!selectedQuiz} 
      >
        Start Sample Quiz
      </button>
    </div>
  );
};

export default SampleQuizRoom;
