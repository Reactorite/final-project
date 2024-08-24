import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import { AppContext } from '../../state/app.context';
import React from 'react';

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
    <div>
      <h1>Login</h1>
      <label htmlFor="username">Username: </label>
      <input value={user.username} onChange={updateUser('username')} type="text" name="username" id="username" /><br /><br />
      <label htmlFor="password">Password: </label>
      <input value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" /><br />
      <button onClick={login}>Login</button><br /><br />
      <p>Forgot your password? Click the button below to reset.</p>
      <button onClick={() => navigate('/reset-password')}>Reset Password</button>
    </div>
  );
}
