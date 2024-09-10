import React, { useState, useEffect } from 'react';
import { ListGroup, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import { getAllQuizzes, deleteQuiz } from '../../../services/quizes.service';
import QuizDataType from '../../../types/QuizDataType';

const QuizManagement: React.FC = () => {
    const [quizzes, setQuizzes] = useState<QuizDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const fetchedQuizzes = await getAllQuizzes();
            setQuizzes(fetchedQuizzes ?? []);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            setError('Failed to load quizzes.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuizDeleted = async (quizId: string) => {
        setLoading(true);
        try {
            await deleteQuiz(quizId);
            fetchQuizzes();  
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setError('Failed to delete quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditQuiz = () => {
        navigate(`/create-quiz`);  
    };

    return (
        <Card>
            <Card.Body>
                {loading && <p>Loading...</p>}
                {error && <p className="text-danger">{error}</p>}
                <Card.Title>Manage Quizzes</Card.Title>
                <ListGroup>
                    {quizzes.map((quiz) => (
                        <ListGroup.Item key={quiz.quizID}>
                            <div className="col col-main">{quiz.title}</div>
                            <div className="col">
                                <Button variant="primary" style={{ width: "130px" }} onClick={() => handleEditQuiz()}>
                                    Edit
                                </Button>
                            </div>
                            <div className="col">
                                <Button variant="danger" style={{ width: "100px" }} onClick={() => handleQuizDeleted(quiz.quizID)}>
                                    Delete
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default QuizManagement;
