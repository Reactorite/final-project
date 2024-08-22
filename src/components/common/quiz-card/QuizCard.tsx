import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import QuizDataType from "../../../types/QuizDataType";
import { Card, Button } from "react-bootstrap";

interface QuizCardProps {
  quizes: QuizDataType[];
}

const QuizCard: React.FC<QuizCardProps> = ({ quizes }) => {
  return (
    <div className="container mt-4">
      {quizes.map((quiz) => (
        <Card key={quiz.creator} className="card mb-3">
          <div className="card-body">
            <h4 className="card-title">{quiz.title}</h4>
            <p className="card-text">Category: {quiz.category}</p>
            <p className="card-text">Duration: {quiz.duration}min</p>
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
  );
};

export default QuizCard;
