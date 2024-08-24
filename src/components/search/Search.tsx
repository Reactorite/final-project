import React, { useEffect, useRef, useState } from "react";
import { UserDataType } from "../../types/UserDataType";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/firebase-config";
import QuizDataType from "../../types/QuizDataType";

interface SearchProps {
  searchQuery: string;
  searchCategory: string;
  handleCloseSearch: () => void;
}

const Search: React.FC<SearchProps> = ({ searchQuery, searchCategory, handleCloseSearch }) => {
  const [results, setResults] = useState<(UserDataType | QuizDataType)[]>([]);
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
    } else if (searchCategory === "iQuizzes") {
      const quizesRef = ref(db, "quizzes");
      onValue(quizesRef, (snapshot) => {
        const response: Record<string, QuizDataType> | null = snapshot.val();
        if (response) {
          const filteredResults = Object.values(response).filter((quiz) =>
            quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setResults(filteredResults);
        }
      })
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

  const isUserDataType = (item: UserDataType | QuizDataType): item is UserDataType => {
    return ((item as UserDataType).username !== undefined);
  };

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
        </button>}
      </h4>
      {results.length > 0 ? (
        results.map((item, index) => (
          isUserDataType(item) ? (
            <div key={index}>
              <p>Username: {item.username}</p>
              <p>Global Points: {item.globalPoints}</p>
            </div>
          ) : (
            <div key={index}>
              <p>Title: {item.title}</p>
              <p>Category: {item.category}</p>
            </div>
          )
        ))
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default Search;