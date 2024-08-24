import React, { useEffect, useRef, useState } from "react";
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
  const searchRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        handleCloseSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCloseSearch]);

  return (
    <div ref={searchRef}>
      <h4 style={{ position: "sticky", top: "0", background: "white", zIndex: 1, borderBottom: "1px solid #0D6EFD" }}>Search Results 
        {<button
        onClick={handleCloseSearch}
        style={{
          position: "absolute",
          right: "10px",
          top: "-18px",
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