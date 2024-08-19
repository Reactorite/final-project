import { NavLink } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../state/app.context";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { auth } from "../../config/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";

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
    <>
    <NavLink to="/">HOME</NavLink>
    {user && userData && <NavLink to="/profile">PROFILE</NavLink>} 
    {user && userData && <NavLink to="/profile" onClick={logout}>LOGOUT</NavLink>}
    {/* {!user && <NavLink to="/login">LOGIN</NavLink>} <br />
    {!user && <NavLink to="/register">REGISTER</NavLink>} <br /> */}
    {!user && !isLoading && !userData && <NavLink to="/login">LOGIN</NavLink>} 
    {!user && !isLoading && !userData && <NavLink to="/register">REGISTER</NavLink>} 
    {/* {user && userData!.isTeacher && <NavLink to="/create-quiz">CREATE QUIZ</NavLink>} <br /> */}
    </>
  );
};

export default Header;