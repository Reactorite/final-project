import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { ref, get, set, push, onValue, update, remove, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../../config/firebase-config';
import { AppContext } from '../../state/app.context';
import './BattleRoom.css';
import { UserDataType } from '../../types/UserDataType';
import BattleModeWrapper from '../battle-mode-wrapper/BattleModeWrapper';

interface Participant {
  username: string;
  status: string;
  points?: number;  
}

const BattleRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<UserDataType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [opponent, setOpponent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);
  const [hostUserId, setHostUserId] = useState<string | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const battleRoomRef = ref(db, `battle-rooms/${roomId}`);
    const unsubRoom = onValue(battleRoomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategory(data.category);
        setParticipants(data.participants || {});
        setHostUserId(data.hostUserId); 
        setBattleStarted(data.status === 'in-battle');
  
        if (data.randomSearchActive === false && loading) {
          setLoading(false);
        }
      }
    });
  
    return () => unsubRoom();
  }, [roomId, loading]);

  useEffect(() => {
    if (Object.keys(participants).length === 2) {
      setLoading(false);
      update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
      console.log('Two participants found, randomSearchActive set to false.');
    }
  }, [participants, roomId]);

  const toggleReadyState = async () => {
    if (userData) {
      const participantRef = ref(db, `battle-rooms/${roomId}/participants/${userData.uid}`);
      const newStatus = isReady ? 'Not Ready' : 'Ready';

      await update(participantRef, {
        status: newStatus,
        username: userData.username,
      });
      setIsReady(!isReady);
    }
  };

  const startBattle = async () => {
    if (hostUserId === userData?.uid) {
      await update(ref(db, `battle-rooms/${roomId}`), {
        status: 'in-battle',
      });
      setBattleStarted(true);
    }
  };

  const handleInvite = async () => {
    setShowInviteModal(true);
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val() as Record<string, UserDataType>;
        const onlineUsersList = Object.values(usersData).filter(user => 
          user.isOnline && user.uid !== userData?.uid
        );
        setOnlineUsers(onlineUsersList);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const handleSendInvite = async (invitedUser: UserDataType) => {
    const newNotificationRef = push(ref(db, `notifications`));
    await set(newNotificationRef, {
      receiver: invitedUser.uid,
      sender: userData?.uid,
      message: `${userData?.username} has invited you to join Battle Room ${roomId}`,
      roomId: roomId,
      status: "unread",
      invitationStatus: "pending",
      timestamp: Date.now(),
    });

    console.log(`Invite sent to ${invitedUser.username} to join room ${roomId}`);
    setShowInviteModal(false);
  };

  const findRandomOpponent = async () => {
    if (userData) {
      console.log('Starting random search...');
      setLoading(true);
  
      try {
        await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: true });
  
        timeoutRef.current = setTimeout(async () => {
          const usersRef = ref(db, `users`);
          const opponentQuery = query(usersRef, orderByChild('isReadyForBattle'), equalTo(true));
          const snapshot = await get(opponentQuery);
  
          if (snapshot.exists()) {
            const users = snapshot.val();
            const userKeys = Object.keys(users).filter(uid => users[uid].uid !== userData?.uid);
            if (userKeys.length > 0) {
              const randomIndex = Math.floor(Math.random() * userKeys.length);
              const selectedOpponent = users[userKeys[randomIndex]];
              setOpponent(selectedOpponent.username);
              console.log('Opponent selected:', selectedOpponent.username);
  
              await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
            } else {
              console.log('No opponents found.');
              setLoading(false);
  
              await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
            }
          } else {
            console.log('No users found in the database.');
            setLoading(false);
  
            await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
          }
        }, 15000);
      } catch (error) {
        console.error('Error during random opponent search:', error);
        setLoading(false);
        
        await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
      }
    }
  };

  const cancelSearch = async () => {
    setLoading(false);
    setOpponent(null);
    await update(ref(db, `battle-rooms/${roomId}`), { randomSearchActive: false });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('Search canceled.');
  };

  const deleteBattleRoom = async () => {
    await remove(ref(db, `battle-rooms/${roomId}`));
    console.log(`Room ${roomId} deleted.`);
    navigate('/battle-arena');
  };

  const handleReturn = async () => {
    if (userData && userData.uid !== hostUserId) {
      await remove(ref(db, `battle-rooms/${roomId}/participants/${userData.uid}`));
      console.log(`User ${userData.username} removed from participants.`);
      navigate('/battle-arena');
    }
  };

  const participantList = Object.values(participants);

  const currentUserIndex = participantList.findIndex(participant => participant.username === userData?.username);
  const currentUser = participantList[currentUserIndex];
  const opponentUser = participantList.find(participant => participant.username !== userData?.username);

  const allReady = participantList.every(participant => participant.status === 'Ready');

  if (battleStarted && category && roomId && hostUserId) {
    const participantsWithDefaultPoints = Object.fromEntries(
      Object.entries(participants).map(([uid, participant]) => [
        uid,
        { ...participant, points: participant.points || 0 },
      ])
    );
  
    return (
      <BattleModeWrapper
        category={category}
        participants={participantsWithDefaultPoints}
        roomId={roomId}  
        hostUserId={hostUserId} 
      />
    );
  }

  return (
    <div className="battle-room">
      <h2 className="room-title">Room Lobby</h2>
      <div className="participants-wrapper">
        <div className="participant">
          <h3>{currentUser?.username || userData?.username}</h3>
          <p>{currentUser?.status || (isReady ? 'Ready' : 'Not Ready')}</p>
        </div>
        <div className="participant">
          <h3>{opponentUser?.username || '(invite or random)'}</h3>
          <p>{opponentUser?.status || ''}</p>
        </div>
      </div>
      <div className="center-content">
        {loading && (
          <>
            <Spinner animation="border" size="sm" />
            <Button variant="danger" onClick={cancelSearch} className="ml-2">Cancel Search</Button>
          </>
        )}
      </div>
      <div className="category-info">
        <h4>Category: {category}</h4>
      </div>
      <div className="actions">
        {userData?.uid === hostUserId ? (
          <>
            <Button variant="secondary" onClick={deleteBattleRoom}>Back</Button>
            <Button onClick={handleInvite}>Invite</Button>
            <Button onClick={findRandomOpponent}>Random Search</Button>
            {allReady && (
              <Button variant="success" onClick={startBattle}>
                Start Battle
              </Button>
            )}
          </>
        ) : (
          <Button variant="danger" onClick={handleReturn}>Return</Button>
        )}
        <Button onClick={toggleReadyState}>
          {isReady ? 'Not Ready' : 'Ready'}
        </Button>
      </div>

      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite a User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul className="list-group mt-3">
            {onlineUsers
              .filter(user => user.username.includes(searchQuery))
              .map(user => (
                <li key={user.uid} className="list-group-item d-flex justify-content-between align-items-center">
                  {user.username}
                  <Button variant="primary" onClick={() => handleSendInvite(user)}>
                    Invite
                  </Button>
                </li>
              ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BattleRoom;
