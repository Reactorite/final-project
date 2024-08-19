import QuestionDataType from "./QuestionDataType";

export interface QuizDataType {
    [quizId: string]: { 
    title: string;
    category: string;
    isOpen: boolean;
    isPublic: boolean;
    isOngoing: boolean;
    questions: QuestionDataType[];
    scores: string;
    creator: string;
    duration: number;
    totalPoints: number;
    groups: string[];
  };
};