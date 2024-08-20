import QuestionDataType from "./QuestionDataType";
import { UserDataType } from "./UserDataType";

export default interface QuizDataType {
    title: string;
    category: string;
    isOpen: boolean;
    isPublic: boolean;
    isOngoing: boolean;
    questions: {
        [questID: string]: QuestionDataType;
    }
    scores: {
        [uid: string]: number;
    }
    creator: string;
    duration: number;
    totalPoints: number;
    groups: {
        [groupName: string]: boolean;
    }
    members: { [uid: string]: UserDataType };
    quizID: string;
};