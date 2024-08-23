export interface NotificationDataType {
  sender: string;
  receiver: string;
  message: string;
  timestamp: number;
  status: "unread" | "read";
  invitationStatus?: "pending" | "accepted" | "rejected";
  quizTitle?: string; 
  quizID?: string;  
}

  // const ROLE = {
  //   OWNER: "OWNER",
  //   ADMIN: "ADMIN",
  //   STUDENT: "STUDENT",
  //   TEACHER: "TEACHER",
  // } as const;
  
  // interface User {
  //   roles: keyof typeof ROLE[];
  // }
  // const ROLE = {
  //   OWNER: "OWNER",
  //   ADMIN: "ADMIN",
  //   STUDENT: "STUDENT",
  //   TEACHER: "TEACHER",
  // } as const;
  
  // interface User {
  //   roles: keyof typeof ROLE[];
  // }

  // enum ROLE {
  //   OWNER = "OWNER",
  //   ADMIN = "ADMIN",
  //   STUDENT = "STUDENT",
  //   TEACHER ="TEACHER",
  // };
  
  // interface User {
  //   roles: ROLE[];
  // }