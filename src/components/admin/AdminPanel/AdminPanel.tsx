import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, InputGroup, Form } from 'react-bootstrap';
import { AppContext } from '../../../state/app.context';
import { blockUser, unblockUser, getAllUsers } from '../../../services/users.service';
import { UserDataType } from '../../../types/UserDataType';

const AdminPanel: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userData?.isAdmin) {
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

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
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
                    <Row>
                      <Col>{user.username} ({user.firstName} {user.lastName})</Col>
                      <Col>Email: {user.email}</Col>
                      <Col>
                        <Button
                          variant={user.isBlocked ? 'success' : 'danger'}
                          onClick={() => user.isBlocked ? handleUnblockUser(user.username) : handleBlockUser(user.username)}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
