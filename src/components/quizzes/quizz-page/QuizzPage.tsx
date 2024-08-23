import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../state/app.context";
import { getStudentUsers } from "../../../services/users.service";
import { UserDataType } from "../../../types/UserDataType";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QuizzPage.css";
import { Button, Card, Modal } from "react-bootstrap";
import QuizDataType from "../../../types/QuizDataType";
import { deleteQuiz, getAllQuizzes, getQuizesByUid } from "../../../services/quizes.service";
import { onValue, ref } from "firebase/database";
import { db } from "../../../config/firebase-config";
import { sendNotification } from "../../../services/notification.service";
import getRanking from "../../../utils/ranking/ranking";
import CustomAlert from "../../common/custom-alert/CustomAlert"; 

export default function QuizzPage() {
  const { userData } = useContext(AppContext);
  const [students, setStudents] = useState<UserDataType[]>([]);
  const [quizes, setQuizes] = useState<QuizDataType[]>([]);
  const [allQuizes, setAllQuizes] = useState<QuizDataType[]>([]);
  const [ongoingQuizes, setOngoingQuizes] = useState<QuizDataType[]>([]);
  const [privateQuizes, setPrivateQuizes] = useState<QuizDataType[]>([]);
  const [invitedStudents, setInvitedStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserDataType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string; type: "success" | "error" | "warning" | "info" }[]>([]);


  const closedQuizes = allQuizes.filter((quiz) => (quiz.isOpen === false && quiz.creator === userData?.uid));

  useEffect(() => {
    const fetchPrivateQuizes = async () => {
      const data = await getAllQuizzes();
      if (data) {
        setPrivateQuizes(data.filter((quiz) => quiz.isPublic === false && quiz.creator === userData?.uid));
      }
    };
    fetchPrivateQuizes();
  }, [userData?.uid]);

  useEffect(() => {
    const fetchOngoingQuizes = async () => {
      const data = await getAllQuizzes();
      if (data) {
        setOngoingQuizes(data.filter((quiz) => (quiz.isOpen === true && quiz.creator === userData?.uid)));
      }
    };
    fetchOngoingQuizes();
  }, [userData?.uid]);

  useEffect(() => {
    const fetchAllQuizes = async () => {
      const data = await getAllQuizzes();
      if (data) {
        setAllQuizes(data);
      }
    };
    fetchAllQuizes();
  }, []);

  useEffect(() => {
    if (students.length === 0) {
      getStudentUsers()
        .then((data) => {
          if (data) {
            setStudents(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
        });
    }
  }, []);

  useEffect(() => {
    if (quizes.length === 0 && userData?.uid) {
      getQuizesByUid(userData?.uid)
        .then((data) => {
          if (data) {
            setQuizes(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching quizes:", err);
        });
    }
  }, [userData?.uid]);

  useEffect(() => {
    if (allQuizes && allQuizes.length > 0) {
      const listeners = allQuizes.map((quiz) => {
        return onValue(ref(db, `quizzes/${quiz.quizID}`), (snapshot) => {
          const data = snapshot.val();
          if (data && !quizes.some(q => q.quizID === data.quizID)) {
            setQuizes((prevQuizes) => [...prevQuizes, data]);
          }
        }, (error) => {
          console.error("Error fetching quizes:", error);
        });
      });

      return () => {
        listeners.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [allQuizes, quizes]);

  const showAlert = (message: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now();
    setAlerts([...alerts, { id, message, type }]);

    setTimeout(() => {
      setAlerts((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 3000);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setQuizes((prevQuizes) => prevQuizes.filter((quiz) => quiz.quizID !== quizId));
      showAlert("Quiz deleted!", "success");
    } catch (err) {
      console.error("Error deleting quiz:", err);
      showAlert("Error deleting quiz!", "error");
    }
  };

  const handleInvite = (student: UserDataType) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleSendInvitation = async (quiz: QuizDataType) => {
    if (userData && selectedStudent && quiz.title && quiz.quizID) { 
      try {
        await sendNotification(
          userData.uid,
          selectedStudent.uid,
          `You have been invited to the quiz "${quiz.title}" by ${userData.firstName}`,
          quiz.title,
          quiz.quizID
        );
        setInvitedStudents((prevInvited) => [...prevInvited, selectedStudent.uid]);
        setShowModal(false);
        showAlert("Invitation sent!", "success");
      } catch (err) {
        console.error("Error sending invitation:", err);
        showAlert("Error sending invitation!", "error");
      }
    } else {
      console.error("Quiz title or ID is missing!");
      showAlert("Quiz title or ID is missing!", "warning");
    }
  };
  
  return (
    <div className="quiz-page-container">
      <div className="container mt-4">
        {userData?.isTeacher && (
          <div className="row" style={{ display: "flex" }}>
            <div className="col-md-4 d-flex">
              <Card
                className="card flex-fill"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "30vw",
                  overflowY: "scroll",
                  minHeight: "80vh",
                }}
              >
                <h3 className="text-center sticky-header">Students</h3>
                <div className="card-body">
                  {students.map((student) => (
                    <Card key={student.uid} className="card mb-3">
                      <div className="card-body">
                        <h4 className="card-title">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="card-text">Rank: {getRanking(student.globalPoints)}</p>
                        <p className="card-text">{student.email}</p>
                        <Button
                          onClick={() => handleInvite(student)} 
                          variant="secondary"
                          style={{
                            marginTop: "10px",
                            marginLeft: "5px",
                            backgroundColor: invitedStudents.includes(student.uid) ? "green" : "blue",
                          }}
                          disabled={invitedStudents.includes(student.uid)}
                        >
                          {invitedStudents.includes(student.uid) ? "Invited" : "Invite"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          <div className="col-md-4 d-flex">
            <Card
              className="card flex-fill"
              style={{
                maxHeight: "80vh",
                maxWidth: "30vw",
                overflowY: "scroll",
                minHeight: "80vh",
              }}
            >
              <h3 className="text-center sticky-header">Ongoing quizes</h3>
              <div className="card-body">
                {ongoingQuizes.length > 0 ? (
                  ongoingQuizes.map((quiz) => (
                    <Card key={quiz.quizID} className="card mb-3">
                      <div className="card-body">
                        <h4 className="card-title">{quiz.title}</h4>
                        <p className="card-text">Category: {quiz.category}</p>
                        <p className="card-text">
                          Duration: {quiz.duration}min
                        </p>
                        <Button
                          variant="secondary"
                          style={{
                            marginTop: "10px",
                            marginLeft: "5px",
                            backgroundColor: "blue",
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.quizID)}
                          variant="secondary"
                          style={{
                            marginTop: "10px",
                            marginLeft: "5px",
                            backgroundColor: "red",
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="card mb-3">
                    <div className="card-body">
                      <h4 className="card-title">No ongoing quizes!</h4>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </div>
          <div className="col-md-4 d-flex">
            <Card
              className="card flex-fill"
              style={{
                maxHeight: "80vh",
                maxWidth: "30vw",
                overflowY: "scroll",
                minHeight: "80vh",
                marginBottom: "25px",
              }}
            >
              <h3 className="text-center sticky-header">Closed quizes</h3>
              <div className="card-body">
                {closedQuizes.length > 0 ? closedQuizes.map((quiz) => (
                  <Card key={quiz.quizID} className="card mb-3">
                    <div className="card-body">
                      <h4 className="card-title">{quiz.title}</h4>
                      <p className="card-text">Category: {quiz.category}</p>
                      <p className="card-text">
                        Duration: {quiz.duration}min
                      </p>
                      <Button
                        variant="secondary"
                        style={{
                          marginTop: "10px",
                          marginLeft: "5px",
                          backgroundColor: "blue",
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteQuiz(quiz.quizID)}
                        variant="secondary"
                        style={{
                          marginTop: "10px",
                          marginLeft: "5px",
                          backgroundColor: "red",
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                )) : (
                  <Card className="card mb-3">
                  <div className="card-body">
                    <h4 className="card-title">No closed quizes!</h4>
                  </div>
                </Card>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Select a Quiz</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {privateQuizes.length > 0 ? (
          privateQuizes.map((quiz) => (
            <Card key={quiz.quizID} className="mb-3">
              <Card.Body>
                <Card.Title>{quiz.title}</Card.Title>
                <Card.Text>Category: {quiz.category}</Card.Text>
                <Card.Text>Duration: {quiz.duration}min</Card.Text>
                <Button
                  variant="primary"
                  onClick={() => handleSendInvitation(quiz)}
                >
                  Invite to this Quiz
                </Button>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No private quizzes available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    <div className="alert-container">
      {alerts.map((alert) => (
        <CustomAlert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
        />
      ))}
    </div>
  </div>
);
}
