/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserByHandle } from './users.service';
import { get, set, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';
import QuizDataType from '../types/QuizDataType';

export const getQuizesByUid = async (uid: string): Promise<QuizDataType[] | null> => {
  const snapshot = await get(ref(db, `quizzes`));
  const allQuizes = snapshot.val() as Record<string, QuizDataType> | null;
  return allQuizes ? Object.values(allQuizes).filter(quiz => quiz.creator === uid) : null;
};

export const deleteQuiz = async (quizID: string): Promise<void> => {
  const quizRef = ref(db, `quizzes/${quizID}`);
  try {
    await remove(quizRef);
    console.log(`Quiz with ID ${quizID} was successfully deleted.`);
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw new Error('Could not delete the quiz.');
  }
};

export const editQuiz = async (quizID: string, updatedData: Partial<QuizDataType>): Promise<void> => {
  const quizRef = ref(db, `quizzes/${quizID}`);
  try {
    await update(quizRef, updatedData);
    console.log(`Quiz with ID ${quizID} was successfully updated.`);
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw new Error('Could not update the quiz.');
  }
};

export const getAllQuizzes = async (): Promise<QuizDataType[] | null> => {
  const snapshot = await get(ref(db, `quizzes`));
  const allQuizzes = snapshot.val() as Record<string, QuizDataType> | null;
  return allQuizzes ? Object.values(allQuizzes) : null;
};