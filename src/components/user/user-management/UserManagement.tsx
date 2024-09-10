import React, { useState, useEffect, useContext } from 'react';
import { Card, ListGroup, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import { AppContext } from '../../../state/app.context';
import { blockUser, unblockUser, getAllUsers, makeAdmin, removeAdmin } from '../../../services/users.service';
import { UserDataType } from '../../../types/UserDataType';
import './UserManagement.css'

const UserManagement: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userData?.isAdmin || userData?.isOwner) {
      fetchUsers();
    }
  }, [userData]);

  const fetchUsers = async () => {
    const allUsers = await getAllUsers();
    const filteredUsers = allUsers.filter(user => 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setUsers(filteredUsers);
  };

  const handleBlockUser = async (username: string) => {
    await blockUser(username);
    fetchUsers();
  };

  const handleUnblockUser = async (username: string) => {
    await unblockUser(username);
    fetchUsers();
  };

  const handleMakeAdmin = async (username: string) => {
    await makeAdmin(username);
    fetchUsers();
  };

  const handleRemoveAdmin = async (username: string) => {
    await removeAdmin(username);
    fetchUsers();
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>User Management</Card.Title>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search by username, first name, last name, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={fetchUsers}>Search</Button>
        </InputGroup>
        <ListGroup>
  {users.map((user) => (
    <ListGroup.Item key={user.uid}>
      <div className="col">{user.username} ({user.firstName} {user.lastName})</div>
      <div className="col col-email">{user.email}</div>
      <div className="col">
        <Button
          variant={user.isBlocked ? 'success' : 'danger'}
          onClick={() => user.isBlocked ? handleUnblockUser(user.username) : handleBlockUser(user.username)}
        >
          {user.isBlocked ? 'Unblock' : 'Block'}
        </Button>
      </div>
      <div className="col">
        {userData?.isOwner && (
          <Button
            variant={user.isAdmin ? 'secondary' : 'primary'}
            onClick={() => user.isAdmin ? handleRemoveAdmin(user.username) : handleMakeAdmin(user.username)}
          >
            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
          </Button>
        )}
      </div>
    </ListGroup.Item>
  ))}
</ListGroup>

      </Card.Body>
    </Card>
  );
};

export default UserManagement;
