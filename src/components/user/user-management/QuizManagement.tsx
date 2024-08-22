import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Row, Col, Card, Modal, Form } from 'react-bootstrap';
import { deleteQuiz, editQuiz, getAllQuizzes } from '../../../services/quizes.service';
import QuizDataType from '../../../types/QuizDataType';
import QuestionDataType from '../../../types/QuestionDataType';
import { v4 as uuidv4 } from "uuid";

const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizDataType[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizDataType | null>(null);
  const [editedQuiz, setEditedQuiz] = useState<Partial<QuizDataType>>({});
  const [editedQuestions, setEditedQuestions] = useState<{ [questID: string]: QuestionDataType }>({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const fetchedQuizzes = await getAllQuizzes();
    if (fetchedQuizzes) {
      setQuizzes(fetchedQuizzes);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      alert('Quiz deleted successfully!');
      fetchQuizzes(); 
    } catch (error) {
      alert('Failed to delete the quiz.');
    }
  };

  const handleEditQuiz = (quiz: QuizDataType) => {
    setCurrentQuiz(quiz);
    setEditedQuiz(quiz);
    setEditedQuestions(quiz.questions);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (currentQuiz) {
      try {
        const updatedQuiz = {
          ...editedQuiz,
          questions: editedQuestions
        };
        await editQuiz(currentQuiz.quizID, updatedQuiz);
        alert('Quiz updated successfully!');
        setShowEditModal(false);
        fetchQuizzes();
      } catch (error) {
        alert('Failed to update the quiz.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedQuiz({ ...editedQuiz, [name]: value });
  };

  const handleQuestionChange = (questID: string, field: string, value: any) => {
    setEditedQuestions({
      ...editedQuestions,
      [questID]: {
        ...editedQuestions[questID],
        [field]: value
      }
    });
  };

  const handleAnswerChange = (questID: string, answer: string, isCorrect: boolean) => {
    setEditedQuestions({
      ...editedQuestions,
      [questID]: {
        ...editedQuestions[questID],
        answers: {
          ...editedQuestions[questID].answers,
          [answer]: isCorrect
        }
      }
    });
  };

  const handleAddAnswer = (questID: string) => {
    const newAnswer = `Answer ${Object.keys(editedQuestions[questID].answers).length + 1}`;
    setEditedQuestions({
      ...editedQuestions,
      [questID]: {
        ...editedQuestions[questID],
        answers: {
          ...editedQuestions[questID].answers,
          [newAnswer]: false
        }
      }
    });
  };

  const handleDeleteAnswer = (questID: string, answer: string) => {
    const updatedAnswers = { ...editedQuestions[questID].answers };
    delete updatedAnswers[answer];
    setEditedQuestions({
      ...editedQuestions,
      [questID]: {
        ...editedQuestions[questID],
        answers: updatedAnswers
      }
    });
  };

  const handleAddQuestion = () => {
    const newQuestID = uuidv4();
    const newQuestion: QuestionDataType = {
      questID: newQuestID,
      question: '',
      answers: {},
      points: 0
    };
    setEditedQuestions({
      ...editedQuestions,
      [newQuestID]: newQuestion
    });
  };

  const handleDeleteQuestion = (questID: string) => {
    const updatedQuestions = { ...editedQuestions };
    delete updatedQuestions[questID];
    setEditedQuestions(updatedQuestions);
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
                  <Button variant="warning" onClick={() => handleEditQuiz(quiz)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteQuiz(quiz.quizID)} style={{ marginLeft: '10px' }}>
                    Delete
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="quizTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editedQuiz.title || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="quizCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={editedQuiz.category || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="quizDuration">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={editedQuiz.duration || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <hr />
            <h5>Questions</h5>
            {Object.values(editedQuestions).map((question) => (
              <div key={question.questID} className="mb-3">
                <Form.Group controlId={`question_${question.questID}`}>
                  <Form.Label>Question</Form.Label>
                  <Form.Control
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(question.questID, 'question', e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId={`points_${question.questID}`}>
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(question.questID, 'points', e.target.value)}
                  />
                </Form.Group>
                <Form.Label>Answers</Form.Label>
                {Object.entries(question.answers).map(([answer, isCorrect]) => (
                  <Form.Group key={answer} controlId={`answer_${question.questID}_${answer}`}>
                    <Row>
                      <Col>
                        <Form.Control
                          type="text"
                          value={answer}
                          onChange={(e) => {
                            const newAnswer = e.target.value;
                            const updatedAnswers = { ...question.answers };
                            delete updatedAnswers[answer];
                            updatedAnswers[newAnswer] = isCorrect;
                            handleQuestionChange(question.questID, 'answers', updatedAnswers);
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          label="Correct"
                          checked={isCorrect}
                          onChange={(e) => handleAnswerChange(question.questID, answer, e.target.checked)}
                        />
                      </Col>
                      <Col>
                        <Button variant="danger" onClick={() => handleDeleteAnswer(question.questID, answer)}>
                          Delete Answer
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                ))}
                <Button
                  variant="success"
                  onClick={() => handleAddAnswer(question.questID)}
                  style={{ marginTop: '10px' }}
                >
                  Add Answer
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteQuestion(question.questID)}
                  style={{ marginTop: '10px', marginLeft: '10px' }}
                >
                  Delete Question
                </Button>
              </div>
            ))}
            <Button variant="success" onClick={handleAddQuestion} style={{ marginTop: '10px' }}>
              Add Question
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default QuizManagement;
