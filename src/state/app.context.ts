import { createContext, Dispatch, SetStateAction } from 'react';
import { UserDataType } from '../types/UserDataType'; 

export interface AppContextType {
  user: UserDataType | null; 
  userData: UserDataType | null;
  setAppState: Dispatch<SetStateAction<AppContextType>>;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  userData: null,
  setAppState: () => {},
});
