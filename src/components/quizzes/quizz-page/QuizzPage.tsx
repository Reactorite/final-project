import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../state/app.context";
import { getStudentUsers } from "../../../services/users.service";
import { UserDataType } from "../../../types/UserDataType";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QuizzPage.css";
import { Button, Card } from "react-bootstrap";
import QuizDataType from "../../../types/QuizDataType";
import { getQuizesByUid } from "../../../services/quizes.service";
// import QuizCard from "../../common/quiz-card/QuizCard";

export default function QuizzPage() {
  const { userData } = useContext(AppContext);
  const [students, setStudents] = useState<UserDataType[]>([]);
  const [quizes, setQuizes] = useState<QuizDataType[]>([]);

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

  // return <QuizCard quizes={quizes} />;

  return (
    <div className="quiz-page-container">
      <div className="container mt-4">
        {userData?.isTeacher && (
          <div className="row">
            <div className="col-md-6">
              <Card
                className="card"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "30vw",
                  overflowY: "scroll",
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
                          /*onClick={sendInvitation}*/ variant="secondary"
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
            <div className="col-md-6">
              <Card
                className="card"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "30vw",
                  overflowY: "scroll",
                }}
              >
                <h3 className="text-center sticky-header">Ongoing quizes</h3>
                <div className="card-body">
                  {quizes
                    .filter((quiz) => quiz.isOngoing === true)
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
                    ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <div className="container mt-4">
        {userData?.isTeacher && (
          <div className="row">
            <div className="col-md-6">
              <Card
                className="card"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "30vw",
                  overflowY: "scroll",
                  marginBottom: "25px",
                }}
              >
                <h3 className="text-center sticky-header">Closed quizes</h3>
                <div className="card-body">
                  {quizes
                    .filter((quiz) => quiz.isOpen === false)
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
                    ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
