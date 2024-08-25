import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { UserDataType } from '../../../types/UserDataType';
import { AppContext } from '../../../state/app.context';
import { updateUserProfile } from '../../../services/users.service';
import { onValue, ref } from 'firebase/database';
import { db } from '../../../config/firebase-config';
import getRanking from '../../../utils/ranking/ranking';

const User: React.FC = () => {
  const { user, userData: realUserData, setAppState } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (userData) {
      const pointsRef = ref(db, `users/${userData.username}/globalPoints`);
      const unsubscribe = onValue(pointsRef, (snapshot) => {
        const currPoints = snapshot.val();
        if (currPoints !== null && currPoints !== undefined) {
          setPoints(currPoints);
        }
      }, (error) => {
        console.error('Error fetching points:', error);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  useEffect(() => {
    if (realUserData) {
      setUserData({
        ...realUserData
      });
    }
  }, [user, realUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (userData) {
      await updateUserProfile(userData);
      setEditing(false);
      setAppState((prevState) => ({ ...prevState, userData }));
    }
  };

  if (!userData) return <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>{userData.firstName} {userData.lastName}</Card.Title>
              <Card.Text>
                <strong>Username:</strong> {userData.username} <br />
                <strong>Email:</strong> {userData.email} <br />
                <strong>Phone:</strong> {userData.phoneNumber} <br />
                <strong>Address:</strong> {userData.address} <br />
                <strong>Role:</strong> {userData.isTeacher ? 'Educator' : 'Student'} <br />
                <strong>Rank:</strong> {getRanking(points)} <br />
                <strong>Global Points:</strong> {points}
              </Card.Text>

              {editing ? (
                <Form>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPhoneNumber">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={userData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="formAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleProfileUpdate}
                    className="mr-2"
                    style={{ marginTop: '10px' }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                    style={{ marginTop: '10px', marginLeft: '5px' }}
                  >
                    Cancel
                  </Button>
                </Form>
              ) : (
                <Button variant="primary" onClick={() => setEditing(true)} className="mr-2">
                  Edit Profile
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default User;
