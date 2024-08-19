import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../config/firebase-config';
import { UserDataType } from '../types/UserDataType';

export const getUserByHandle = async (username: string): Promise<UserDataType | null> => {
  const snapshot = await get(ref(db, `users/${username}`));
  return snapshot.val() as UserDataType | null;
};

export const createUserHandle = async (userData: UserDataType) => {
  await set(ref(db, `users/${userData.username}`), userData);
};

export const getUserData = async (uid: string): Promise<Record<string, UserDataType> | null> => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  return snapshot.val() as Record<string, UserDataType> | null;
};