import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';  
import { Button, Card, Modal, Spinner } from 'react-bootstrap';
import './BattleArena.css';
import { createBattleRoom, fetchQuizzes, joinBattleRoom } from '../../services/battle-arena.service';
import QuizDataType from '../../types/QuizDataType'; 
import { AppContext } from '../../state/app.context';
import { ref, update, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { db } from '../../config/firebase-config';

const BattleArena: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizDataType[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDataType | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [noRoomMessage, setNoRoomMessage] = useState<string | null>(null);

  const { user, userData } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const fetchedQuizzes = await fetchQuizzes();
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    loadQuizzes();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNoRoomMessage(null);
  };

  const handleCreateRoom = async () => {
    if (selectedQuiz && user && userData) {
      try {
        const newRoomId = await createBattleRoom(selectedQuiz.category, user.uid, userData.username);
        setRoomId(newRoomId);
        console.log('Room created with ID:', newRoomId);
        console.log('Selected quiz:', selectedQuiz);
        handleCloseModal();
        navigate(`/battle-room/${newRoomId}`);
      } catch (error) {
        console.error('Error creating room:', error);
      }
    }
  };
  
  const handleJoinRoom = async () => {
    if (roomId && userData) {
        try {
            const roomRef = ref(db, `battle-rooms/${roomId}`);
            const roomSnapshot = await get(roomRef);

            if (roomSnapshot.exists() && roomSnapshot.val().randomSearchActive) {
                const participants = roomSnapshot.val().participants || {};
                const isAlreadyParticipant = !!participants[userData.uid];

                if (!isAlreadyParticipant) {
                    const participantsRef = ref(db, `battle-rooms/${roomId}/participants/${userData.uid}`);
                    await set(participantsRef, {
                        username: userData.username,
                        status: 'Not Ready'
                    });
                }

                handleCloseModal();
                navigate(`/battle-room/${roomId}`);
            } else {
                console.error('The room does not accept random searches.');
                setNoRoomMessage('The room does not accept random searches.');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            setNoRoomMessage('Failed to join the room.');
        }
    }
};

const handleReadyForBattle = async () => {
  if (user && userData && selectedQuiz) {
      setLoading(true);
      setNoRoomMessage(null);
      try {
          const userRef = ref(db, `users/${userData.username}`);
          await update(userRef, {
              'uid': userData.uid, 
              'isReadyForBattle': true,
              'readyCategory': selectedQuiz.category,
          });

          const battleRoomsRef = query(ref(db, 'battle-rooms'), orderByChild('category'), equalTo(selectedQuiz.category));
          const snapshot = await get(battleRoomsRef);
          const rooms = snapshot.val() || {};
          const roomKeys = Object.keys(rooms).filter(key => rooms[key].randomSearchActive);

          setTimeout(async () => {
              if (roomKeys.length > 0) {
                  const randomRoomIndex = Math.floor(Math.random() * roomKeys.length);
                  const selectedRoomId = roomKeys[randomRoomIndex];
                  await update(userRef, {
                      'isReadyForBattle': false,
                      'readyCategory': null
                  });
                  const participantsRef = ref(db, `battle-rooms/${selectedRoomId}/participants/${userData.uid}`);
                  await set(participantsRef, {
                      username: userData.username,
                      status: 'Not Ready'
                  });

                  setRoomId(selectedRoomId);
                  setLoading(false);
                  navigate(`/battle-room/${selectedRoomId}`);
              } else {
                  setLoading(false);
                  const userRef = ref(db, `users/${userData.username}`);
                  await update(userRef, {
                      'uid': userData.uid, 
                      'isReadyForBattle': false,
                      'readyCategory': null,
                  });
        
                  setNoRoomMessage('No available room found for this category with random search activated.');
              }
          }, 3500);

      } catch (error) {
          console.error('Error setting user ready for battle:', error);
          setLoading(false);
          setNoRoomMessage('Error occurred while trying to find a room.');
      }
  }
};

  

  return (
    <div className="battle-arena-wrapper">
        <div className="battle-arena-wrapper">
    <div className="battle-arena-menu">
      <Button variant="custom-primary" className="arena-button" onClick={handleOpenModal}>
        1 vs 1
      </Button>
      <Button variant="custom-secondary" className="arena-button">
        Team battles
      </Button>
      <Button variant="custom-success" className="arena-button" onClick={() => navigate('/blitz-room')}>
        Blitz quiz
      </Button>
      <Button variant="custom-info" className="arena-button" onClick={() => navigate('/sample-room')}>
        Sample quiz
      </Button>
    </div>
      </div>

      <div className="battle-arena-scoreboards">
        <Card className="scoreboard">
          <Card.Body>
            <Card.Title>Global scoreboard: Single user</Card.Title>
            <Card.Text>1. Faker: 12000</Card.Text>
          </Card.Body>
        </Card>
        <Card className="scoreboard">
          <Card.Body>
            <Card.Title>Global scoreboard: Teams</Card.Title>
            <Card.Text>Fnatic: 25000</Card.Text>
          </Card.Body>
        </Card>
        <Card className="scoreboard">
          <Card.Body>
            <Card.Title>Global scoreboard: Blitz rank</Card.Title>
            <Card.Text>...</Card.Text>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create or Join a Battle Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <select
            className="form-control"
            onChange={(e) => {
              const selectedQuiz = quizzes.find((quiz) => quiz.quizID === e.target.value);
              setSelectedQuiz(selectedQuiz || null);
            }}
          >
            <option value="">Select Category</option>
            {quizzes.map((quiz) => (
              <option key={quiz.quizID} value={quiz.quizID}>
                {quiz.category}
              </option>
            ))}
          </select>
          <div className="mt-3">
            <Button variant="primary" onClick={handleCreateRoom} disabled={!selectedQuiz}>
              Create Room
            </Button>
            {roomId && (
              <Button variant="secondary" onClick={handleJoinRoom} className="ml-2">
                Join Room
              </Button>
            )}
          </div>
          <div className="mt-3">
            <Button variant="info" onClick={handleReadyForBattle} disabled={!selectedQuiz || loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Ready for Battle'}
            </Button>
          </div>
          {noRoomMessage && (
            <div className="mt-3">
              <p className="text-danger">{noRoomMessage}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BattleArena;
