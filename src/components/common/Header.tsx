import { NavLink } from "react-router-dom";
import React, { useContext } from "react";
import { AppContext } from "../../state/app.context";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";

const Header = () => {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

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
    <>
    <NavLink to="/">HOME</NavLink> <br />
      <NavLink to="/profile">PROFILE</NavLink> <br />
      <NavLink to="/profile" onClick={logout}>LOGOUT</NavLink> <br />
    {!user && <NavLink to="/login">LOGIN</NavLink>} <br />
    {!user && <NavLink to="/register">REGISTER</NavLink>} <br />
    {user && user.isTeacher && <NavLink to="/create-quiz">CREATE QUIZ</NavLink>} <br />
    </>
  );
};

export default Header;