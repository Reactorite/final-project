import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BattleMode from '../battle-mode/BattleMode';
import { db } from '../../config/firebase-config';
import { ref, onValue } from 'firebase/database';

interface BattleModeWrapperProps {
  category: string;
  participants: {
    [uid: string]: {
      points: number;
      username: string;
      status: string;
    };
  };
  roomId: string;
  hostUserId: string;
}

const BattleModeWrapper: React.FC<BattleModeWrapperProps> = ({ participants }) => {
  const { roomId } = useParams<{ roomId: string }>(); 
  const [category, setCategory] = useState<string | undefined>();
  const [hostUserId, setHostUserId] = useState<string | undefined>(); 

  useEffect(() => {
    if (roomId) {
      const battleRoomRef = ref(db, `battle-rooms/${roomId}`);
      onValue(battleRoomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.category) {
          setCategory(data.category);
          setHostUserId(data.hostUserId); 
        }
      });
    }
  }, [roomId]);

  if (!category || !roomId || !hostUserId) return <div>No category, roomId, or hostUserId found or room is unavailable.</div>;

  return <BattleMode category={category} participants={participants} roomId={roomId} hostUserId={hostUserId} />;
};

export default BattleModeWrapper;
