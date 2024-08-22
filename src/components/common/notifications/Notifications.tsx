// src/components/NotificationDropdown.tsx
import React, { useState, useEffect } from "react";
import { NavDropdown, Badge } from "react-bootstrap";
import { ref, onValue } from "firebase/database";
import { db } from "../../../config/firebase-config";
import { acceptInvitation, rejectInvitation } from "../../../services/notification.service";
import { NotificationDataType } from "../../../types/NotificationDataType";


interface NotificationProps {
  userId: string;
}
interface NotificationWithId extends NotificationDataType {
    id: string;
  }

const Notification: React.FC<NotificationProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<NotificationWithId[]>([]);

  useEffect(() => {
    const notificationsRef = ref(db, "notifications");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userNotifications = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        })).filter(
          (notification: any) => notification.receiver === userId
        );
        setNotifications(userNotifications);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAccept = (notificationID: string) => {
    acceptInvitation(notificationID);
  };

  const handleReject = (notificationID: string) => {
    rejectInvitation(notificationID);
  };

  return (
    <NavDropdown
      title={
        <>
          NOTIFICATIONS{" "}
          {notifications.length > 0 && notifications.some((notif) => notif.status === "unread") && (
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
          <NavDropdown.Item key={notification.id}>
            {notification.message}{" "}
            <Badge bg={notification.status === "unread" ? "danger" : "secondary"}>
              {notification.status}
            </Badge>
            {notification.invitationStatus === "pending" && (
              <div>
                <button onClick={() => handleAccept(notification.id)}>Accept</button>
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
