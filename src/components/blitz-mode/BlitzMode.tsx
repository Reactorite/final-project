import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase-config';
import QuizDataType from '../../types/QuizDataType';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import './BlitzMode.css';

const BlitzMode: React.FC = () => {
    const { quizID } = useParams<{ quizID: string }>();
    const navigate = useNavigate(); 
    const [quiz, setQuiz] = useState<QuizDataType | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const quizRef = ref(db, `quizzes/${quizID}`);
                const quizSnapshot = await get(quizRef);
                if (quizSnapshot.exists()) {
                    const quizData = quizSnapshot.val() as QuizDataType;
                    setQuiz(quizData);
                    setTimer(quizData.duration * 15);
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
            }
        };

        loadQuiz();
    }, [quizID]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 800);

        return () => clearInterval(interval);
    }, []);

    const handleAnswer = (answer: string, isCorrect: boolean) => {
        setSelectedAnswer(answer);
        const questions = quiz?.questions ? Object.values(quiz.questions) : [];
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) {
            return;
        }
        if (isCorrect) {
            document.body.classList.add('correct');
            setScore(prevScore => prevScore + currentQuestion.points);
        } else {
            document.body.classList.add('wrong');
        }

        setTimeout(() => {
            document.body.classList.remove('correct', 'wrong');
            setCurrentQuestionIndex(currentIndex => currentIndex + 1);
            setSelectedAnswer(null);
        }, 1500);
    };

    if (!quiz) return <div>Loading...</div>;

    const questions = Object.values(quiz.questions);
    const currentQuestion = questions[currentQuestionIndex];

    if (timer <= 0) {
        return (
            <Container className="quiz-finished-container">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="text-center mb-4 quiz-finished-card">
                            <Card.Header className="quiz-header">
                                Quiz Finished! Time's up!
                            </Card.Header>
                            <Card.Body>
                                <h3>Your score: {score}</h3>
                                <Button 
                                    className="back-button mt-4"
                                    variant="primary"
                                    onClick={() => navigate('/battle-arena')} 
                                >
                                    Back to Battle Arena
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (currentQuestionIndex >= questions.length) {
        return (
            <Container className="quiz-finished-container">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="text-center mb-4 quiz-finished-card">
                            <Card.Header className="quiz-header">
                                Quiz Finished!
                            </Card.Header>
                            <Card.Body>
                                <h3>Your score: {score}</h3>
                                <Button 
                                    className="back-button mt-4"
                                    variant="primary"
                                    onClick={() => navigate('/battle-arena')} 
                                >
                                    Back to Battle Arena
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
        <Container className="quiz-container">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="text-center mb-4">
                        <Card.Header className="quiz-header">
                            {quiz.title} <span className="timer">Time left: {minutes}:{seconds.toString().padStart(2, '0')}</span>
                        </Card.Header>
                        <Card.Body className="quiz-body">
                            <Card.Title className="question">{currentQuestion.question}</Card.Title>
                            <div className="answers">
                                {Object.entries(currentQuestion.answers).map(([answer, isCorrect], index) => (
                                    <Button
                                        key={index}
                                        className={`answer-button ${selectedAnswer === answer ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                                        onClick={() => handleAnswer(answer, Boolean(isCorrect))}
                                        disabled={selectedAnswer !== null}
                                    >
                                        {answer}
                                    </Button>
                                ))}
                            </div>
                        </Card.Body>
                        <Card.Footer className="quiz-footer">Points: {score}</Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BlitzMode;
