import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { get, ref, query, equalTo, orderByChild } from 'firebase/database';
import { auth, db } from '../config/firebase-config';
import { UserDataType } from '../types/UserDataType'; 

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
export const loginUser = async (email: string, password: string): Promise<{ firebaseUser: User, userData: UserDataType | null }> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(firebaseUser.uid));
  const userSnapshot = await get(userRef);

  let userData: UserDataType | null = null;
  if (userSnapshot.exists()) {
    userData = Object.values(userSnapshot.val())[0] as UserDataType;

    if (userData.isBlocked) {
      await signOut(auth);
      throw new Error('This account has been blocked. Please contact support.');
    }
  }

  return { firebaseUser, userData };
};


export const logoutUser = () => {
  return signOut(auth);
};

