import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import { AppContext } from '../../state/app.context';
import React from 'react';

export default function Login() {
  const [user, setUser] = useState({
    email: '',
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
    if (!user.email || !user.password) {
      return alert('No credentials provided!');
    }

    try {
      const { firebaseUser, userData } = await loginUser(user.email, user.password);

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
      <label htmlFor="email">Email: </label>
      <input value={user.email} onChange={updateUser('email')} type="text" name="email" id="email" /><br /><br />
      <label htmlFor="password">Password: </label>
      <input value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" /><br />
      <button onClick={login}>Login</button>
    </div>
  );
}
