export interface NotificationDataType {
    sender: string;
    receiver: string;
    message: string;
    timestamp: number;
    status: "unread" | "read";
    invitationStatus?: "pending" | "accepted" | "rejected";
  }