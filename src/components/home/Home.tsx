import React, { useEffect, useState } from "react";
import { UserDataType } from "../../types/UserDataType";
import { Card, Dropdown } from "react-bootstrap";
import getRanking from "../../utils/ranking/ranking";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/firebase-config";
import "./Home.css";
import Search from "../search/Search";

export default function Home() {
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const response: Record<string, UserDataType> | null = snapshot.val();
      if (response) {
        const students = Object.values(response)
          .filter((user): user is UserDataType => user.isStudent === true)
          .sort((a, b) => b.globalPoints - a.globalPoints);
        setUsers(students);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSearchClick = () => {
    setShowSearchResults(true);
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
  };

  return (
    <div className="top-15-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "20vw" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              id="search"
              className="form-control"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", paddingRight: "40px", borderColor: "#0D6EFD" }}
            />
            <button
              className="search-button"
              onClick={handleSearchClick}
              style={{
                position: "absolute",
                right: "5px",
                top: "45%",
                transform: "translateY(-50%)",
                border: "none",
                background: "none",
                cursor: "pointer"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0D6EFD" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </button>
            {showSearchResults && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", zIndex: 1, border: "1px solid #0D6EFD", borderTop: "none", overflowY: "scroll", maxHeight: "30vh" }}>
                <Search
                  searchQuery={searchQuery}
                  searchCategory={searchCategory}
                  handleCloseSearch={handleCloseSearch}
                />
              </div>
            )}
          </div>
        </div>
        <Dropdown id="dropdown-basic" style={{ marginLeft: "10px" }}>
          <Dropdown.Toggle variant="primary" id="dropdown-basic-toggle">
            {searchCategory ? searchCategory : 'Search for'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSearchCategory('Users')}>Users</Dropdown.Item>
            <Dropdown.Item onClick={() => setSearchCategory('Groups')}>Groups</Dropdown.Item>
            <Dropdown.Item onClick={() => setSearchCategory('iQuizzes')}>iQuizzes</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="container mt-4">
      <div className="row" style={{ display: "flex" }}>
      <div className="col-md-4 d-flex">
      <Card
        className="card flex-fill custom-scrollbar"
        style={{
          maxHeight: "80vh",
          maxWidth: "30vw",
          overflowY: "scroll",
          minHeight: "80vh",
        }}
      >
        <h3 className="text-center sticky-header">Top 15</h3>
        <div className="card-body">
          {users.slice(0, 14).map((user, index) => (
            <Card key={index} className="mb-2">
              <Card.Body>
                <Card.Title>{user.username}</Card.Title>
                <Card.Text>Total points: {user.globalPoints}</Card.Text>
                <Card.Text>{getRanking(user.globalPoints)}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card>
      </div>
      </div>
      </div>
    </div>
  );
}