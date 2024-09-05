import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../config/firebase-config";
import { ref, set, get } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import { AppContext } from "../../../state/app.context";
import "./CreateQuiz.css";
import { useNavigate } from 'react-router-dom';
import { Button, Card } from "react-bootstrap";
// import HoverState from "../../../types/HoverStateDataType";

export default function CreateQuiz() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizDataType>({
    title: "",
    category: "",
    isOpen: true,
    isPublic: true,
    questions: {},
    scores: {},
    creator: "",
    duration: 0,
    totalPoints: 0,
    groups: {},
    members: {},
    quizID: "",
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


  useEffect(() => {
    if (user) {
      const newQuizID = uuidv4(); // Generate a new quiz ID here
      setQuiz((prev) => ({
        ...prev,
        creator: user.uid,
        quizID: prev.quizID || newQuizID,
        members: prev.members || {},
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchExistingQuizzes = async () => {
      const quizzesRef = ref(db, "quizzes");
      const snapshot = await get(quizzesRef);
      if (snapshot.exists()) {
        setExistingQuizzes(snapshot.val());
      }
    };

    fetchExistingQuizzes();
  }, []);

  const containsInvalidChars = (str: string) => {
    return /[.#$\/\[\]]/.test(str);
  }

  const sections = ['General Information', 'Question Editor', 'In this iQuiz'];
  const handleMouseEnter = (index: number) => setHoveredIndex(index);
  const handleMouseLeave = () => setHoveredIndex(null);

  const handleQuizSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedID = e.target.value;
    setSelectedQuizID(selectedID);

    if (selectedID) {
      const selectedQuiz = existingQuizzes[selectedID];
      setQuiz(selectedQuiz);
      setQuestionsList(Object.values(selectedQuiz.questions));
    } else {
      const newQuizID = uuidv4();
      setQuiz({
        title: "",
        category: "",
        isOpen: true,
        isPublic: true,
        questions: {},
        scores: {},
        creator: user!.uid || "",
        duration: 0,
        totalPoints: 0,
        groups: {},
        members: {},
        quizID: newQuizID,
      });
      setQuestionsList([]);
    }
  };

  // Add this effect to ensure the dropdown updates when editing an existing quiz
  useEffect(() => {
    if (selectedQuizID && existingQuizzes[selectedQuizID]) {
      const selectedQuiz = existingQuizzes[selectedQuizID];
      setQuiz(selectedQuiz);
      setQuestionsList(Object.values(selectedQuiz.questions));
    }
  }, [selectedQuizID, existingQuizzes]);

  // Ensure that selectedQuizID is correctly updated when editing a question
  useEffect(() => {
    if (quiz.quizID && quiz.quizID !== selectedQuizID) {
      setSelectedQuizID(quiz.quizID);
    }
  }, [quiz]);

  const handleCreateQuestion = () => {
    // if (hasUnsavedChanges) {
    //   const confirmSwitch = window.confirm(
    //     "You have unsaved changes. Are you sure you want to create a new question without saving?"
    //   );
    //   if (!confirmSwitch) return;
    // }
    setQuestion("");
    setAnswers({});
    setNumAnswers(0);
    setPoints(0);
    setEditingQuestionID(null);
    setEditingAnswer(null); // Clear answer editing state
    setHasUnsavedChanges(false); // Reset unsaved changes flag
  };

  const handleEditQuestion = (questID: string) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Are you sure you want to switch questions without saving?"
      );
      if (!confirmSwitch) return;
    }

    const existingQuestion = quiz.questions[questID];
    if (existingQuestion) {
      setEditingQuestionID(questID);
      setQuestion(existingQuestion.question);
      setAnswers(existingQuestion.answers);
      setPoints(existingQuestion.points);
      setNumAnswers(Object.keys(existingQuestion.answers).length);
      setEditingAnswer(null); // Clear answer editing state
      setHasUnsavedChanges(false); // Reset unsaved changes flag

      // Ensure that the selected quiz remains consistent
      if (selectedQuizID !== quiz.quizID) {
        setSelectedQuizID(quiz.quizID);
      }
    } else {
      console.error("Question not found");
      handleCreateQuestion();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (containsInvalidChars(title)) {
      alert("Please don't use invalid characters (. # $ / [ or ]).");
      return;
    }
    setQuiz(prev => ({
      ...prev,
      title: title
    }));
  };


  const addAnswer = () => {
    if (!currentAnswer) {
      alert("Please enter an answer.");
      return;
    }
    if (containsInvalidChars(currentAnswer)) {
      alert("The answer contains invalid characters (. # $ / [ or ]). Please remove them and try again.");
      return;
    }
    if (Object.keys(answers).length >= numAnswers && !editingAnswer) {
      alert(`You can only add ${numAnswers} answers.`);
      return;
    }

    if (editingAnswer) {
      setAnswers((prev) => {
        const updatedAnswers = { ...prev };
        delete updatedAnswers[editingAnswer];
        updatedAnswers[currentAnswer] = currentAnswerCorrect;
        return updatedAnswers;
      });
      setEditingAnswer(null);
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentAnswer]: currentAnswerCorrect,
      }));
    }

    setCurrentAnswer("");
    setCurrentAnswerCorrect(false);
  };



  const handleEditAnswer = (answer: string) => {
    setCurrentAnswer(answer);
    setCurrentAnswerCorrect(answers[answer]);
    setEditingAnswer(answer); // Track which answer is being edited
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
        return prevQuestions.map((q) =>
          q.questID === editingQuestionID ? newQuestionData : q
        );
      }
      return [...prevQuestions, newQuestionData];
    });

    setTotalPoints((prevTotal) => prevTotal + newQuestionData.points);

    handleCreateQuestion(); // Reset the form after adding the question
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnswer(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleAnswerSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnswerCorrect(e.target.value === "true");
    setHasUnsavedChanges(true);
  };

  const handleNumAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumAnswers = parseInt(e.target.value, 10);
    if (newNumAnswers < Object.keys(answers).length) {
      alert("Please delete some answers before decreasing the number.");
    } else {
      setNumAnswers(newNumAnswers);
      setHasUnsavedChanges(true);
    }
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoints(parseInt(e.target.value, 10));
    setHasUnsavedChanges(true);
  };

  const handleDropdownChange = (field: keyof QuizDataType) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setQuiz((prev) => ({
      ...prev,
      [field]: value === "true" ? true : value === "false" ? false : prev[field],
    }));
  };

  const saveQuizToDB = async () => {
    if (quiz.isOpen === null || quiz.isPublic === null) {
      alert("Please make sure all options are selected.");
      return;
    }
    const quizID = quiz.quizID || uuidv4();
    const quizRef = ref(db, `quizzes/${quizID}`);
    await set(quizRef, { ...quiz, totalPoints, creator: quiz.creator });
    alert("Quiz created successfully!");
    navigate(`/quizz-page`);
  };

  const handleDeleteQuestion = (questID: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmDelete) return;

    setQuiz((prev) => {
      const updatedQuestions = { ...prev.questions };
      delete updatedQuestions[questID];

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });

    setQuestionsList((prevQuestions) =>
      prevQuestions.filter((q) => q.questID !== questID)
    );

    setTotalPoints((prevTotal) =>
      prevTotal - quiz.questions[questID].points
    );
  };

  const handleDeleteAnswer = (answer: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this answer?"
    );
    if (!confirmDelete) return;

    setAnswers((prev) => {
      const updatedAnswers = { ...prev };
      delete updatedAnswers[answer];
      return updatedAnswers;
    });
  };

  const hasValidQuestions = questionsList.some(
    (q) => Object.keys(q.answers).length >= 2
  );

  const userQuizzes = Object.entries(existingQuizzes).filter(
    ([, quizData]) => quizData.creator === user?.uid
  );

  return (
    <div className="quiz-page-container">
      <div className="container mt-4">
        <div className="row">
        <div className="col-md-4 column-container">
          <Card
            className="card flex-fill fixed-height-card"
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: hoveredIndex === 0 ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
              >
                <h3 className="text-center sticky-header">General Information</h3>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="existingQuiz">Select Quiz Option:</label>
                    <select
                      id="existingQuiz"
                      value={selectedQuizID || ""}
                      onChange={handleQuizSelection}
                      className="form-control"
                    >
                      <option value="">Create a New Quiz</option>
                      {userQuizzes.map(([id, quizData]) => (
                        <option key={id} value={id}>
                          {quizData.title}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                      value={quiz.title}
                      onChange={handleTitleChange}
                      type="text"
                      id="title"
                      placeholder="Title your quiz:"
                      className="form-control"
                    />

                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                      value={quiz.category}
                      onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                      className="form-control"
                      id="category"
                    >
                      <option value="">Select Category</option>
                      <option value="Science & Technology">Science & Technology</option>
                      <option value="History & Geography">History & Geography</option>
                      <option value="Arts & Literature">Arts & Literature</option>
                      <option value="Movies & Television">Movies & Television</option>
                      <option value="Music">Music</option>
                      <option value="Sports & Games">Sports & Games</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Science Fiction & Fantasy">Science Fiction & Fantasy</option>
                      <option value="Nature & Animals">Nature & Animals</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Travel & Cultures">Travel & Cultures</option>
                      <option value="Fashion & Beauty">Fashion & Beauty</option>
                      <option value="Business & Economics">Business & Economics</option>
                      <option value="Politics & Society">Politics & Society</option>
                      <option value="Hobbies & Crafts">Hobbies & Crafts</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="isOpen">Is the quiz open?:</label>
                    <select
                      value={quiz.isOpen ? "true" : "false"}
                      onChange={handleDropdownChange("isOpen")}
                      className="form-control"
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
                      className="form-control"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration (in minutes):</label>
                    <input
                      value={quiz.duration}
                      onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value, 10) })}
                      type="number"
                      id="duration"
                      placeholder="Duration"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="studentsInQuiz">Students in this iQuiz:</label>
                    <select id="studentsInQuiz" className="form-control">
                      <option value="" disabled>No students added</option>
                    </select>
                  </div>
                  <p className="bold-text">Number of Questions: {questionsList.length}</p>
                  <p className="bold-text">Total Points: {totalPoints}</p>
                </div>
                <div
                  className="card-footer custom-footer orange-footer"
                  onClick={() => alert("Invite functionality coming soon!")}
                >
                  Invite
                </div>
              </Card>
            </div>
        <div className="col-md-4 column-container">
          <Card
            className="card flex-fill fixed-height-card"
            onMouseEnter={() => handleMouseEnter(1)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: hoveredIndex === 1 ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
              >
                <h3 className="text-center sticky-header">Question Editor</h3>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="questionSelect">Select Question Option:</label>
                    <select
                      id="questionSelect"
                      value={editingQuestionID || ""} // Ensure the dropdown shows the currently selected question
                      onChange={(e) => {
                        if (e.target.value) {
                          handleEditQuestion(e.target.value);
                        } else {
                          handleCreateQuestion();
                        }
                      }}
                      className="form-control"
                    >
                      <option value="">Create a New Question</option>
                      {questionsList.map((q) => (
                        <option key={q.questID} value={q.questID}>{q.question}</option>
                      ))}
                    </select>
                  </div>

                  <div className="question-form">
                    <div className="form-group">
                      <label htmlFor="question">Question:</label>
                      <input
                        value={question}
                        onChange={(e) => {
                          setQuestion(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        type="text"
                        id="question"
                        placeholder="Enter the question"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="numAnswers">Number of Answers:</label>
                      <input
                        value={numAnswers}
                        onChange={handleNumAnswersChange}
                        type="number"
                        id="numAnswers"
                        placeholder="Number of answers"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="points">Points:</label>
                      <input
                        value={points}
                        onChange={handlePointsChange}
                        type="number"
                        id="points"
                        placeholder="Points for this question"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="currentAnswer">Current Answer:</label>
                      <input
                        value={currentAnswer}
                        onChange={handleAnswerChange}
                        type="text"
                        id="currentAnswer"
                        placeholder="Enter an answer"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="currentAnswerCorrect">Is this answer correct?:</label>
                      <select
                        value={currentAnswerCorrect ? "true" : "false"}
                        onChange={handleAnswerSelectChange}
                        className="form-control"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <Button
                      onClick={addAnswer}
                      className="btn btn-primary"
                    >
                      {editingAnswer ? "Update Answer" : "Add Answer"}
                    </Button>
                    <div className="answers-list mt-3">
                      <h4>Answers:</h4>
                      <ul className="list-group">
                        {Object.entries(answers).map(([ans, isCorrect]) => (
                          <li key={ans} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{ans} - {isCorrect ? "Correct" : "Incorrect"}</span>
                            <div>
                              <Button
                                onClick={() => handleEditAnswer(ans)}
                                className="btn btn-sm btn-secondary mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteAnswer(ans)}
                                className="btn btn-sm btn-danger"
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Delete This Question Button (only when editing) */}
                    {editingQuestionID && (
                      <Button
                        onClick={() => handleDeleteQuestion(editingQuestionID)}
                        className="btn btn-danger mt-3 w-100"
                      >
                        Delete This Question
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer with Save Question button */}
                <div className="card-footer custom-footer blue-footer" onClick={addQuestionToQuiz}>
                  {editingQuestionID ? "Save Question" : "Add Question"}
                </div>
              </Card>
            </div>
            <div className="col-md-4 column-container">
          <Card
            className="card flex-fill fixed-height-card"
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: hoveredIndex === 2 ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
              >
                <h3 className="text-center sticky-header">In this iQuiz</h3>
                <div className="card-body">
                  {questionsList.map((q) => (
                    <Card key={q.questID} className="card mb-3">
                      <div className="card-body">
                        <p className="card-title">{q.question}</p>
                        <ul>
                          {Object.entries(q.answers).map(([ans, isCorrect]) => (
                            <li key={ans}>
                              {ans} - {isCorrect ? "Correct" : "Incorrect"}
                            </li>
                          ))}
                        </ul>
                        <p><strong>Points:</strong> {q.points}</p>
                        <Button
                          onClick={() => handleEditQuestion(q.questID)}
                          className="btn btn-primary"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(q.questID)}
                          className="btn btn-danger ml-2"
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <div
                  className="card-footer custom-footer green-footer"
                  onClick={saveQuizToDB}
                >
                  Save Quiz
                </div>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
