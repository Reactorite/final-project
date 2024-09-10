import { get, push, ref, remove, update } from "firebase/database";
import GroupDataType from "../types/GroupDataType";
import { db } from "../config/firebase-config";
import { v4 as uuidv4 } from "uuid";

export const createGroup = async (name: string, creatorId: string, creatorUsername: string) => {
  const newId = uuidv4();
  try {
    const groupData: GroupDataType = {
      name,
      members: {
        [creatorId]: {
          role: "creator",
          joined: new Date().toLocaleDateString(),
        },
      },
      creator: {
        id: creatorId,
        username: creatorUsername,
      },
      groupId: newId,
    };
    const groupRef = ref(db, "groups");
    await push(groupRef, groupData);
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
};

export const fetchGroups = async (uid: string) => {
  try {
    const groupsRef = ref(db, "groups");
    const groupsSnapshot = await get(groupsRef);
    const groupsData = groupsSnapshot.val();
    if (groupsData) {
      const userGroups = Object.keys(groupsData)
        .filter((groupId) => groupsData[groupId].members[uid])
        .map((groupId) => ({
          id: groupId,
          ...groupsData[groupId],
        }));
      return userGroups;
    }
    return [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const deleteGroup = async (groupId: string, uid: string) => {
  try {
    const groups = await fetchGroups(uid);
    const updatedGroups = groups.filter((group) => group.groupId !== groupId);
    const updates = { [`/groups`]: updatedGroups };
    await update(ref(db), updates);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }
};

export const getAllGroups = async () => {
  try {
    const groupsRef = ref(db, "groups");
    const groupsSnapshot = await get(groupsRef);
    const groupsData = groupsSnapshot.val();
    if (groupsData) {
      const groups = Object.keys(groupsData).map((groupId) => ({
        id: groupId,
        ...groupsData[groupId],
      }));
      return groups;
    }
    return [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new Error("Failed to fetch groups");
  }
};