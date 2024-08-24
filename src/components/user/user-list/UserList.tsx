import React, { useEffect, useState } from "react";
import { ref, onValue, update, get } from "firebase/database";
import { db } from "../../../config/firebase-config";
import "./UserList.css";
import { UserDataType } from "../../../types/UserDataType";
import { MessageDataType } from "../../../types/MessageDataType";

interface UserListProps {
  onSelectUser: (userId: string, userName: string) => void;
  userId: string;
}

interface UserWithUnreadCount extends UserDataType {
  unreadCount: number;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, userId }) => {
  const [users, setUsers] = useState<UserWithUnreadCount[]>([]);
  const [userMap, setUserMap] = useState<{ [key: string]: UserWithUnreadCount }>({});

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userMap: { [key: string]: UserWithUnreadCount } = {};
        Object.entries(data).forEach(([key, value]) => {
          const user = value as UserDataType;
          userMap[user.uid] = {
            ...user,
            unreadCount: 0,
          };
        });
        setUserMap(userMap);
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    const messagesRef = ref(db, "messages");

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedUserMap = { ...userMap };
        Object.entries(data).forEach(([chatId, messages]) => {
          const participants = chatId.split('_');
          const otherUserId = participants.find((id) => id !== userId);
          if (otherUserId && updatedUserMap[otherUserId]) {
            const unreadMessages = Object.entries(messages as { [key: string]: MessageDataType }).filter(
              ([, msg]) => msg.receiver === userId && msg.status === "unread"
            ).length;

            updatedUserMap[otherUserId].unreadCount = unreadMessages;
          }
        });

        const sortedUsers = Object.values(updatedUserMap).sort((a, b) => b.unreadCount - a.unreadCount);
        setUsers(sortedUsers);
      }
    });

    return () => {
      unsubscribeMessages();
    };
  }, [userMap, userId]);

  const handleUserClick = async (selectedUserId: string, selectedUserName: string) => {
    onSelectUser(selectedUserId, selectedUserName);

    const chatId = [userId, selectedUserId].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);
    
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const messages = snapshot.val();
      Object.entries(messages as { [key: string]: MessageDataType }).forEach(([messageId, message]) => {
        if (message.receiver === userId && message.status === "unread") {
          const messageRef = ref(db, `messages/${chatId}/${messageId}`);
          update(messageRef, { status: "read" });
        }
      });
    }
  };

  return (
    <div className="user-list">
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li
            key={user.uid}
            onClick={() => handleUserClick(user.uid, user.username)}
            className="user-list-item"
          >
            {user.username} {user.unreadCount > 0 && (
              <span className="unread-count-badge">{user.unreadCount}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
