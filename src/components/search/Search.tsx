import React, { useEffect, useState } from "react";
import { UserDataType } from "../../types/UserDataType";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/firebase-config";

interface SearchProps {
  searchQuery: string;
  searchCategory: string;
  handleCloseSearch: () => void;
} 

const Search: React.FC<SearchProps> = ({ searchQuery, searchCategory, handleCloseSearch }) => {
  const [results, setResults] = useState<UserDataType[]>([]);

  useEffect(() => {
    if (searchCategory === "Users") {
      const usersRef = ref(db, "users");
      onValue(usersRef, (snapshot) => {
        const response: Record<string, UserDataType> | null = snapshot.val();
        if (response) {
          const filteredResults = Object.values(response).filter((user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setResults(filteredResults);
        }
      });
    }
  }, [searchQuery, searchCategory]);

  return (
    <div>
      {/* <button
        onClick={handleCloseSearch}
        style={{
          position: "absolute",
          right: "10px",
          top: "-10px",
          // border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "30px",
          color: "#0D6EFD"
        }}
      >
        &times;
      </button> */}
      <h4>Search Results 
        {<button
        onClick={handleCloseSearch}
        style={{
          position: "absolute",
          right: "10px",
          top: "-10px",
          // border: "2px solid #0D6EFD",
          background: "none",
          cursor: "pointer",
          fontSize: "30px",
          color: "#0D6EFD"
        }}
      >
        &times;
      </button>}</h4>
      {results.length > 0 ? (
        results.map((user, index) => (
          <div key={index}>
            <p>Username: {user.username}</p>
            <p>Global Points: {user.globalPoints}</p>
          </div>
        ))
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default Search;