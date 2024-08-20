import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../config/firebase-config";
import { ref, set, get } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import { AppContext } from "../../../state/app.context";
import "./CreateQuiz.css";

export default function CreateQuiz() {
  const { user } = useContext(AppContext);

  const [quiz, setQuiz] = useState<QuizDataType>({
    title: "",
    category: "",
    isOpen: false,
    isPublic: false,
    isOngoing: false,
    questions: {},
    scores: {},
    creator: "",
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
  const [points, setPoints] = useState(0);
  const [questionsList, setQuestionsList] = useState<QuestionDataType[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [editingQuestionID, setEditingQuestionID] = useState<string | null>(null);
  const [existingQuizzes, setExistingQuizzes] = useState<{ [id: string]: QuizDataType }>({});
  const [selectedQuizID, setSelectedQuizID] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setQuiz((prev) => ({
        ...prev,
        creator: user.uid,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchExistingQuizzes = async () => {
      const quizzesRef = ref(db, 'quizzes');
      const snapshot = await get(quizzesRef);
      if (snapshot.exists()) {
        setExistingQuizzes(snapshot.val());
      }
    };

    fetchExistingQuizzes();
  }, []);

  const handleQuizSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedID = e.target.value;
    setSelectedQuizID(selectedID);
    if (selectedID) {
      setQuiz(existingQuizzes[selectedID]);
      setQuestionsList(Object.values(existingQuizzes[selectedID].questions));
      setShowQuestionForm(false); // Collapse question editor
    } else {
      setQuiz({
        title: "",
        category: "",
        isOpen: false,
        isPublic: false,
        isOngoing: false,
        questions: {},
        scores: {},
        creator: user!.uid || "",
        duration: 0,
        totalPoints: 0,
        groups: {},
      });
      setQuestionsList([]);
      setShowQuestionForm(true); // Show question editor when creating a new quiz
    }
  };

  const handleCreateQuestion = () => {
    setQuestion("");
    setAnswers({});
    setNumAnswers(0);
    setPoints(0);
    setShowQuestionForm(true);
    setEditingQuestionID(null); // Ensure it's a new question
  };

  const handleEditQuestion = (questID: string) => {
    const existingQuestion = quiz.questions[questID];
    setQuestion(existingQuestion.question);
    setAnswers(existingQuestion.answers);
    setPoints(existingQuestion.points);
    setNumAnswers(Object.keys(existingQuestion.answers).length);
    setShowQuestionForm(true);
    setEditingQuestionID(questID);
  };

  const addAnswer = () => {
    if (!currentAnswer) {
      alert("Please enter an answer.");
      return;
    }
    if (Object.keys(answers).length >= numAnswers) {
      alert(`You can only add ${numAnswers} answers.`);
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

    const questID = editingQuestionID || uuidv4();
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

    setQuestionsList((prevQuestions) => {
      if (editingQuestionID) {
        return prevQuestions.map(q =>
          q.questID === editingQuestionID ? newQuestionData : q
        );
      }
      return [...prevQuestions, newQuestionData];
    });

    setTotalPoints((prevTotal) => prevTotal + newQuestionData.points);

    setQuestion("");
    setAnswers({});
    setNumAnswers(0);
    setPoints(0);
    setShowQuestionForm(false);
    setEditingQuestionID(null);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleAnswerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnswerCorrect(e.target.value === "true");
  };

  const handleNumAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumAnswers = parseInt(e.target.value, 10);
    if (newNumAnswers < Object.keys(answers).length) {
      alert("Please delete some answers before decreasing the number.");
    } else {
      setNumAnswers(newNumAnswers);
    }
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

  // Filter quizzes to only show those created by the current user
  const userQuizzes = Object.entries(existingQuizzes).filter(
    ([, quizData]) => quizData.creator === user?.uid
  );

  return (
    <div className="quiz-container">
      <h1>Create iQuiz</h1>

      <div className="form-group">
        <label htmlFor="existingQuiz">Select Existing Quiz:</label>
        <select
          id="existingQuiz"
          value={selectedQuizID || ""}
          onChange={handleQuizSelection}
        >
          <option value="">Create a New Quiz</option>
          {userQuizzes.map(([id, quizData]) => (
            <option key={id} value={id}>{quizData.title}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          type="text"
          id="title"
          placeholder="Title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <input
          value={quiz.category}
          onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
          type="text"
          id="category"
          placeholder="Category"
        />
      </div>

      <div className="form-group">
        <label htmlFor="isOpen">Is the quiz open?:</label>
        <select
          value={quiz.isOpen ? "true" : "false"}
          onChange={handleDropdownChange("isOpen")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isPublic">Is the quiz public?:</label>
        <select
          value={quiz.isPublic ? "true" : "false"}
          onChange={handleDropdownChange("isPublic")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="isOngoing">Is the quiz ongoing?:</label>
        <select
          value={quiz.isOngoing ? "true" : "false"}
          onChange={handleDropdownChange("isOngoing")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          value={quiz.duration}
          onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value, 10) })}
          id="duration"
        />
      </div>

      <div className="form-group">
        <button type="button" onClick={handleCreateQuestion}>
          Create Question
        </button>
      </div>

      {showQuestionForm && (
        <form className="question-form">
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numAnswers">Number of Answers:</label>
            <input
              type="number"
              id="numAnswers"
              value={numAnswers}
              onChange={handleNumAnswersChange}
              min="1"
            />
          </div>

          <div className="answer-options">
            {Array.from({ length: numAnswers }).map((_, index) => (
              <div key={index} className="answer-option">
                <input
                  type="text"
                  value={Object.keys(answers)[index] || ""}
                  onChange={(e) => {
                    const updatedAnswers = { ...answers };
                    const currentAnswer = Object.keys(answers)[index];
                    delete updatedAnswers[currentAnswer];
                    updatedAnswers[e.target.value] = updatedAnswers[currentAnswer] || false;
                    setAnswers(updatedAnswers);
                  }}
                />
                <select
                  value={Object.values(answers)[index] ? "true" : "false"}
                  onChange={(e) => {
                    const isCorrect = e.target.value === "true";
                    const currentAnswer = Object.keys(answers)[index];
                    setAnswers((prev) => ({
                      ...prev,
                      [currentAnswer]: isCorrect,
                    }));
                  }}
                >
                  <option value="true">Correct</option>
                  <option value="false">Incorrect</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const newAnswers = { ...answers };
                    const answerToDelete = Object.keys(answers)[index];
                    delete newAnswers[answerToDelete];
                    setAnswers(newAnswers);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}

            <div className="form-group">
              <label htmlFor="currentAnswer">Add Answer:</label>
              <input
                type="text"
                value={currentAnswer}
                onChange={handleAnswerChange}
                id="currentAnswer"
                placeholder="Enter answer"
                disabled={Object.keys(answers).length >= numAnswers}
              />
              <select
                value={currentAnswerCorrect ? "true" : "false"}
                onChange={handleAnswerSelectChange}
                disabled={Object.keys(answers).length >= numAnswers}
              >
                <option value="true">Correct</option>
                <option value="false">Incorrect</option>
              </select>
              <button
                type="button"
                onClick={addAnswer}
                disabled={Object.keys(answers).length >= numAnswers}
              >
                Add Answer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="points">Points:</label>
            <input
              type="number"
              id="points"
              value={points}
              onChange={handlePointsChange}
              placeholder="Enter points"
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              onClick={addQuestionToQuiz}
              disabled={!question || numAnswers <= 0}
            >
              {editingQuestionID ? "Update Question" : "Add Question"}
            </button>
          </div>
        </form>
      )}

      <div className="questions-list">
        {Object.values(quiz.questions).map((q) => (
          <div key={q.questID} className="question-item">
            <h4>{q.question}</h4>
            <ul>
              {Object.keys(q.answers).map((answer, index) => (
                <li key={index}>
                  <input
                    type="text"
                    value={answer}
                    readOnly
                  />
                  {q.answers[answer] ? "(Correct)" : "(Incorrect)"}
                </li>
              ))}
            </ul>
            <p>Points: {q.points}</p>
            <button onClick={() => handleEditQuestion(q.questID)}>
              Edit Question
            </button>
          </div>
        ))}
      </div>

      <div className="total-points">Total Points: {totalPoints}</div>

      <div className="form-group">
        <button onClick={saveQuizToDB} disabled={!hasValidQuestions}>
          Save Quiz
        </button>
      </div>
    </div>
  );
}
