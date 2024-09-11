import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../state/app.context';
import { getRandomQuizByCategory } from '../../services/battle-arena.service';
import { ref, onValue, update, off, get, remove } from 'firebase/database';
import QuizDataType from '../../types/QuizDataType';
import './BattleMode.css';
import { db } from '../../config/firebase-config';
import { Button } from 'react-bootstrap';

interface BattleModeProps {
  category: string;
  participants: {
    [uid: string]: {
      username: string;
      points: number;
      photo?: string;
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
  const [timer, setTimer] = useState<number>(0);
  const [quizTitle, setQuizTitle] = useState<string>('');

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
        setTimer(randomQuiz.duration * 60);

        update(battleRoomRef, {
          currentQuestionIndex: 0,
          turn: hostUserId,
          scoreboard: initialScoreboard,
          quizTitle: randomQuiz.title  
        });
      } catch (error) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };

    loadQuiz();
  }, []);  

  useEffect(() => {
    const syncBattleState = onValue(battleRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentQuestionIndex(data.currentQuestionIndex);
        setTurn(data.turn);
        setScoreboard(data.scoreboard);
        setQuizTitle(data.quizTitle); 
      }
    });

    return () => off(battleRoomRef);
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      }).catch((error) => console.error("Error updating Firebase:", error));
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const handleBackToBattleArena = async () => {
    const currentUserPoints = scoreboard[userData?.uid || ''] || 0;
    if (userData?.uid) {
      const globalPoints = typeof userData.globalPoints === 'number' ? userData.globalPoints : 0;
      await update(ref(db, `users/${userData.username}/`), {
        globalPoints: globalPoints + currentUserPoints,
      });
    }

    const roomRef = ref(db, `battle-rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (roomSnapshot.exists()) {
      const participants = roomSnapshot.val().participants || {};
      if (Object.keys(participants).length <= 1) {
        await remove(roomRef);
      } else {
        await remove(ref(db, `battle-rooms/${roomId}/participants/${userData?.uid}`));
      }
    }
    window.location.href = '/battle-arena';
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;

  const questionKeys = quiz ? Object.keys(quiz.questions) : [];

  if (!quiz || questionKeys.length === 0) {
    return <div>No quiz available or no questions found</div>;
  }

  const currentQuestionKey = questionKeys[currentQuestionIndex];
  const currentQuestion = quiz.questions[currentQuestionKey];

  if (timer <= 0) {
    return (
      <div className="finish-container">
        <div className="timer">Time's up!</div>
        <h3>Quiz finished!</h3>
        <div className="scoreboard">
          {participantList.map(([uid, { username }]) => (
            <div key={uid}>
              {username}: {scoreboard[uid]} points
            </div>
          ))}
        </div>
        <Button className="finish-button" onClick={handleBackToBattleArena}>Back to Battle Arena</Button>
      </div>
    );
  }

  if (!currentQuestion || currentQuestionIndex >= questionKeys.length) {
    return (
      <div className="finish-container">
        <h3>Quiz finished!</h3>
        <div className="scoreboard">
          {participantList.map(([uid, { username }]) => (
            <div key={uid}>
              {username}: {scoreboard[uid]} points
            </div>
          ))}
        </div>
        <Button className="finish-button" onClick={handleBackToBattleArena}>Back to Battle Arena</Button>
      </div>
    );
  }

  const isUserTurn = userData?.uid === turn;

  return (
    <div className="battle-mode">
      <div className="user-info user1-info">
        <h3>{currentUser ? currentUser[1].username : 'Loading...'}</h3>
        <img
          src={currentUser?.[1].photo || 'default-avatar.png'}
          alt={`${currentUser?.[1].username}'s avatar`}
          className="participant-avatar"
        />
        <p>Points: {currentUser ? scoreboard[currentUser[0]] : 0}</p>
      </div>
      <div className="quiz-section">
        {quiz && (
          <h2 className="quiz-title">{quizTitle}</h2>
        )}
        <div className="timer">
          Time left: {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <h3 className="quiz-question">{currentQuestion.question}</h3>
        <div className="answers">
          {Object.entries(currentQuestion.answers).map(([answer, isCorrect]) => (
            <button
              key={answer}
              onClick={() => handleAnswer(answer, Boolean(isCorrect), currentQuestion.points)}
              className={`answer-button ${selectedAnswer === answer
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
        {opponentUser && (
          <img
            src={opponentUser[1].photo || 'default-avatar.png'}
            alt={`${opponentUser[1].username}'s avatar`}
            className="participant-avatar"
          />
        )}
        <p>Points: {opponentUser ? scoreboard[opponentUser[0]] : 0}</p>
      </div>
    </div>
  );
};

export default BattleMode;
