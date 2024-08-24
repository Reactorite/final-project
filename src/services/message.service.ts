import { ref, push, update, onValue } from "firebase/database";
import { db } from "../config/firebase-config"; 
import { MessageDataType } from "../types/MessageDataType";

export const getChatId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join('_');
};

export interface MessageWithId extends MessageDataType {
  id: string;
}

export const sendMessage = async (
  senderID: string,
  receiverID: string,
  message: string
) => {
  // console.log('sendMessage called with:', { senderID, receiverID }); 
  const chatId = getChatId(senderID, receiverID);
  const messageData: MessageDataType = {
    sender: senderID, 
    receiver: receiverID,
    message: message,
    timestamp: Date.now(),
    status: "unread",
  };

  try {
    const messagesRef = ref(db, `messages/${chatId}`);
    await push(messagesRef, messageData);
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

export const markMessageAsRead = async (senderID: string, receiverID: string, messageID: string) => {
  const chatId = getChatId(senderID, receiverID);
  try {
    const messageRef = ref(db, `messages/${chatId}/${messageID}`);
    await update(messageRef, { status: "read" });
  } catch (error) {
    console.error("Failed to mark message as read", error);
    throw new Error("Failed to mark message as read");
  }
};

export const subscribeToMessages = (
  senderID: string,
  receiverID: string,
  callback: (messages: MessageWithId[]) => void
) => {
  const chatId = getChatId(senderID, receiverID);
  const messagesRef = ref(db, `messages/${chatId}`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages: MessageWithId[] = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as MessageDataType),
      }));
      callback(messages);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};
