import React, { useContext, useEffect, useState } from "react";
import './Group.css';
import { Button, Card, Modal } from 'react-bootstrap';
import { AppContext } from "../../state/app.context";
import { createGroup, deleteGroup, fetchGroups } from "../../services/groups.service";
import GroupDataType from "../../types/GroupDataType";
import { getAllUsers } from "../../services/users.service";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/firebase-config";
import { sendGroupInvitation, sendRequestToJoinGroup } from "../../services/notification.service";

interface UserData {
  uid: string | undefined;
  username: string;
}

export default function Group() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteToGroup, setInviteToGroup] = useState('');
  const [groupData, setGroupData] = useState<GroupDataType[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [allGroups, setAllGroups] = useState<GroupDataType[]>([]);
  const { userData } = useContext(AppContext);

  useEffect(() => {
    if (userData) {
      getGr();
    }
  }, [userData]);

  useEffect(() => {
    const groupsRef = ref(db, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsArray: GroupDataType[] = Object.values(data);
        setAllGroups(groupsArray);
      } else {
        setAllGroups([]);
      }
    });
  })

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray: UserData[] = Object.values(data);
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleShowInviteModal = (groupName: string) => {
    setShowInviteModal(true);
    setInviteToGroup(groupName);
  }

  const handleCreateNewGroup = async (newGroupName: string, userData: UserData) => {
    if (userData.uid && newGroupName) {
      await createGroup(newGroupName, userData.uid, userData.username);
      setShowModal(false);
      getGr();
    }
  };

  const getGr = async () => {
    try {
      const groups = await fetchGroups(userData!.uid);
      setGroupData(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string, userData: UserData) => {
    await deleteGroup(groupId, userData.uid!);
    setShowDeleteModal(false);
    getGr();
  };

  const handleSendInvitation = async (senderId: string, receiverId: string | undefined, groupNameInvitation: string) => {
    if (senderId && receiverId) {
      await sendGroupInvitation(senderId, receiverId, groupNameInvitation)
        .then(() => {
          alert('Invitation sent successfully');
        })
    }
  };

  const handleRequestToJoinGroup = async (senderId: string, senderUsername: string, receiverId: string | undefined, groupNameInvitation: string) => {
    if (senderId && receiverId) {
      await sendRequestToJoinGroup(senderId, senderUsername, receiverId, groupNameInvitation)
        .then(() => {
          alert('Request sent successfully');
        })
    }
  };

  return (
    <div className="group-page-container">
      <Card className="group-card">
        <Card.Body>
          <Card.Header>Joined groups</Card.Header>
          {groupData.map(group => (
            group.members[userData!.uid] &&
            <div key={group.groupId}>
              <h5>{group.name}</h5>
              <p>Members: {Object.keys(group.members).length}</p>
              <p>Creator: {group.creator.username}</p>
              {group.creator.id === userData?.uid && <Button variant="danger" onClick={handleOpenDeleteModal}>Delete</Button>}
              {group.creator.id === userData?.uid && <Button variant="primary" onClick={() => handleShowInviteModal(group.name)}>Invite members</Button>}
              <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Delete Group</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Are you sure you want to delete this group?</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Close</Button>
                  <Button variant="danger" onClick={() => handleDeleteGroup(group.groupId, userData!)}>Delete</Button>
                </Modal.Footer>
              </Modal>
            </div>
          ))}
        </Card.Body>
      </Card>
      <Card className="group-card">
        <Card.Body>
          <Card.Header>All groups</Card.Header>
          {allGroups.map(group => (
            !group.members[userData!.uid] &&
            <div key={group.groupId}>
              <h5>{group.name}</h5>
              <p>Members: {Object.keys(group.members).length}</p>
              <p>Creator: {group.creator.username}</p>
              <Button variant="primary" onClick={() => handleRequestToJoinGroup(userData!.uid, userData!.username, group.creator.id, group.name)}>Ask to join</Button>
            </div>
          ))}
        </Card.Body>
      </Card>
      <Button variant="primary" onClick={handleOpenModal}>Create Group</Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Group name: <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} /></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => handleCreateNewGroup(groupName, userData!)}>Create</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Members</Modal.Title>
        </Modal.Header>
        {users.map(user => (
          user.uid !== userData?.uid &&
          <Modal.Body key={user.uid}>
            <div>
              <p>{user.username}</p>
              <Button variant="primary" onClick={() => handleSendInvitation(userData!.uid, user.uid, inviteToGroup)}>Invite</Button>
            </div>
          </Modal.Body>
        ))}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}