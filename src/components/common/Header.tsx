import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../../state/app.context";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { auth } from "../../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import './Header.css';
import Notification from "./notifications/Notifications";
import { getUnreadMessagesCount } from "../../services/message.service";
import { Badge } from "react-bootstrap";

const Header = () => {
  const { userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    if (!loading && userData) {
      const unsubscribe = getUnreadMessagesCount(userData.uid, setUnreadMessages);
      return () => unsubscribe();
    }
  }, [loading, userData]);

  const logout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");
    if (confirmLogout) {
      await logoutUser();
      setAppState((prevState) => ({
        ...prevState,
        user: null,
        userData: null
      }));
      navigate('/login');
    }
  };

  return (
    <div className="header-container">
      <NavLink to="/" className="header-link">HOME</NavLink>
      {user && userData && <NavLink to="/user-profile" className="header-link">PROFILE</NavLink>}
      {user && userData && <NavLink to="/" className="header-link" onClick={logout}>LOGOUT</NavLink>}
      <NavLink to="/login" className="header-link">LOGIN</NavLink>
      <NavLink to="/register" className="header-link">REGISTER</NavLink>
      {user && userData && userData.isTeacher && <NavLink to="/create-quiz" className="header-link">CREATE QUIZ</NavLink>}
      {user && userData && <NavLink to="quizz-page" className="header-link">QUIZ PAGE</NavLink>}
      {user && userData && userData.isAdmin && <NavLink to='/admin-panel' className="header-link">ADMIN PANEL</NavLink>}
      <div className="header-link">
        {user && userData && <Notification userId={userData.uid} userName={userData.username} />}
      </div>
      <div className="header-link">
        {user && userData && (
          <NavLink to="/messages" className="header-link">
            MESSAGES{" "}
            {unreadMessages > 0 && (
              <Badge bg="danger">{unreadMessages}</Badge>
            )}
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
