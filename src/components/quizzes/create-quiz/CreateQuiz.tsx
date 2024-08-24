import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../config/firebase-config";
import { ref, set, get } from "firebase/database";
import QuizDataType from "../../../types/QuizDataType";
import QuestionDataType from "../../../types/QuestionDataType";
import { AppContext } from "../../../state/app.context";
import "./CreateQuiz.css";
import { useNavigate } from 'react-router-dom';

export default function CreateQuiz() {
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<QuizDataType>({
        title: "",
        category: "",
        isOpen: false,
        isPublic: false,
        questions: {},
        scores: {},
        creator: "",
        duration: 0,
        totalPoints: 0,
        groups: {},
        members: {},
        quizID: "",
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
    const [editingAnswer, setEditingAnswer] = useState<string | null>(null);

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

    const handleQuizSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedID = e.target.value;
        setSelectedQuizID(selectedID);

        if (selectedID) {
            const selectedQuiz = existingQuizzes[selectedID];
            setQuiz(selectedQuiz);
            setQuestionsList(Object.values(selectedQuiz.questions));
            setShowQuestionForm(false);
        } else {
            const newQuizID = uuidv4();
            setQuiz({
                title: "",
                category: "",
                isOpen: false,
                isPublic: false,
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
            setShowQuestionForm(true);
        }
    };

    const handleCreateQuestion = () => {
        setQuestion("");
        setAnswers({});
        setNumAnswers(0);
        setPoints(0);
        setShowQuestionForm(true);
        setEditingQuestionID(null);
        setEditingAnswer(null); // Clear answer editing state
    };

    const handleEditQuestion = (questID: string) => {
        const existingQuestion = quiz.questions[questID];
        setQuestion(existingQuestion.question);
        setAnswers(existingQuestion.answers);
        setPoints(existingQuestion.points);
        setNumAnswers(Object.keys(existingQuestion.answers).length);
        setShowQuestionForm(true);
        setEditingQuestionID(questID);
        setEditingAnswer(null); // Clear answer editing state
    };

    const addAnswer = () => {
        if (!currentAnswer) {
            alert("Please enter an answer.");
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
            setEditingAnswer(null); // Clear the editing state
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

        setQuestion("");
        setAnswers({});
        setNumAnswers(0);
        setPoints(0);
        setShowQuestionForm(false);
        setEditingQuestionID(null);
        setEditingAnswer(null); // Clear answer editing state
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

    const hasValidQuestions = questionsList.some(
        (q) => Object.keys(q.answers).length >= 2
    );

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
                <label htmlFor="duration">Duration (in minutes):</label>
                <input
                    value={quiz.duration}
                    onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value, 10) })}
                    type="number"
                    id="duration"
                    placeholder="Duration"
                />
            </div>

            <div className="form-group">
                <label htmlFor="totalPoints">Total Points:</label>
                <input
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(parseInt(e.target.value, 10))}
                    type="number"
                    id="totalPoints"
                    placeholder="Total Points"
                    readOnly
                />
            </div>

            <button onClick={handleCreateQuestion}>Add New Question</button>

            {showQuestionForm && (
                <div className="question-form">
                    <h2>{editingQuestionID ? "Edit Question" : "New Question"}</h2>
                    <div className="form-group">
                        <label htmlFor="question">Question:</label>
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            type="text"
                            id="question"
                            placeholder="Enter the question"
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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="currentAnswerCorrect">Is this answer correct?:</label>
                        <select
                            value={currentAnswerCorrect ? "true" : "false"}
                            onChange={handleAnswerSelectChange}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <button onClick={addAnswer}>
                        {editingAnswer ? "Update Answer" : "Add Answer"}
                    </button>
                    <div className="answers-list">
                        <h3>Answers:</h3>
                        <ul>
                            {Object.entries(answers).map(([ans, isCorrect]) => (
                                <li key={ans}>
                                    {ans} - {isCorrect ? "Correct" : "Incorrect"}
                                    <button onClick={() => handleEditAnswer(ans)}>Edit</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={addQuestionToQuiz}>
                        {editingQuestionID ? "Save Question" : "Add Question"}
                    </button>
                </div>
            )}

            <div className="questions-list">
                <h2>Questions</h2>
                {questionsList.map((q) => (
                    <div key={q.questID} className="question-item">
                        <p>{q.question}</p>
                        <ul>
                            {Object.entries(q.answers).map(([ans, isCorrect]) => (
                                <li key={ans}>
                                    {ans} - {isCorrect ? "Correct" : "Incorrect"}
                                </li>
                            ))}
                        </ul>
                        <p><strong>Points:</strong> {q.points}</p> {/* Display points per question */}
                        <button onClick={() => handleEditQuestion(q.questID)}>Edit</button>
                    </div>
                ))}
            </div>

            <button onClick={() => alert("Invite functionality coming soon!")}>
                Invite
            </button> {/* Placeholder Invite button */}

            <button
                onClick={saveQuizToDB}
                disabled={!quiz.title || !quiz.category || !hasValidQuestions}
            >
                Save Quiz
            </button>
        </div>
    );
}
