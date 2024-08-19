import { NavLink } from "react-router-dom";
import React from "react";

const Header = () => {
 return (
    <>
    <NavLink to="/">HOME</NavLink> <br />
    <NavLink to="/login" >LOGIN</NavLink> <br />
    <NavLink to="/register" >REGISTER</NavLink> <br />
    </>
 )
}

export default Header;