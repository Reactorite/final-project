import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import QuizDataType from "../../../types/QuizDataType";
import { addQuizMember, getQuizById } from "../../../services/quizes.service";
import { Button } from "react-bootstrap";
import { AppContext } from "../../../state/app.context";

export default function SingleQuiz() {
  const { id } = useParams<{ id: string }>();
  const {userData} = useContext(AppContext);
  const [quizData, setQuizData] = useState<QuizDataType | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (id) {
        try {
          const result = await getQuizById(id);
          setQuizData(result);
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      } else {
        console.error('Quiz ID is undefined');
      }
    };

    fetchQuiz();
  }, []);

  const handleStartQuiz = async () => {
    if (quizData && userData) {
      addQuizMember(quizData.quizID, userData.uid)
        .then(() => {
          console.log('User added to quiz');
        })
        .catch((error) => {
          console.error('Error adding user to quiz:', error);
        });
    }
  };

  return (
    <div>
      <h1>Single Quiz</h1>
      {quizData ? (
        <div>
          <h2>{quizData.title}</h2>
          <p>{quizData.category}</p>
          <p>Remaining time: </p>
          <Button onClick={() => handleStartQuiz()} variant="primary">Start</Button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};