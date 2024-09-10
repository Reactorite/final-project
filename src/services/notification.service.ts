import { ref, push, update, get, set } from "firebase/database";
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
    quizID: quizID || "Unknown ID",
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

export const acceptInvitation = async (notificationID: string, userName: string, roomId: string, userId: string, userPhoto?: string) => {
  try {
    const notificationRef = ref(db, `notifications/${notificationID}`);
    const notificationSnapshot = await get(notificationRef);

    if (notificationSnapshot.exists()) {
      const notificationData = notificationSnapshot.val() as NotificationDataType;

      await update(notificationRef, { invitationStatus: "accepted", status: "read" });

      const participantsRef = ref(db, `battle-rooms/${roomId}/participants/${userId}`);
      await set(participantsRef, {
        username: userName,
        status: 'Not Ready',
        photo: userPhoto || 'default-avatar.png'
      });

      const message = `Your invitation for the battle was accepted by ${userName}.`;
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

      const message = `Your invitation for battle was rejected by ${userName}.`;
      await sendNotification(notificationData.receiver, notificationData.sender, message, notificationData.quizTitle, notificationData.quizID);

      console.log("Invitation rejected and notification sent successfully.");
    }
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    throw new Error("Failed to reject invitation");
  }
};

export const sendGroupInvitation = async (senderId: string, receiverID: string, groupName: string) => {
  const message = `You have been invited to join the group ${groupName}.`;

  await sendNotification(senderId, receiverID, message);

  console.log("Group invitation sent successfully.");
};

export const sendRequestToJoinGroup = async (senderId: string, senderUsername: string, receiverID: string, groupName: string) => {
  const message = `${senderUsername} sent a request to join ${groupName}.`;

  await sendNotification(senderId!, receiverID, message);

  console.log("Request to join group sent successfully.");
};