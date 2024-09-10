export default interface GroupDataType {
  name: string;
  members: {
    [uid: string]: {
      role: "creator" | "teacher" | "student";
      joined: string;
    };
  };
  creator: {
    id: string;
    username: string;
  },
  groupId: string;
}