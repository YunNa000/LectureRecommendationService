import React from "react";
import { Link, useNavigate } from "react-router-dom";

const TopBarBackAddFriend = ({ title = "챗봇" }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // 브라우저 히스토리에서 뒤로 이동
  };

  return (
    <div>
      <div className="topbar-container">
        <button
          onClick={handleBackClick}
          className="goback"
          aria-label="Go Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1>{title}</h1>
        <Link to="/users" aria-label="Go to Chat">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 26 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <line x1="22" y1="4" x2="22" y2="10"></line>
            <line x1="25" y1="7" x2="19" y2="7"></line>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default TopBarBackAddFriend;
