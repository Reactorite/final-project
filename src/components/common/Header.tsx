import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../../state/app.context";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { auth } from "../../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import './Header.css'; 
import Notification from "./notifications/Notifications";

const Header = () => {
  const { userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  const logout = async () => {
    await logoutUser();
    setAppState((prevState) => ({
      ...prevState,
      user: null,
      userData: null
    }));
    navigate('/login');
  };

  return (
    <div className="header-container">
      <NavLink to="/" className="header-link">HOME</NavLink>
      {user && userData && <NavLink to="/user-profile" className="header-link">PROFILE</NavLink>}
      {user && userData && <NavLink to="/" className="header-link" onClick={logout}>LOGOUT</NavLink>}
      {!user && !isLoading && !userData && <NavLink to="/login" className="header-link">LOGIN</NavLink>}
      {!user && !isLoading && !userData && <NavLink to="/register" className="header-link">REGISTER</NavLink>}
      {user && userData && userData.isTeacher && <NavLink to="/create-quiz" className="header-link">CREATE QUIZ</NavLink>}
      {user && userData && <NavLink to="quizz-page" className="header-link">QUIZ PAGE</NavLink>}
      {user && userData && userData.isAdmin && <NavLink to='/admin-panel' className="header-link">ADMIN PANEL</NavLink>}
      <div className="header-link">
      {user && userData && <Notification userId={userData.uid} userName={userData.username}/>} 
      </div>
      <div className="header-link">
        {user && userData && <NavLink to="/messages" className="header-link">MESSAGES</NavLink>} 
      </div>
    </div>
  );
};

export default Header;
