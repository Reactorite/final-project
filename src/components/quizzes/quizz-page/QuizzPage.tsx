import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../state/app.context";
import { getStudentUsers } from "../../../services/users.service";
import { UserDataType } from "../../../types/UserDataType";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QuizzPage.css";
import { Button, Card, Modal } from "react-bootstrap";
import QuizDataType from "../../../types/QuizDataType";
import { deleteQuiz, getAllQuizzes, getQuizesByUid } from "../../../services/quizes.service";
import { onValue, ref, set } from "firebase/database";
import { db } from "../../../config/firebase-config";
import { sendNotification } from "../../../services/notification.service";

export default function QuizzPage() {
  const { userData } = useContext(AppContext);
  const [students, setStudents] = useState<UserDataType[]>([]);
  const [quizes, setQuizes] = useState<QuizDataType[]>([]);
  const [allQuizes, setAllQuizes] = useState<QuizDataType[]>([]);
  const [ongoingQuizes, setOngoingQuizes] = useState<QuizDataType[]>([]);

  // const ongoingQuizes = allQuizes.filter((quiz) => (quiz.isOngoing === true && quiz.creator === userData?.uid));
  const closedQuizes = allQuizes.filter((quiz) => (quiz.isOpen === false && quiz.creator === userData?.uid));

  useEffect(() => {
    const fetchOngoingQuizes = async () => {
      const data = await getAllQuizzes();
      if (data) {
        setOngoingQuizes(data.filter((quiz) => (quiz.isOngoing === true && quiz.creator === userData?.uid)));
      }
    };
    fetchOngoingQuizes();
  }, [quizes]);

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
  }, [students]);

  useEffect(() => {
    if (quizes.length === 0) {
      getQuizesByUid(userData?.uid || "")
        .then((data) => {
          if (data) {
            setQuizes(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching quizes:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizes]);

  useEffect(() => {
    if (allQuizes && allQuizes.length > 0) {
      const listeners = allQuizes.map((quiz) => {
        return onValue(ref(db, `quizzes/${quiz.quizID}`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
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
  }, [allQuizes]);

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setQuizes((prevQuizes) => prevQuizes.filter((quiz) => quiz.quizID !== quizId));
      alert("Quiz deleted!");
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  const handleInvite = async (student: UserDataType) => {
    if (userData) {
      try {
        await sendNotification(userData.uid, student.uid, `You have been invited to a quiz by ${userData.firstName}`);
        alert("Invitation sent!");
      } catch (err) {
        console.error("Error sending invitation:", err);
      }
    }
  };

  // return <QuizCard quizes={quizes} />;

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
                          <p className="card-text">Rank: {student.rank}</p>
                          <p className="card-text">{student.email}</p>
                          <Button
                            onClick={() => handleInvite(student)} 
                            variant="secondary"
                            style={{
                              marginTop: "10px",
                              marginLeft: "5px",
                              backgroundColor: "blue",
                            }}
                          >
                            Invite
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
                      <Card key={quiz.creator} className="card mb-3">
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
                  {closedQuizes.length > 0 ? quizes
                    .filter(
                      (quiz) =>
                        quiz.isOpen === false && quiz.creator === userData.uid
                    )
                    .map((quiz) => (
                      <Card key={quiz.creator} className="card mb-3">
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
    </div>
  );
}
