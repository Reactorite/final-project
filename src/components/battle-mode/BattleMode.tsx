import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../state/app.context';
import { getRandomQuizByCategory } from '../../services/battle-arena.service';
import { ref, onValue, update, off } from 'firebase/database';
import QuizDataType from '../../types/QuizDataType';
import './BattleMode.css';
import { db } from '../../config/firebase-config';

interface BattleModeProps {
  category: string;
  participants: {
    [uid: string]: {
      username: string;
      points: number;
    };
  };
  roomId: string;
  hostUserId: string;
}

const BattleMode: React.FC<BattleModeProps> = ({ category, participants, roomId, hostUserId }) => {
    const { userData } = useContext(AppContext);
    const [quiz, setQuiz] = useState<QuizDataType | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [turn, setTurn] = useState<string>(hostUserId); 
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); 
    const [scoreboard, setScoreboard] = useState<{ [uid: string]: number }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
  
    const participantList = Object.entries(participants);
    const currentUser = participantList.find(([uid]) => uid === userData?.uid);
    const opponentUser = participantList.find(([uid]) => uid !== userData?.uid);
  
    const battleRoomRef = ref(db, `battle-rooms/${roomId}`);
  
    useEffect(() => {
      const loadQuiz = async () => {
        try {
          const randomQuiz = await getRandomQuizByCategory(category);
          setQuiz(randomQuiz);
          setLoading(false);
  
          const initialScoreboard = participantList.reduce((acc, [uid]) => {
            acc[uid] = 0;
            return acc;
          }, {} as { [uid: string]: number });
          setScoreboard(initialScoreboard);
  
          update(battleRoomRef, {
            currentQuestionIndex: 0,
            turn: hostUserId,
            scoreboard: initialScoreboard,
          });
        } catch (error) {
          setError('Failed to load quiz');
          setLoading(false);
        }
      };
  
      loadQuiz();
    }, [category]);
  
    useEffect(() => {
      const syncBattleState = onValue(battleRoomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentQuestionIndex(data.currentQuestionIndex);
          setTurn(data.turn);
          setScoreboard(data.scoreboard);
        }
      });
  
      return () => syncBattleState();
    }, [roomId]);
  
    const handleAnswer = (answer: string, isCorrect: boolean, points: number) => {
        const currentUserUid = participantList.find(([uid]) => uid === turn)?.[0];
      
        if (currentUserUid) {
          const newScore = isCorrect ? scoreboard[currentUserUid] + points : scoreboard[currentUserUid];
          const nextTurn = currentUserUid === hostUserId ? opponentUser?.[0] : hostUserId;
      
          update(battleRoomRef, {
            scoreboard: {
              ...scoreboard,
              [currentUserUid]: newScore,
            },
            turn: nextTurn, 
            currentQuestionIndex: currentQuestionIndex + 1,
          }).then(() => {
            setSelectedAnswer(null); 
            console.log("Firebase update successful, next turn:", nextTurn);
          }).catch((error) => console.error("Error updating Firebase:", error));
        } else {
          console.log("No current user found for this turn.");
        }
      };
      
  
    if (loading) return <div>Loading quiz...</div>;
    if (error) return <div>{error}</div>;
  
    const questionKeys = quiz ? Object.keys(quiz.questions) : [];
  
    if (!quiz || questionKeys.length === 0) {
      return <div>No quiz available or no questions found</div>;
    }
  
    const currentQuestionKey = questionKeys[currentQuestionIndex]; 
    const currentQuestion = quiz.questions[currentQuestionKey];
  
    if (!currentQuestion || currentQuestionIndex >= questionKeys.length) {
      return (
        <div>
          <h3>Quiz finished!</h3>
          <div className="scoreboard">
            {participantList.map(([uid, { username }]) => (
              <div key={uid}>
                {username}: {scoreboard[uid]} points
              </div>
            ))}
          </div>
        </div>
      );
    }
  
    const isUserTurn = userData?.uid === turn;
  
    return (
      <div className="battle-mode">
        <div className="user-info user1-info">
          <h3>{currentUser ? currentUser[1].username : 'Loading...'}</h3>
          <p>Points: {currentUser ? scoreboard[currentUser[0]] : 0}</p>
        </div>
        <div className="quiz-section">
          <h3 className="quiz-question">{currentQuestion.question}</h3>
          <div className="answers">
            {Object.entries(currentQuestion.answers).map(([answer, isCorrect]) => (
              <button
                key={answer}
                onClick={() => handleAnswer(answer, Boolean(isCorrect), currentQuestion.points)}
                className={`answer-button ${
                  selectedAnswer === answer
                    ? isCorrect
                      ? 'correct-answer'
                      : 'incorrect-answer'
                    : ''
                }`}
                disabled={!isUserTurn || selectedAnswer !== null}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
        <div className="user-info user2-info">
          <h3>{opponentUser ? opponentUser[1].username : 'Waiting for opponent...'}</h3>
          <p>Points: {opponentUser ? scoreboard[opponentUser[0]] : 0}</p>
        </div>
      </div>
    );
  };
  
  export default BattleMode;
  