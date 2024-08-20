import { createContext, Dispatch, SetStateAction } from 'react';
import { UserDataType } from '../types/UserDataType';
import { User } from 'firebase/auth';

export interface AppContextType {
  user: User | null;
  userData: UserDataType | null;
  setAppState: Dispatch<SetStateAction<AppContextType>>;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  userData: null,
  setAppState: () => { }
});