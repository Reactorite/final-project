export interface UserDataType {
    uid: string; 
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photo: string;
    address: string;
    quizRank: {
      [category: string]: {
        [quizId: string]: number;
      }
    };
    rank: number;
    globalPoints: number;
    groups: {
      [quizId: string]: string;
    }
    isOwner: boolean,
    isAdmin: boolean,
    isBlocked: boolean,
    isTeacher: boolean,
    isStudent: boolean,
  }
  