import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppContext, AppContextType } from './state/app.context';
import { Dispatch, SetStateAction } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase-config';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Header from './components/common/Header';
import { getUserData } from './services/users.service';
import { UserDataType } from './types/UserDataType';
import CreateQuiz from './components/quizzes/create-quiz/CreateQuiz';
import LoadingSpinner from './components/common/loading/LoadingSpinner';
import User from './components/user/user-profile/User';
import AdminPanel from './components/admin/AdminPanel/AdminPanel';
import QuizzPage from './components/quizzes/quizz-page/QuizzPage';
import StudentQuizPage from './components/quizzes/student-quiz-page/StudentQuizPage';
import SingleQuiz from './components/quizzes/single-quiz/SingleQuiz';
import Home from './components/home/Home';
import Messages from './components/common/messages/Messages';
import ResetPassword from './components/auth/ResetPassword';
import SingleUser from './components/user/single-user/SingleUser';
import BattleArena from './components/battle-arena/BattleArena';
import BattleRoom from './components/battle-room/BattleRoom';
import BlitzRoom from './components/blitz-room/BlitzRoom';
import SampleQuizRoom from './components/sample-quiz-room/SampleQuizRoom';
import BlitzMode from './components/blitz-mode/BlitzMode';
import SampleQuizMode from './components/sample-quiz-mode/SampleQuizMode';
import Group from './components/groups/Group';

function App() {
  const [appState, setAppState] = useState<AppContextType>({
    user: null,
    userData: null,
    setAppState: () => { },
  });

  const [user, loading, error] = useAuthState(auth);

  if (user !== appState.user) {
    setAppState({
      ...appState,
      user: user || null
    })
  }

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
          <Route path='/battle-arena' element={<BattleArena />}></Route>
          <Route path="/battle-room/:roomId" element={<BattleRoom />} />
          <Route path="/battle-room/:roomId/battle-mode" element={<BattleRoom />} />
          <Route path="/blitz-room" element={<BlitzRoom />} />
          <Route path="/sample-room" element={<SampleQuizRoom />} />
          <Route path="/blitz-mode/:quizID" element={<BlitzMode />} />
          <Route path="/sample-mode/:quizID" element={<SampleQuizMode />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-quiz" element={(appState.userData?.isTeacher || appState.userData?.isAdmin || appState.userData?.isOwner ) && <CreateQuiz />} />
          <Route path='/user-profile' element={<User />} />
          <Route path='/profile/:id' element={<SingleUser />} />
          <Route path='/quizz-page' element={appState.userData?.isTeacher ? <QuizzPage /> : appState.userData?.isStudent && <StudentQuizPage />} />
          <Route path='/admin-panel' element={(appState.userData?.isAdmin || appState.userData?.isOwner) && <AdminPanel />}></Route>
          <Route path='/play-quiz/:id' element={<SingleQuiz />} />
          <Route path='/messages' element={appState.user?.uid ? <Messages userId={appState.user.uid} /> : <Login />} />
          <Route path='/groups' element={<Group />} />
          <Route path='*' element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
