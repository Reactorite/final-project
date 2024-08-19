export default interface GroupDataType {
    name: string;
    members: {
        [uid: string]: {
          role: "creator" | "teacher" | "student";  // You can store member roles or other info
          joined: string;
        };
      };
    creator: string;
}