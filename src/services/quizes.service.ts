/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserByHandle } from './users.service';
import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config';
import QuizDataType from '../types/QuizDataType';

export const getQuizesByUid = async (uid: string): Promise<QuizDataType[] | null> => {
  const snapshot = await get(ref(db, `quizzes`));
  const allQuizes = snapshot.val() as Record<string, QuizDataType> | null;
  return allQuizes ? Object.values(allQuizes).filter(quiz => quiz.creator === uid) : null;
};