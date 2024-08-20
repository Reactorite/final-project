import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../state/app.context";
import { getStudentUsers } from "../../../services/users.service";
import { UserDataType } from "../../../types/UserDataType";
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuizzPage.css';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';

export default function QuizzPage() {
  const { userData } = useContext(AppContext);
  const [students, setStudents] = useState<UserDataType[]>([]);

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

  function sendInvitation() {

  }
  
  return (
    <div className="container mt-4">
      {userData?.isTeacher && (
        <>
          <Card className="card" style={{ maxHeight: '80vh', maxWidth: '25vw', overflowY: 'scroll' }}>
            <h3 className="text-center sticky-header">Students</h3>
              <div className="card-body">
                {students.map((student) => (
                  <Card key={student.uid} className="card mb-3">
                    <div className="card-body">
                      <h4 className="card-title">{student.firstName} {student.lastName}</h4>
                      <p className="card-text">Rank: {student.rank}</p>
                      <p className="card-text">{student.email}</p>
                      <Button onClick={sendInvitation} variant="secondary" style={{ marginTop: '10px', marginLeft: '5px', backgroundColor: 'blue'}}>Invite</Button>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}