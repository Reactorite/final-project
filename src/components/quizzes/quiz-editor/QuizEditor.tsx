import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import QuizDataType from '../../../types/QuizDataType';
import QuestionDataType from '../../../types/QuestionDataType';
import { deleteQuiz, editQuiz } from '../../../services/quizes.service';
import { v4 as uuidv4 } from "uuid";

interface QuizEditorProps {
  quiz: QuizDataType;
  onSave: (updatedQuiz: QuizDataType) => void;
  onDelete: (quizId: string) => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onSave, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState<Partial<QuizDataType>>(quiz);
  const [editedQuestions, setEditedQuestions] = useState<{ [questID: string]: QuestionDataType }>(quiz.questions);
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});

  const handleEditQuiz = () => {
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    const updatedQuiz = {
      ...editedQuiz,
      questions: editedQuestions
    } as QuizDataType;

    await editQuiz(quiz.quizID, updatedQuiz);
    onSave(updatedQuiz);
    setShowEditModal(false);
  };

  const handleDeleteQuiz = async () => {
    await deleteQuiz(quiz.quizID);
    onDelete(quiz.quizID);
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

  const handleLocalAnswerTextChange = (questID: string, answer: string, newAnswer: string) => {
    setAnswerText(prevState => ({
      ...prevState,
      [`${questID}-${answer}`]: newAnswer
    }));
  };

  const handleSaveAnswerText = (questID: string, oldAnswer: string) => {
    const newAnswer = answerText[`${questID}-${oldAnswer}`] || oldAnswer;

    if (newAnswer !== oldAnswer) {
      setEditedQuestions(prevState => {
        const updatedAnswers = { ...prevState[questID].answers };
        updatedAnswers[newAnswer] = updatedAnswers[oldAnswer];
        delete updatedAnswers[oldAnswer];

        return {
          ...prevState,
          [questID]: {
            ...prevState[questID],
            answers: updatedAnswers
          }
        };
      });

      setAnswerText(prevState => {
        const { [`${questID}-${oldAnswer}`]: _, ...rest } = prevState;
        return rest;
      });
    }
  };

  const handleAnswerCorrectChange = (questID: string, answer: string, isCorrect: boolean) => {
    setEditedQuestions(prevState => {
      const updatedAnswers = { ...prevState[questID].answers };
      updatedAnswers[answer] = isCorrect;

      return {
        ...prevState,
        [questID]: {
          ...prevState[questID],
          answers: updatedAnswers
        }
      };
    });
  };

  const handleDeleteAnswer = (questID: string, answer: string) => {
    setEditedQuestions(prevState => {
      const updatedAnswers = { ...prevState[questID].answers };
      delete updatedAnswers[answer];

      return {
        ...prevState,
        [questID]: {
          ...prevState[questID],
          answers: updatedAnswers
        }
      };
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
    <>
      <Button variant="warning" onClick={handleEditQuiz} style={{ marginRight: '10px' }}>
        Edit
      </Button>
      <Button variant="danger" onClick={handleDeleteQuiz}>
        Delete
      </Button>

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
                  <Form.Group key={`${question.questID}-${answer}`} controlId={`answer_${question.questID}_${answer}`}>
                    <Row>
                      <Col>
                        <Form.Control
                          type="text"
                          value={answerText[`${question.questID}-${answer}`] !== undefined ? answerText[`${question.questID}-${answer}`] : answer}
                          onChange={(e) => handleLocalAnswerTextChange(question.questID, answer, e.target.value)}
                          onBlur={() => handleSaveAnswerText(question.questID, answer)}
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          label="Correct"
                          checked={isCorrect}
                          onChange={(e) => handleAnswerCorrectChange(question.questID, answer, e.target.checked)}
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
    </>
  );
};

export default QuizEditor;
