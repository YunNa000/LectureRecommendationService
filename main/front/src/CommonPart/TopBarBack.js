import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const TopBarBack = ({ title = "챗봇" }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // 브라우저 히스토리에서 뒤로 이동
  };

  return (
    <div>
      <div className="topbar-container">
        <button
          onClick={handleBackClick}
          aria-label="Go Back"
          className="goback"
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
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default TopBarBack;
