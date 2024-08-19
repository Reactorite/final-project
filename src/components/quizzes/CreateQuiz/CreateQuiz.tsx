import React, { useState, ChangeEvent, FormEvent } from "react";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../../config/firebase-config";
import { ref, set } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../config/firebase-config";

export default function CreateQuiz() {
  const [user] = useAuthState(auth);
  const [quiz, setQuiz] = useState<QuizDataType>({
    title: '',
    category: '',
    isOpen: true,
    isPublic: true,
    isOngoing: true,
    questions: {},
    scores: {},
    creator: user?.uid || '', // Set creator field to current user's UID
    duration: 0,
    totalPoints: 0,
    groups: {}
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [numAnswers, setNumAnswers] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: { text: string; isCorrect: boolean } }>({});
  const [questions, setQuestions] = useState<QuestionDataType[]>([]);
  const [showCreateQuizButton, setShowCreateQuizButton] = useState(false);

  const handleCreateQuestion = () => {
    setShowQuestionForm(true);
  };

  const addQuestionToQuiz = () => {
    if (!question || numAnswers <= 0 || Object.keys(answers).length < numAnswers) {
      alert("Please enter a question, the number of answers, and fill in all answer fields.");
      return;
    }

    const questID = uuidv4();
    const newQuestionData: QuestionDataType = {
      questID,
      question,
      answers: Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [value.text, value.isCorrect])
      ),
      points: 0 // Default points, you might want to include a points input
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

    // Show Create Quiz button if it's the first question added
    if (questions.length === 0) {
      setShowCreateQuizButton(true);
    }

    // Reset the form fields
    setQuestion('');
    setAnswers({});
    setNumAnswers(0);
    setShowQuestionForm(false); // Hide the form after adding the question
  };

  const handleAnswerChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const answerKey = `Answer ${index + 1}`;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [answerKey]: { ...prevAnswers[answerKey], text: e.target.value || '' }
    }));
  };

  const handleAnswerSelectChange = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
    const answerKey = `Answer ${index + 1}`;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [answerKey]: { ...prevAnswers[answerKey], isCorrect: e.target.value === 'true' }
    }));
  };

  const handleNumAnswersChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNumAnswers(parseInt(e.target.value, 10));
  };

  const handleNumAnswersSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Ensure answers state is correctly initialized for the number of answers
    setAnswers(prevAnswers => {
      const updatedAnswers = { ...prevAnswers };
      for (let i = 0; i < numAnswers; i++) {
        const answerKey = `Answer ${i + 1}`;
        if (!updatedAnswers[answerKey]) {
          updatedAnswers[answerKey] = { text: '', isCorrect: false };
        }
      }
      return updatedAnswers;
    });
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuiz(prev => ({
      ...prev,
      duration: parseInt(e.target.value, 10) || 0
    }));
  };

  const handleDropdownChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: value === 'true'
    }));
  };

  const saveQuizToDB = async () => {
    // Ensure all answers are properly initialized
    const sanitizedQuiz = {
      ...quiz,
      questions: Object.fromEntries(
        Object.entries(quiz.questions).map(([questID, questionData]) => [
          questID,
          {
            ...questionData,
            answers: Object.fromEntries(
              Object.entries(questionData.answers).map(([answer, isCorrect]) => [answer, isCorrect || false])
            )
          }
        ])
      )
    };

    const quizID = uuidv4(); // Generate a unique quiz ID
    const quizRef = ref(db, `quizzes/${quizID}`);
    await set(quizRef, sanitizedQuiz);
    alert("Quiz created successfully!");
  };

  return (
    <>
      <h1>Create iQuiz</h1>
      <label htmlFor="title">Title: </label>
      <input
        value={quiz.title}
        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        type="text"
        name="title"
        id="title"
      />
      <br />

      <label htmlFor="category">Category: </label>
      <input
        value={quiz.category}
        onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
        type="text"
        name="category"
        id="category"
      />
      <br />

      <label htmlFor="duration">Duration (minutes): </label>
      <input
        type="number"
        value={quiz.duration}
        onChange={handleDurationChange}
        min="0"
      />
      <br />

      <label htmlFor="isPublic">Public: </label>
      <select
        name="isPublic"
        value={quiz.isPublic.toString()}
        onChange={handleDropdownChange}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <br />

      <label htmlFor="isOpen">Open: </label>
      <select
        name="isOpen"
        value={quiz.isOpen.toString()}
        onChange={handleDropdownChange}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <br />

      <label htmlFor="isOngoing">Ongoing: </label>
      <select
        name="isOngoing"
        value={quiz.isOngoing.toString()}
        onChange={handleDropdownChange}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <br />

      {/* Button to show question form */}
      {!showQuestionForm && (
        <button onClick={handleCreateQuestion}>Create Question</button>
      )}

      {/* Show question form if showQuestionForm is true */}
      {showQuestionForm && (
        <>
          <br />
          <label htmlFor="question">Enter Question: </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            type="text"
            name="question"
            id="question"
          />
          <br />

          <form onSubmit={handleNumAnswersSubmit}>
            <label htmlFor="numAnswers">Number of answers: </label>
            <input
              type="number"
              value={numAnswers}
              onChange={handleNumAnswersChange}
              min="1"
            />
            <br />

            {/* Render input fields for answers */}
            {Array.from({ length: numAnswers }, (_, index) => {
              const answerKey = `Answer ${index + 1}`;
              return (
                <div key={index}>
                  <label htmlFor={`answer${index + 1}`}>Answer {index + 1}:</label>
                  <input
                    type="text"
                    id={`answer${index + 1}`}
                    value={answers[answerKey]?.text || ''}
                    onChange={(e) => handleAnswerChange(index, e)}
                  />
                  <label>
                    Correct:
                    <select
                      value={answers[answerKey]?.isCorrect ? 'true' : 'false'}
                      onChange={(e) => handleAnswerSelectChange(index, e)}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </label>
                </div>
              );
            })}
            <br />

            <button type="button" onClick={addQuestionToQuiz}>Add Question</button>
          </form>
        </>
      )}

      {/* Render added questions */}
      <div>
        <h2>Questions:</h2>
        {questions.map(q => (
          <div key={q.questID}>
            <p>Question: {q.question}</p>
            <ul>
              {Object.entries(q.answers).map(([answer, isCorrect], index) => (
                <li key={index}>{answer} - {isCorrect ? 'Correct' : 'Incorrect'}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Show Create Quiz button only if at least 1 question is added */}
      {showCreateQuizButton && (
        <div>
          <br />
          <button onClick={saveQuizToDB}>Create Quiz</button>
        </div>
      )}
    </>
  );
}