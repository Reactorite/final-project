import { ref, set, push, get, update, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../config/firebase-config";
import QuizDataType from "../types/QuizDataType";

interface BattleRoom {
  host_user_id: string;
  category: string;
  status: 'open' | 'ready' | 'in-progress' | 'completed';
  created_at: number;
  opponent_user_id?: string;
}

export const createBattleRoom = async (hostUserId: string, category: string): Promise<string> => {
  const roomRef = ref(db, 'battle-rooms');
  const newRoomRef = push(roomRef); 

  const roomData: BattleRoom = {
    host_user_id: hostUserId,
    category: category,
    status: 'open',
    created_at: Date.now(),
  };

  await set(newRoomRef, roomData);
  return newRoomRef.key as string; 
};

export const joinBattleRoom = async (roomId: string, opponentUserId: string): Promise<string> => {
  const roomRef = ref(db, `battle-rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (roomSnapshot.exists() && roomSnapshot.val().status === 'open') {
    await update(roomRef, {
      opponent_user_id: opponentUserId,
      status: 'ready',
    });
    return 'joined';
  } else {
    throw new Error('Room is not available or already full.');
  }
};

export const getRandomQuizByCategory = async (category: string): Promise<QuizDataType> => {
  const quizzesRef = ref(db, 'quizzes');
  const categoryQuery = query(quizzesRef, orderByChild('category'), equalTo(category));
  const snapshot = await get(categoryQuery);

  if (!snapshot.exists()) {
    throw new Error('No quizzes available for this category.');
  }

  const quizzes: QuizDataType[] = [];
  snapshot.forEach((childSnapshot) => {
    const quizData = childSnapshot.val() as QuizDataType;
    quizzes.push({ ...quizData, quizID: childSnapshot.key as string });
  });

  const randomIndex = Math.floor(Math.random() * quizzes.length);
  return quizzes[randomIndex]; 
};
