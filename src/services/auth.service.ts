import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { UserDataType } from '../types/UserDataType'; 

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string): Promise<UserDataType> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  return {
    uid: '',
    username: user.displayName || '',
    email: user.email || '',
    firstName: '',  
    lastName: '',
    phoneNumber: user.phoneNumber || '',
    photo: user.photoURL || '',
    address: '',
    quizRank: {},
    rank: 0,
    globalPoints: 0,
    groups: {},
    isOwner: false,
    isAdmin: false,
    isBlocked: false,
    isTeacher: false,
    isStudent: false,
  };
};

export const logoutUser = () => {
  return signOut(auth);
};
