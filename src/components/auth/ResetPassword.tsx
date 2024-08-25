import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../config/firebase-config";
import { useNavigate } from "react-router";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSetEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = () => {
    try {
      sendPasswordResetEmail(auth, email);
      alert('Password reset email sent.');
      navigate('/login');
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
      <h1>Reset Password</h1>
      <label htmlFor="email">Email: </label>
      <input value={email} onChange={(event) => handleSetEmail(event)} type="email" name="email" id="email" /><br /><br />
      <button onClick={() => handleResetPassword()}>Reset Password</button>
    </div>
  );
}