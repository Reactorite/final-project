import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../config/firebase-config";
import { ref, set } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import { AppContext } from "../../../state/app.context";
import "./CreateQuiz.css";

export default function CreateQuiz() {
  const { user } = useContext(AppContext); // Access the user from the context

  const [quiz, setQuiz] = useState<QuizDataType>({
    title: "",
    category: "",
    isOpen: false,
    isPublic: false,
    isOngoing: false,
    questions: {},
    scores: {},
    creator: "", // Initialize as empty
    duration: 0,
    totalPoints: 0,
    groups: {},
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [numAnswers, setNumAnswers] = useState(0);
  const [answers, setAnswers] = useState<{ [answer: string]: boolean }>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentAnswerCorrect, setCurrentAnswerCorrect] = useState(false);
  const [points, setPoints] = useState(0); // Points for the current question
  const [questionsList, setQuestionsList] = useState<QuestionDataType[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      setQuiz((prev) => ({
        ...prev,
        creator: user.uid, // Update creator with user's UID
      }));
    }
  }, [user]);

  const handleCreateQuestion = () => {
    setShowQuestionForm(true);
  };

  const addAnswer = () => {
    if (!currentAnswer) {
      alert("Please enter an answer.");
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [currentAnswer]: currentAnswerCorrect,
    }));
    setCurrentAnswer("");
    setCurrentAnswerCorrect(false);
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
      points,
    };

    setQuiz((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questID]: newQuestionData,
      },
    }));

    setQuestionsList((prevQuestions) => [...prevQuestions, newQuestionData]);
    setTotalPoints((prevTotal) => prevTotal + newQuestionData.points);

    setQuestion("");
    setAnswers({});
    setNumAnswers(0);
    setPoints(0);
    setShowQuestionForm(false);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleAnswerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnswerCorrect(e.target.value === "true");
  };

  const handleNumAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumAnswers(parseInt(e.target.value, 10));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoints(parseInt(e.target.value, 10));
  };

  const handleDropdownChange = (field: keyof QuizDataType) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setQuiz((prev) => ({
      ...prev,
      [field]: value === "true" ? true : value === "false" ? false : prev[field],
    }));
  };

  const saveQuizToDB = async () => {
    if (quiz.isOpen === null || quiz.isPublic === null || quiz.isOngoing === null) {
      alert("Please make sure all options are selected.");
      return;
    }
    const quizID = uuidv4();
    const quizRef = ref(db, `quizzes/${quizID}`);
    await set(quizRef, { ...quiz, totalPoints, creator: quiz.creator });
    alert("Quiz created successfully!");
  };

  const hasValidQuestions = questionsList.some(
    (q) => Object.keys(q.answers).length >= 2
  );

  return (
    <div className="quiz-container">
      <h1>Create iQuiz</h1>

      <div className="form-group">
        <label htmlFor="title">Title: </label>
        <input
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          type="text"
          name="title"
          id="title"
          placeholder="Title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category: </label>
        <input
          value={quiz.category}
          onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
          type="text"
          name="category"
          id="category"
          placeholder="Category"
        />
      </div>

      <div className="form-group">
        <label htmlFor="isOpen">Is the quiz open?: </label>
        <select
          value={quiz.isOpen ? "true" : "false"}
          onChange={handleDropdownChange("isOpen")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isPublic">Is the quiz public?: </label>
        <select
          value={quiz.isPublic ? "true" : "false"}
          onChange={handleDropdownChange("isPublic")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isOngoing">Is the quiz ongoing?: </label>
        <select
          value={quiz.isOngoing ? "true" : "false"}
          onChange={handleDropdownChange("isOngoing")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (minutes): </label>
        <input
          type="number"
          value={quiz.duration}
          onChange={(e) =>
            setQuiz({ ...quiz, duration: parseInt(e.target.value, 10) })
          }
          min="1"
          placeholder="Duration in minutes?"
        />
      </div>

      <div className="form-group">
        <button onClick={handleCreateQuestion} disabled={showQuestionForm}>
          Create Question
        </button>
      </div>

      {showQuestionForm && (
        <>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="question">Enter Question: </label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                type="text"
                name="question"
                id="question"
                placeholder="Enter Question"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numAnswers">Number of answers: </label>
              <input
                type="number"
                value={numAnswers}
                onChange={handleNumAnswersChange}
                min="1"
                placeholder="Number of answers?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="points">Points for this question: </label>
              <input
                type="number"
                value={points}
                onChange={handlePointsChange}
                min="0"
                placeholder="Points for this question?"
              />
            </div>

            <div className="answer-options">
              {Object.keys(answers).map((answer, index) => (
                <div key={index} className="answer-option">
                  <input
                    type="text"
                    placeholder={`Answer ${index + 1}`}
                    value={answer}
                    disabled
                  />
                  <select
                    value={answers[answer] ? "true" : "false"}
                    disabled
                  >
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                </div>
              ))}
              {Object.keys(answers).length < numAnswers && (
                <div className="answer-option">
                  <input
                    type="text"
                    placeholder={`Answer ${Object.keys(answers).length + 1}`}
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                  />
                  <select
                    value={currentAnswerCorrect ? "true" : "false"}
                    onChange={handleAnswerSelectChange}
                  >
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                  <button type="button" onClick={addAnswer}>
                    Add Answer
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="form-group">
            <button onClick={addQuestionToQuiz}>
              Add Question
            </button>
          </div>
        </>
      )}

      <div className="questions-list">
        {questionsList.map((q, index) => (
          <div key={index} className="question-item">
            <h4>{q.question}</h4>
            <p>Points: {q.points}</p>
            <ul>
              {Object.entries(q.answers).map(([answer, isCorrect], i) => (
                <li key={i}>
                  {answer} - {isCorrect ? "True" : "False"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="form-group">
        <p className="total-points">Total Points: {totalPoints}</p>
        {hasValidQuestions && (
          <button onClick={saveQuizToDB}>Create Quiz</button>
        )}
      </div>
    </div>
  );
}
