import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import QuizDataType from "../../../types/QuizDataType";
import { getQuizById } from "../../../services/quizes.service";

export default function SingleQuiz() {
  const { id } = useParams<{ id: string }>();
  const [quizData, setQuizData] = useState<QuizDataType | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

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

  return (
    <div>
      <h1>Single Quiz</h1>
      {quizData ? (
        <div>
          <h2>{quizData.title}</h2>
          <p>{quizData.category}</p>
          <p>Remaining time: </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};