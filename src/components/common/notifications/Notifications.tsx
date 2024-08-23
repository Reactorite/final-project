import React, { useState, useEffect } from "react";
import { NavDropdown, Badge } from "react-bootstrap";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../../config/firebase-config";
import { acceptInvitation, rejectInvitation } from "../../../services/notification.service";
import { NotificationDataType } from "../../../types/NotificationDataType";
import { useNavigate } from "react-router-dom";  

interface NotificationProps {
  userId: string;
  userName: string;
}

interface NotificationWithId extends NotificationDataType {
  id: string;
}

const Notification: React.FC<NotificationProps> = ({ userId, userName }) => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const notificationsRef = ref(db, "notifications");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userNotifications = Object.entries(data)
          .map(([key, value]) => {
            const notification = value as NotificationDataType; 
            return {
              id: key,
              ...notification,
            };
          })
          .filter((notification) => notification.receiver === userId);
        setNotifications(userNotifications);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAccept = async (notificationID: string, quizID?: string) => {
    try {
      await acceptInvitation(notificationID, userName);
      if (quizID) {
        navigate(`/quiz/${quizID}`);  
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

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationID
            ? { ...notification, status: "read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <NavDropdown
      title={
        <>
          NOTIFICATIONS{" "}
          {notifications.length > 0 &&
            notifications.some((notif) => notif.status === "unread") && (
              <Badge bg="danger">
                {notifications.filter((notif) => notif.status === "unread").length}
              </Badge>
            )}
        </>
      }
      id="notification-dropdown"
    >
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NavDropdown.Item
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            style={{ cursor: "pointer" }}
          >
            {notification.message}{" "}
            <Badge bg={notification.status === "unread" ? "danger" : "secondary"}>
              {notification.status}
            </Badge>
            {notification.invitationStatus === "pending" && notification.receiver === userId && !notification.message.includes("Your invitation") && (
              <div>
                <button onClick={() => handleAccept(notification.id, notification.quizID)}>Accept</button>
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
