export interface MessageDataType {
    sender: string;
    receiver: string;
    message: string;
    timestamp: number;
    status: "unread" | "read";
  }
  