import React, { useState, useEffect, useContext } from "react";
import { NavDropdown, Badge } from "react-bootstrap";
import { ref, onValue, update, set } from "firebase/database";
import { db } from "../../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { NotificationDataType } from "../../../types/NotificationDataType";
import { acceptInvitation, rejectInvitation } from "../../../services/notification.service";
import { AppContext } from "../../../state/app.context";

interface NotificationProps {
  userId: string;
  userName: string;
}

interface NotificationWithId extends NotificationDataType {
  id: string;
}

const Notification: React.FC<NotificationProps> = ({ userId, userName }) => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
  const {userData} = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    const notificationsRef = ref(db, "notifications");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userNotifications = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value as NotificationDataType,
          }))
          .filter((notification: NotificationWithId) => notification.receiver === userId);
        setNotifications(userNotifications);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const addParticipantToRoom = async (roomId: string, userId: string, username: string) => {
    const participantRef = ref(db, `battle-rooms/${roomId}/participants/${userId}`);
    await set(participantRef, {
      username: username,
      status: "Not Ready",
      photo: userData?.photo || "default-avatar.png"
    });
  };

  const updateReadyStatus = async (userId: string, userName: string) => {
    const userRef = ref(db, `users/${userName}/${userId}`);
    await update(userRef, {
      isReadyForBattle: false,
    });
  };

  const handleAccept = async (notificationID: string, roomId?: string) => {
    try {
      if (roomId && userId && userName) {

        await acceptInvitation(notificationID, userName, roomId, userId, userData?.photo);
  

        await addParticipantToRoom(roomId, userId, userName);

        await updateReadyStatus(userId, userName);
  
        navigate(`/battle-room/${roomId}`);
      } else {
        console.error("Room ID, User ID, or User Name is missing");
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };
  
  

  const handleReject = async (notificationID: string) => {
    try {
      await rejectInvitation(notificationID, userName);
    } catch (error) {
      console.error("Failed to reject invitation:", error);
    }
  };

  const markAsRead = async (notificationID: string) => {
    try {
      const notificationRef = ref(db, `notifications/${notificationID}`);
      await update(notificationRef, { status: "read" });
      setNotifications(notifications.map(notification => 
        notification.id === notificationID ? { ...notification, status: "read" } : notification
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
<NavDropdown
  title={
    <>
      <span style={{ marginLeft: "10px"}}>NOTIFICATIONS</span> 
      {notifications.length > 0 &&
        notifications.some((notif) => notif.status === "unread") && (
          <Badge bg="danger" style={{ position: 'absolute', top: '2px', right: '-64px' }}>
            {notifications.filter((notif) => notif.status === "unread").length}
          </Badge>
        )}
    </>
  }
  id="notification-dropdown"
  className="notification-dropdown"
>
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <NavDropdown.Item
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            style={{ cursor: "pointer" }}
          >
            {notification.message}{" "}
            <Badge bg={notification.status === "unread" ? "danger" : "secondary"}>
              {notification.status}
            </Badge>
            {notification.invitationStatus === "pending" && notification.status === "unread" && notification.receiver === userId && notification.sender !== userId && notification.message.includes("invited you to join") && (
              <div>
                <button onClick={() => handleAccept(notification.id, notification.roomId)}>Accept</button>
                <button onClick={() => handleReject(notification.id)}>Reject</button>
              </div>
            )}
          </NavDropdown.Item>
        ))
      ) : (
        <NavDropdown.Item>No notifications</NavDropdown.Item>
      )}
    </NavDropdown>
  );
};

export default Notification;
