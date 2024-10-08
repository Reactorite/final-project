import { useContext, useState, ChangeEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AppContext } from "../../state/app.context";
import { registerUser } from "../../services/auth.service";
import { createUserHandle, getUserByHandle } from "../../services/users.service";
import { UserDataType } from "../../types/UserDataType";
import { sendEmailVerification } from "firebase/auth";

export default function Register() {
  const [user, setUser] = useState<UserDataType>({
    uid: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    photo: 'https://wallpapers-clan.com/wp-content/uploads/2023/02/assassins-creed-desmond-miles-art-wallpaper.jpg',
    address: '',
    quizRank: {},
    rank: 'Novice',
    globalPoints: 0,
    groups: {},
    isOwner: false,
    isAdmin: false,
    isBlocked: false,
    isTeacher: false,
    isStudent: false,
    isOnline: false,
    isReadyForBattle: false,
  });
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const updateUser = (prop: keyof UserDataType) => (e: ChangeEvent<HTMLInputElement>) => {
    setUser(prev => ({
      ...prev,
      [prop]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRepeatPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  };

  const handleSecretKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSecretKey(e.target.value);
  };

  const register = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user.email || !password) {
      return alert('No credentials provided!');
    }

    if (password !== repeatPassword) {
      return alert('Passwords do not match!');
    }

    try {
      const userFromDB = await getUserByHandle(user.username);
      if (userFromDB) {
        return alert(`User ${user.username} already exists!`);
      }

      const credential = await registerUser(user.email, password);
      const uid = credential.user.uid;

      if (credential.user) {
        await sendEmailVerification(credential.user);
        alert('Verification email sent! Please check your inbox.');
      }

      const isTeacher = secretKey === "bestkey";
      const isStudent = !isTeacher;

      const userData: UserDataType = {
        ...user,
        uid,
        isTeacher: isTeacher,
        isStudent: isStudent,
      };

      await createUserHandle(userData);

      setAppState({
        user: credential.user,
        userData: userData,
        setAppState
      });

      navigate('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };


  return (
    <>
      <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <h1>Register</h1>
        <label htmlFor="username">Username: </label>
        <input value={user.username} onChange={updateUser('username')} type="text" name="username" id="username" /><br /><br />
        <label htmlFor="email">Email: </label>
        <input value={user.email} onChange={updateUser('email')} type="text" name="email" id="email" /><br /><br />
        <label htmlFor="firstName">First Name: </label>
        <input value={user.firstName} onChange={updateUser('firstName')} type="text" name="firstName" id="firstName" /><br /><br />
        <label htmlFor="lastName">Last Name: </label>
        <input value={user.lastName} onChange={updateUser('lastName')} type="text" name="lastName" id="lastName" /><br /><br />
        <label htmlFor="password">Password: </label>
        <input value={password} onChange={handlePasswordChange} type="password" name="password" id="password" /><br /><br />
        <label htmlFor="repeatPassword">Repeat Password: </label>
        <input value={repeatPassword} onChange={handleRepeatPasswordChange} type="password" name="repeatPassword" id="repeatPassword" /><br /><br />
        <label htmlFor="secretKey">Secret Key: </label>
        <input value={secretKey} onChange={handleSecretKeyChange} type="password" name="secretKey" id="secretKey" /><br /><br />
        <button onClick={register}>Register</button>
      </div>
    </>
  );
}
