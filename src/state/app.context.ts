import { createContext } from "react";

interface UserDataType {
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
  groups: string[];
}

interface AppContextType {
  user: object | null;
  userData: UserDataType | null;
  isOwner: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  userData: null,
  isOwner: false,
  isAdmin: false,
  isBlocked: false,
  isTeacher: false,
  isStudent: false,
});