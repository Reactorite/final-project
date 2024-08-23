import React, { useState, useEffect } from 'react';
import { ListGroup, Row, Col, Card } from 'react-bootstrap';
import { getAllQuizzes } from '../../../services/quizes.service';
import QuizDataType from '../../../types/QuizDataType';
import QuizEditor from '../../quizzes/quiz-editor/QuizEditor';


const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizDataType[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const fetchedQuizzes = await getAllQuizzes();
    if (fetchedQuizzes) {
      setQuizzes(fetchedQuizzes);
    }
  };

  const handleQuizUpdated = (updatedQuiz: QuizDataType) => {
    setQuizzes(prev => prev.map(q => q.quizID === updatedQuiz.quizID ? updatedQuiz : q));
  };

  const handleQuizDeleted = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.quizID !== quizId));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Manage Quizzes</Card.Title>
        <ListGroup>
          {quizzes.map((quiz) => (
            <ListGroup.Item key={quiz.quizID}>
              <Row>
                <Col>{quiz.title}</Col>
                <Col>
                  <QuizEditor quiz={quiz} onSave={handleQuizUpdated} onDelete={handleQuizDeleted} />
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default QuizManagement;
