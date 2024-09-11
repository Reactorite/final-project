import React, { useContext, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!loading && userData) {
      const unsubscribe = getUnreadMessagesCount(userData.uid, setUnreadMessages);
      return () => unsubscribe();
    }
  }, [loading, userData]);

  const logout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");
    if (confirmLogout) {
      if (userData && userData.username) {
        await logoutUser(userData.username);
        setAppState((prevState) => ({
          ...prevState,
          user: null,
          userData: null
        }));
        navigate('/login');
      } else {
        console.error("No username found for logged in user.");
      }
    } else {
      navigate(location.pathname);
    }
  };

  return (
    <div className="header-container">
      <div className="vertical-header">
        {user && userData && (userData.isAdmin || userData.isOwner) && <NavLink to='/admin-panel' className="header-link"><span className="link-text">ADMIN PANEL</span><span className="icon">👑</span></NavLink>}
        <NavLink to="/" className="header-link"><span className="link-text">HOME</span><span className="icon">🏠</span></NavLink>
        {user && userData && <NavLink to="/user-profile" className="header-link"><span className="link-text">PROFILE</span><span className="icon">👤</span></NavLink>}
        {user && userData && <NavLink to="/battle-arena" className="header-link"><span className="link-text">BATTLE ARENA</span><span className="icon">⚔️</span></NavLink>}
        {/* {user && userData && <NavLink to="/groups" className="header-link"><span className="link-text">GROUPS</span><span className="icon">👥</span></NavLink>} */}
        {!user && <NavLink to="/login" className="header-link"><span className="link-text">LOGIN</span><span className="icon">🔓</span></NavLink>}
        {!user && <NavLink to="/register" className="header-link"><span className="link-text">REGISTER</span><span className="icon">📝</span></NavLink>}
        {user && userData && (userData.isTeacher || userData.isAdmin || userData.isOwner) && <NavLink to="/create-quiz" className="header-link"><span className="link-text">CREATE QUIZ</span><span className="icon">❓</span></NavLink>}
        {/* {user && userData && <NavLink to="/quizz-page" className="header-link"><span className="link-text">QUIZ PAGE</span><span className="icon">❓</span></NavLink>} */}
        {user && userData && (
          <NavLink to="/messages" className="header-link">
            <span className="link-text">MESSAGES {unreadMessages > 0 && (<Badge bg="danger">{unreadMessages}</Badge>)}</span>
            <span className="icon">💌</span>
          </NavLink>
        )}
        {user && userData && <div className="header-link notification-link">
          {user && userData && <Notification userId={userData.uid} userName={userData.username} />}
          {user && userData && <span className="icon">🔔</span>}
        </div>}
        {user && userData && (
          <a href="/" className="header-link logout-link" onClick={(e) => { e.preventDefault(); logout(); }}>
            <span className="link-text">LOGOUT</span><span className="icon">🚪</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default Header;
