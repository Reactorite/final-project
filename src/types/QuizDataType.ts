import QuestionDataType from "./QuestionDataType";

export default interface QuizDataType {
    title: string;
    category: string;
    isOpen: boolean;
    isPublic: boolean;
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
    members: {
        [studentId: string]: boolean;
    }
    quizID: string;
};