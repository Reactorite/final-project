import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import { AppContext } from '../../state/app.context';
import "./Login.css";
import React from 'react';
import { Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export default function Login() {
  const [user, setUser] = useState({
    username: '',
    password: '',
  });

  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const updateUser = (prop: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  const login = async () => {
    if (!user.username || !user.password) {
      return alert('No credentials provided!');
    }

    try {
      const { firebaseUser, userData } = await loginUser(user.username, user.password);

      setAppState((prevState) => ({
        ...prevState,
        user: firebaseUser,
        userData: userData,
      }));

      navigate(location.state?.from.pathname ?? '/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className='login-container' /*style={{ display: "flex", alignItems: "center", flexDirection: "column" }}*/>
      <h1 className='login-title'>Log-in</h1>
      <div className='login-credentials'>
        <input placeholder='Username' value={user.username} onChange={updateUser('username')} type="text" name="username" id="username" /><br /><br />
      </div>
      <div className='login-credentials'>
        <input placeholder='Password' value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" /><br />
      </div><br />
      <Button className='login-button' onClick={login}>Login</Button><br />
      <NavLink className="reset-password" to='/reset-password'>Forgot your password?</NavLink>
      {/* <p>Forgot your password? Click the button below to reset.</p>
      <Button onClick={() => navigate('/reset-password')}>Reset Password</Button> */}
    </div>
  );
}
