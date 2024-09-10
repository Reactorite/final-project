import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { UserDataType } from '../../../types/UserDataType';
import { AppContext } from '../../../state/app.context';
import { updateUserProfile } from '../../../services/users.service';
import { onValue, ref } from 'firebase/database';
import { storage } from '../../../config/firebase-config';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db } from '../../../config/firebase-config';
import getRanking from '../../../utils/ranking/ranking';
import './User.css'; 

const User: React.FC = () => {
  const { user, userData: realUserData, setAppState } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [points, setPoints] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); 
    }
  }, [file]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async () => {
    if (userData) {
      let profilePictureURL = userData.photo;

      if (file) {
        setUploading(true);
        const imageRef = storageRef(storage, `profile-pictures/${userData.username}`);
        await uploadBytes(imageRef, file);
        profilePictureURL = await getDownloadURL(imageRef);
        setUploading(false);
      }

      await updateUserProfile({
        ...userData,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photo: profilePictureURL,
      });

      setAppState((prevState) => ({ 
        ...prevState, 
        userData: { ...userData, photo: profilePictureURL }
      }));
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFile(null);
    setPreview(null);
  };

  if (!userData) return <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;

  return (
    <Container className="user-container mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="profile-card">
            <Card.Body>
              <Card.Title className="profile-card-title">{userData.firstName} {userData.lastName}</Card.Title>
              <Card.Text>
                <div className="profile-picture-container">
                  {userData.photo ? (
                    <a href={userData.photo} target="_blank" rel="noopener noreferrer">
                      <img className="profile-picture" src={userData.photo} alt={`${userData.username}'s profile`} />
                    </a>
                  ) : (
                    <p>No profile picture available</p>
                  )}
                </div>
                <div className="user-information">
                  <p><strong>Username:</strong> {userData.username}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Phone:</strong> {userData.phoneNumber}</p>
                  <p><strong>Address:</strong> {userData.address}</p>
                  <p><strong>Role:</strong> {userData.isTeacher ? 'Educator' : 'Student'}</p>
                  <p><strong>Rank:</strong> {getRanking(points)}</p>
                  <p><strong>Global Points:</strong> {points}</p>
                </div>
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
                  <Form.Group controlId="formProfilePicture">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {preview && (
                      <div className="file-preview-container">
                        <img className="file-preview" src={preview} alt="Preview" />
                      </div>
                    )}
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleProfileUpdate}
                    className="mr-2"
                    style={{ marginTop: '10px' }}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
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
}

export default User;
