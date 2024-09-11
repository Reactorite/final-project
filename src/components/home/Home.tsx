import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './Home.css';

const Home: React.FC = () => {
  return (
    <Container className="home-page-container">
      <h1 className="page-title">Welcome to IQuiz</h1>
      <p className="site-description">
        Explore the features and sections of our platform below to get started and make the most of your experience.
      </p>
      <Row className="cards-row">
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">👑</div>
              <Card.Title className="feature-title">Admin Panel</Card.Title>
              <Card.Text>
                Access administrative tools and manage platform settings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">🏠</div>
              <Card.Title className="feature-title">Home</Card.Title>
              <Card.Text>
                Navigate back to the main page of our platform.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">👤</div>
              <Card.Title className="feature-title">Profile</Card.Title>
              <Card.Text>
                View and edit your personal profile information.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">⚔️</div>
              <Card.Title className="feature-title">Battle Arena</Card.Title>
              <Card.Text>
                Engage in battles and challenges with other users.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">🔓</div>
              <Card.Title className="feature-title">Login</Card.Title>
              <Card.Text>
                Sign in to access your account and personalized features.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">✏️</div>
              <Card.Title className="feature-title">Create Quiz</Card.Title>
              <Card.Text>
                Create and manage quizzes for yourself or your students.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">💌</div>
              <Card.Title className="feature-title">Messages</Card.Title>
              <Card.Text>
                Check and manage your messages and notifications.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">🔔</div>
              <Card.Title className="feature-title">Notifications</Card.Title>
              <Card.Text>
                View your notifications and alerts from the platform.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4">
          <Card className="feature-card text-center">
            <Card.Body>
              <div className="feature-icon">🚪</div>
              <Card.Title className="feature-title">Logout</Card.Title>
              <Card.Text>
                Sign out of your account and return to the login page.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
