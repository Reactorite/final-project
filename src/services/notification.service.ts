import { ref, push, update, get } from "firebase/database";
import { db } from "../config/firebase-config"; 
import { NotificationDataType } from "../types/NotificationDataType";

export const sendNotification = async (
  senderID: string,
  receiverID: string,
  message: string,
  quizTitle?: string, 
  quizID?: string 
) => {
 
  const notificationData: NotificationDataType = {
    sender: senderID,
    receiver: receiverID,
    message: message,
    timestamp: Date.now(),
    status: "unread",
    invitationStatus: "pending",
    quizTitle: quizTitle || "Unknown Quiz",  
    quizID: quizID || "Unknown ID"  
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

export const acceptInvitation = async (notificationID: string, userName: string) => {
  try {
    const notificationRef = ref(db, `notifications/${notificationID}`);
    const notificationSnapshot = await get(notificationRef);

    if (notificationSnapshot.exists()) {
      const notificationData = notificationSnapshot.val() as NotificationDataType;

      await update(notificationRef, { invitationStatus: "accepted", status: "read" });

      const message = `Your invitation for the quiz "${notificationData.quizTitle}" was accepted by ${userName}.`;
      await sendNotification(notificationData.receiver, notificationData.sender, message, notificationData.quizTitle, notificationData.quizID);
      
      console.log("Invitation accepted and notification sent successfully.");
    }
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw new Error("Failed to accept invitation");
  }
};

export const rejectInvitation = async (notificationID: string, userName: string) => {
  try {
    const notificationRef = ref(db, `notifications/${notificationID}`);
    const notificationSnapshot = await get(notificationRef);

    if (notificationSnapshot.exists()) {
      const notificationData = notificationSnapshot.val() as NotificationDataType;

      await update(notificationRef, { invitationStatus: "rejected", status: "read" });

      const message = `Your invitation for the quiz "${notificationData.quizTitle}" was rejected by ${userName}.`;
      await sendNotification(notificationData.receiver, notificationData.sender, message, notificationData.quizTitle, notificationData.quizID);
      
      console.log("Invitation rejected and notification sent successfully.");
    }
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    throw new Error("Failed to reject invitation");
  }
};
