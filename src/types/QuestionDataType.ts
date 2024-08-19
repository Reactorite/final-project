export default interface QuestionDataType {
    questID: string;
    question: string;
    answers: {
        [answer: string]: boolean;
    };
    points: number;
}