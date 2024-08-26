import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import './BattleArena.css';
import { createBattleRoom, getRandomQuizByCategory, joinBattleRoom } from '../../services/battle-arena.service';
import QuizDataType from '../../types/QuizDataType'; 

const BattleArena: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizDataType | null>(null); 

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCreateRoom = async () => {
    try {
      const newRoomId = await createBattleRoom('currentUserId', category);
      setRoomId(newRoomId);
      console.log('Room created with ID:', newRoomId);
      
      const randomQuiz = await getRandomQuizByCategory(category);
      setQuiz(randomQuiz); 
      console.log('Random quiz:', randomQuiz);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (roomId) {
      try {
        const status = await joinBattleRoom(roomId, 'opponentUserId');
        console.log('Joined room with status:', status);
        setOpponentId('opponentUserId');
        handleCloseModal();
      } catch (error) {
        console.error('Error joining room:', error);
      }
    }
  };

  return (
    <div className="battle-arena-wrapper">
      <div className="battle-arena-menu">
        <Button variant="custom-primary" className="arena-button" onClick={handleOpenModal}>
          1 vs 1
        </Button>
        <Button variant="custom-secondary" className="arena-button">
          Team battles
        </Button>
        <Button variant="custom-success" className="arena-button">
          Blitz quiz
        </Button>
        <Button variant="custom-info" className="arena-button">
          Sample quiz
        </Button>
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
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter Category"
            className="form-control"
          />
          <div className="mt-3">
            <Button variant="primary" onClick={handleCreateRoom}>
              Create Room
            </Button>
            {roomId && (
              <Button variant="secondary" onClick={handleJoinRoom} className="ml-2">
                Join Room
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BattleArena;
