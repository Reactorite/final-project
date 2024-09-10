import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserDataType } from '../types/UserDataType';
import { ref as dbRef} from 'firebase/database';

export const getUserByHandle = async (username: string): Promise<UserDataType | null> => {
  const snapshot = await get(ref(db, `users/${username}`));
  return snapshot.val() as UserDataType | null;
};

export const createUserHandle = async (userData: UserDataType) => {
  await set(ref(db, `users/${userData.username}`), userData);
};

export const getUserData = async (uid: string): Promise<Record<string, UserDataType> | null> => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  return snapshot.val() as Record<string, UserDataType> | null;
};

export const getAllUsers = async (): Promise<UserDataType[]> => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);

  if (snapshot.exists()) {
    const users: UserDataType[] = [];
    snapshot.forEach((childSnapshot) => {
      users.push({
        uid: childSnapshot.key,
        ...childSnapshot.val(),
      } as UserDataType);
    });
    return users;
  } else {
    return [];
  }
};


export const updateUserProfile = async (userData: UserDataType) => {
  await update(ref(db, `users/${userData.username}`), userData);
};

export const blockUser = async (username: string) => {
  const userRef = ref(db, `users/${username}`);
  await update(userRef, { isBlocked: true });
};

export const unblockUser = async (username: string) => {
  const userRef = ref(db, `users/${username}`);
  await update(userRef, { isBlocked: false });
};

export const getStudentUsers = async (): Promise<UserDataType[] | null> => {
  const snapshot = await get(ref(db, 'users'));
  const allUsers = snapshot.val() as Record<string, UserDataType> | null;
  return allUsers ? Object.values(allUsers).filter(user => user.isStudent) : null;
}
export const updateUserProfileWithPicture = async (
  userData: UserDataType, 
  file?: File
): Promise<string | null> => {
  try {
    const userRef = dbRef(db, `users/${userData.username}`);
    
    let profilePictureURL = userData.photo || '';

    if (file) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `profile-pictures/${userData.username}`);
      await uploadBytes(imageRef, file);
      profilePictureURL = await getDownloadURL(imageRef);
    }

    const snapshot = await get(userRef);
    const currentData = snapshot.val();

    const updatedData: UserDataType = {
      ...currentData,
      ...userData,
      profilePictureURL: profilePictureURL || currentData.profilePictureURL
    };

    await update(userRef, updatedData);

    return profilePictureURL;
  } catch (error) {
    console.error("Error updating user profile with picture:", error);
    return null;
  }
};

export const makeAdmin = async (username: string) => {
  const userRef = ref(db, `users/${username}`);
  await update(userRef, { isAdmin: true });
};

export const removeAdmin = async (username: string) => {
  const userRef = ref(db, `users/${username}`);
  await update(userRef, { isAdmin: false });
};