import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppContext, AppContextType } from './state/app.context';
import { Dispatch, SetStateAction } from 'react';
import { auth } from './config/firebase-config';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Header from './components/common/Header';
import { getUserData } from './services/users.service';
import { UserDataType } from './types/UserDataType';
import Home from './pages/home/Home';
import { useAuthState } from 'react-firebase-hooks/auth';
import LoadingSpinner from './components/common/loading/LoadingSpinner';


function App() {
  const [appState, setAppState] = useState<AppContextType>({
    user: null,
    userData: null,
    setAppState: () => {},
  });

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      getUserData(user.uid)
        .then((data: Record<string, UserDataType> | null) => {
          if (data && Object.keys(data).length > 0) {
            const userData = data[Object.keys(data)[0]];
            setAppState(prevState => ({
              ...prevState,
              userData,
            }));
          } else {
            setAppState(prevState => ({
              ...prevState,
              userData: null,
            }));
          }
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
        });
    } else {
      setAppState(prevState => ({
        ...prevState,
        user: null,
        userData: null,
        isAdmin: false,
        isBlocked: false,
        isOwner: false,
      }));
    }
  }, [user]);

  const updateAppState: Dispatch<SetStateAction<AppContextType>> = (newState) => {
    if (typeof newState === 'function') {
      setAppState(prevState => newState(prevState));
    } else {
      setAppState(prevState => ({
        ...prevState,
        ...newState,
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AppContext.Provider value={{ ...appState, setAppState: updateAppState }}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;