import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import QuizManagement from '../../user/user-management/QuizManagement';
import UserManagement from '../../user/user-management/UserManagement';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'user' | 'quiz'>('user');

  return (
    <Container className="mt-4">
      <Row>
        <Col md={3}>
          <div className="d-grid gap-2">
            <Button
              variant={activeSection === 'user' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveSection('user')}
            >
              User Management
            </Button>
            <Button
              variant={activeSection === 'quiz' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveSection('quiz')}
            >
              Quiz Management
            </Button>
          </div>
        </Col>
        <Col md={9}>
          {activeSection === 'user' && <UserManagement />}
          {activeSection === 'quiz' && <QuizManagement />}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
