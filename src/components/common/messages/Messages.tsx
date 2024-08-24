import React, { useState, useEffect } from "react";
import { sendMessage, subscribeToMessages, markMessageAsRead, MessageWithId } from "../../../services/message.service";
import UserList from "../../user/user-list/UserList";
import "./Messages.css";

interface MessagePageProps {
  userId: string;  
}

const Messages: React.FC<MessagePageProps> = ({ userId }) => {
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!selectedUser) return;

    const unsubscribe = subscribeToMessages(userId, selectedUser.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [userId, selectedUser]);

  const handleSendMessage = async () => {
    if (!selectedUser || newMessage.trim() === "") return;

    try {
      await sendMessage(userId, selectedUser.id, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleMarkAsRead = async (messageID: string) => {
    if (!selectedUser) return;

    try {
      await markMessageAsRead(userId, selectedUser.id, messageID);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageID ? { ...msg, status: "read" } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark message as read", error);
    }
  };

  return (
    <div className="message-page">
      <UserList onSelectUser={(id, name) => setSelectedUser({ id, name })} userId={userId} />
      <div className="chat-container">
        <h3>Chat with {selectedUser ? selectedUser.name : "Select a user"}</h3>
        <div className="chat-window">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender === userId ? "sent" : "received"}`}
              onClick={() => handleMarkAsRead(msg.id)}
            >
              <b>{msg.sender === userId ? "Me" : selectedUser?.name}</b>: {msg.message}
            </div>
          ))}
        </div>
        <div className="message-input-container">
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}  
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
