// src/services/notification.service.ts
import { ref, push, update } from "firebase/database";
import { db } from "../config/firebase-config"; 
import { NotificationDataType } from "../types/NotificationDataType";

export const sendNotification = async (senderID: string, receiverID: string, message: string) => {
  const notificationData: NotificationDataType = {
    sender: senderID,
    receiver: receiverID,
    message: message,
    timestamp: Date.now(),
    status: "unread",
    invitationStatus: "pending"
  };

  try {
    const notificationRef = ref(db, "notifications");
    await push(notificationRef, notificationData);
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }
};

export const acceptInvitation = async (notificationID: string) => {
  try {
    const notificationRef = ref(db, `notifications/${notificationID}`);
    await update(notificationRef, { invitationStatus: "accepted", status: "read" });
    console.log("Invitation accepted successfully");
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw new Error("Failed to accept invitation");
  }
};

export const rejectInvitation = async (notificationID: string) => {
  try {
    const notificationRef = ref(db, `notifications/${notificationID}`);
    await update(notificationRef, { invitationStatus: "rejected", status: "read" });
    console.log("Invitation rejected successfully");
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    throw new Error("Failed to reject invitation");
  }
};
