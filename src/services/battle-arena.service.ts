import { ref, set, push, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../config/firebase-config";
import QuizDataType from "../types/QuizDataType";

// interface BattleRoom {
//   hostUserId: string;
//   category: string;
//   status: 'open' | 'ready' | 'in-progress' | 'completed';
//   created_at: number;
//   opponentUserId?: string;
// }

export const createBattleRoom = async (
  category: string, 
  hostUserId: string, 
  username: string, 
  photo: string,  
  capacity: number = 2
): Promise<string> => {
  const roomRef = push(ref(db, 'battle-rooms'));

  const roomData = {
    hostUserId: hostUserId,
    category: category,
    status: 'open',
    created_at: Date.now(),
    roomCapacity: capacity,
    participants: {
      [hostUserId]: {
        username: username,
        status: 'Not Ready',
        photo: photo  
      }
    }
  };

  await set(roomRef, roomData);
  return roomRef.key as string;
};



export const joinBattleRoom = async (
  roomId: string, 
  userId: string, 
  username: string, 
  photo: string
): Promise<string> => {
  const roomRef = ref(db, `battle-rooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (roomSnapshot.exists()) {
    const room = roomSnapshot.val();
    if (Object.keys(room.participants).length < room.roomCapacity) {
      const participantRef = ref(db, `battle-rooms/${roomId}/participants/${userId}`);
      await set(participantRef, {
        username: username,
        status: 'Not Ready',
        photo: photo  
      });
      return "joined";
    } else {
      throw new Error('Room is full.');
    }
  } else {
    throw new Error('Room does not exist.');
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

export const fetchQuizzes = async (): Promise<QuizDataType[]> => {
  const quizzesRef = ref(db, 'quizzes');
  const snapshot = await get(quizzesRef);

  if (!snapshot.exists()) {
    throw new Error('No quizzes available.');
  }

  const quizzes: QuizDataType[] = [];
  snapshot.forEach((childSnapshot) => {
    const quizData = childSnapshot.val() as QuizDataType;
    quizzes.push({ ...quizData, quizID: childSnapshot.key as string });
  });

  return quizzes;
};

export const fetchQuizzesByCategory = async (): Promise<string[]> => {
  const quizzesRef = ref(db, 'quizzes');
  const snapshot = await get(quizzesRef);

  if (!snapshot.exists()) {
    throw new Error('No quizzes available.');
  }

  const categories: Set<string> = new Set(); 
  snapshot.forEach((childSnapshot) => {
    const quizData = childSnapshot.val() as QuizDataType;
    categories.add(quizData.category); 
  });

  return Array.from(categories); 
};
