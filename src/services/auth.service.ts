import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { get, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { auth, db } from '../config/firebase-config';
import { UserDataType } from '../types/UserDataType'; 

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
export const loginUser = async (username: string, password: string): Promise<{ firebaseUser: User, userData: UserDataType | null }> => {
  const userRef = query(ref(db, 'users'), orderByChild('username'), equalTo(username));
  const userSnapshot = await get(userRef);

  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }

  const userData = Object.values(userSnapshot.val())[0] as UserDataType;
  
  const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
  const firebaseUser = userCredential.user;

  if (userData.isBlocked) {
    await signOut(auth);
    throw new Error('This account has been blocked. Please contact support.');
  }

  const userOnlineRef = ref(db, `users/${userData.username}`); 
  await update(userOnlineRef, { isOnline: true });

  return { firebaseUser, userData };
};


export const logoutUser = async (username: string) => { 
  const userRef = query(ref(db, 'users'), orderByChild('username'), equalTo(username));
  const userSnapshot = await get(userRef);

  if (!userSnapshot.exists()) {
    throw new Error('User not found'); 
  }

  const userData = Object.values(userSnapshot.val())[0] as UserDataType;

  const userOnlineRef = ref(db, `users/${userData.username}`);
  await update(userOnlineRef, { isOnline: false });

  return signOut(auth);
};
