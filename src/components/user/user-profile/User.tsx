import React, { useState, useContext, useEffect } from 'react';
import { UserDataType } from '../../../types/UserDataType';
import { AppContext } from '../../../state/app.context';
import { blockUser, unblockUser, updateUserProfile } from '../../../services/users.service';

const User: React.FC = () => {
  const { user, userData: realUserData, setAppState } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState<UserDataType | null>(null);

  useEffect(() => {
    if (realUserData) {
      setUserData({
        ...realUserData
      });
    }
  }, [user, realUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (userData) {
      await updateUserProfile(userData);
      setEditing(false);
      setAppState((prevState) => ({ ...prevState, userData }));
    }
  };

  const handleBlockUser = async () => {
    if (userData && userData.isAdmin) {
      await blockUser(userData.username);
      setAppState((prevState) => ({
        ...prevState,
        userData: { ...userData, isBlocked: true },
      }));
    }
  };

  const handleUnblockUser = async () => {
    if (userData && userData.isAdmin) {
      await unblockUser(userData.username);
      setAppState((prevState) => ({
        ...prevState,
        userData: { ...userData, isBlocked: false },
      }));
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>Firstname: {userData.firstName} <br /> Lastname: {userData.lastName}</h2>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Phone: {userData.phoneNumber}</p>
      <p>Address: {userData.address}</p>
      <p>Role: {userData.isTeacher ? 'Educator' : userData.isStudent ? 'Student' : 'User'}</p>
      <p>Status: {userData.isBlocked ? 'Blocked' : 'Active'}</p>

      {editing ? (
        <div>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="phoneNumber"
            value={userData.phoneNumber}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
          />
          <button onClick={handleProfileUpdate}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      )}

      {userData.isAdmin && (
        <div>
          <button onClick={userData.isBlocked ? handleUnblockUser : handleBlockUser}>
            {userData.isBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>
      )}
    </div>
  );
};

export default User;
