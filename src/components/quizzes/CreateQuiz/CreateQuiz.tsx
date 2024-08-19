import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../../config/firebase-config";
import { ref, set } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import './CreateQuiz.css'; // Import the CSS file

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState<QuizDataType>({
    title: '',
    category: '',
    isOpen: true,
    isPublic: true,
    isOngoing: true,
    questions: {},
    scores: {},
    creator: '',
    duration: 0,
    totalPoints: 0,
    groups: {}
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [numAnswers, setNumAnswers] = useState(0);
  const [answers, setAnswers] = useState<{ [answer: string]: boolean }>({});
  const [questions, setQuestions] = useState<QuestionDataType[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const handleCreateQuestion = () => {
    setShowQuestionForm(true);
  };

  const addQuestionToQuiz = () => {
    if (!question || numAnswers <= 0) {
      alert("Please enter a question and the number of answers.");
      return;
    }

    const questID = uuidv4();
    const newQuestionData: QuestionDataType = {
      questID,
      question,
      answers,
      points: 0 // Default points
    };

    // Add new question to the quiz state
    setQuiz(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questID]: newQuestionData
      }
    }));

    // Add new question to the local list of questions for rendering
    setQuestions(prevQuestions => [...prevQuestions, newQuestionData]);

    // Reset the form fields
    setQuestion('');
    setAnswers({});
    setNumAnswers(0);
    setShowQuestionForm(false); // Hide the form after adding the question
    calculateTotalPoints();
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const answer = e.target.value;
    const updatedAnswers = { ...answers, [answer]: answers[answer] || false };
    setAnswers(updatedAnswers);
  };

  const handleAnswerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, answer: string) => {
    const updatedAnswers = { ...answers, [answer]: e.target.value === 'true' };
    setAnswers(updatedAnswers);
  };

  const handleNumAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumAnswers(parseInt(e.target.value, 10));
  };

  const handleNumAnswersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers };
      for (let i = 0; i < numAnswers; i++) {
        if (!Object.keys(updatedAnswers).some(key => key.startsWith(`Answer ${i + 1}`))) {
          updatedAnswers[`Answer ${i + 1}`] = false; // Default to false
        }
      }
      return updatedAnswers;
    });
  };

  const saveQuizToDB = async () => {
    const quizID = uuidv4(); // Generate a unique quiz ID
    const quizRef = ref(db, `quizzes/${quizID}`);
    await set(quizRef, quiz);
    alert("Quiz created successfully!");
  };

  const calculateTotalPoints = () => {
    const total = questions.reduce((sum, question) => sum + (question.points || 0), 0);
    setTotalPoints(total);
  };

  return (
    <div className="quiz-container">
      <h1>Create iQuiz</h1>

      <div className="form-group">
        <label htmlFor="title">Title: </label>
        <input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} type="text" name="title" id="title" />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category: </label>
        <input value={quiz.category} onChange={(e) => setQuiz({ ...quiz, category: e.target.value })} type="text" name="category" id="category" />
      </div>

      <div className="form-group">
        <label htmlFor="isOpen">Is the quiz open?: </label>
        <select value={quiz.isOpen ? 'true' : 'false'} onChange={(e) => setQuiz({ ...quiz, isOpen: e.target.value === 'true' })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isPublic">Is the quiz public?: </label>
        <select value={quiz.isPublic ? 'true' : 'false'} onChange={(e) => setQuiz({ ...quiz, isPublic: e.target.value === 'true' })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isOngoing">Is the quiz ongoing?: </label>
        <select value={quiz.isOngoing ? 'true' : 'false'} onChange={(e) => setQuiz({ ...quiz, isOngoing: e.target.value === 'true' })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (minutes): </label>
        <input
          type="number"
          value={quiz.duration}
          onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value, 10) })}
          min="1"
        />
      </div>

      <div className="form-group">
        <button onClick={handleCreateQuestion} disabled={showQuestionForm}>Create Question</button>
      </div>

      {showQuestionForm && (
        <>
          <form onSubmit={handleNumAnswersSubmit}>
            <div className="form-group">
              <label htmlFor="question">Enter Question: </label>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} type="text" name="question" id="question" />
            </div>

            <div className="form-group">
              <label htmlFor="numAnswers">Number of answers: </label>
              <input type="number" value={numAnswers} onChange={handleNumAnswersChange} min="1" />
            </div>

            <div className="form-group">
              {Array.from({ length: numAnswers }, (_, index) => {
                const answerKey = `Answer ${index + 1}`;
                return (
                  <div key={index} className="answer-option">
                    <input
                      type="text"
                      placeholder={`Answer ${index + 1}`}
                      onChange={(e) => handleAnswerChange(e, index)}
                    />
                    <select
                      value={answers[answerKey] ? 'true' : 'false'}
                      onChange={(e) => handleAnswerSelectChange(e, answerKey)}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="form-group">
              <button type="button" onClick={addQuestionToQuiz}>Add Question</button>
            </div>
          </form>
        </>
      )}

      <div className="questions-list">
        <h2>Questions:</h2>
        {questions.map(q => (
          <div key={q.questID} className="question-item">
            <p>Question: {q.question}</p>
            <ul className="answer-options">
              {Object.entries(q.answers).map(([answer, isCorrect], index) => (
                <li key={index}>{answer} - {isCorrect ? 'Correct' : 'Incorrect'}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="form-group">
        <p>Total Points: {totalPoints}</p>
        {questions.length >= 1 && (
          <button onClick={saveQuizToDB}>Create Quiz</button>
        )}
      </div>
    </div>
  );
}
