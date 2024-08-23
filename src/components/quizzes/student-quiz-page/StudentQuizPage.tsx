import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../state/app.context";
import { onValue, ref } from "firebase/database";
import { db } from "../../../config/firebase-config";
import getRanking, { nextRankPoints } from "../../../utils/ranking/ranking";
import QuizDataType from "../../../types/QuizDataType";
import { Card, Button, ProgressBar } from "react-bootstrap";

export default function StudentQuizPage() {
  const { userData } = useContext(AppContext);
  const [ranking, setRanking] = useState('');
  const [quizes, setQuizes] = useState<QuizDataType[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const pointsRef = ref(db, `users/${userData?.username}/globalPoints`);
    const unsubscribe = onValue(pointsRef, (snapshot) => {
      const points = snapshot.val();
      if (points) {
        setProgress(points);
        setRanking(getRanking(points));
      }
    }, (error) => {
      console.error('Error fetching points:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const quizesRef = ref(db, 'quizzes');
    const unsubscribe = onValue(quizesRef, (snapshot) => {
      const quizesData = snapshot.val();
      if (quizesData) {
        setQuizes(Object.values(quizesData));
      }
    }, (error) => {
      console.error('Error fetching quizes:', error);
    });

    return () => unsubscribe();
  }, []);

return (
  <div className="quiz-page-container">
  <div className="container mt-4">
    <h1>Student Quiz Page</h1>
    <h2>Welcome, {userData?.firstName}</h2>
    <p>{ranking}</p>
    <ProgressBar now={progress} max={nextRankPoints} label={`${progress}/${nextRankPoints}`} style={{ maxWidth: '30vw', marginBottom: '2vh' }}/>
    <div className="row" style={{ display: "flex" }}>
      <div className="col-md-8 d-flex">
        <Card
          className="card flex-fill"
          style={{
            maxHeight: "80vh",
            maxWidth: "30vw",
            overflowY: "scroll",
            minHeight: "80vh",
          }}
        >
          <h3 className="text-center sticky-header">Active Quizzes</h3>
          <div className="card-body">
            {quizes.map((quiz) => (
              (quiz.isPublic && quiz.isOpen) && (
              <Card key={quiz.quizID} className="card mb-3">
                <div className="card-body">
                  <h4 className="card-title">{quiz.title}</h4>
                  <p className="card-text">{quiz.category}</p>
                  {quiz.duration === 1
                    ? <p className="card-text">Duration: {quiz.duration} minute</p>
                    : <p className="card-text">Duration: {quiz.duration} minutes</p>
                  }
                  <Button variant="primary">Enroll</Button>
                </div>
              </Card>)
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
</div>
);
}