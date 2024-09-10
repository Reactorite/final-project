import React, { useContext, useEffect, useState } from "react";
import './Group.css';
import { Button, Card, Modal } from 'react-bootstrap';
import { AppContext } from "../../state/app.context";
import { createGroup, deleteGroup, fetchGroups } from "../../services/groups.service";
import GroupDataType from "../../types/GroupDataType";

interface UserData {
  uid: string | undefined;
  username: string;
}

export default function Group() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupData, setGroupData] = useState<GroupDataType[]>([]);
  const { userData } = useContext(AppContext);

  useEffect(() => {
    if (userData) {
      getGr();
    }
  }, [userData]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
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
  }

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
    </div>
  )
}