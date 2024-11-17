import React from "react";
import { Link } from "react-router-dom";
const TopBar = ({ title = "강의 시간표" }) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      backgroundColor: "white",
    },
    topSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "4px 16px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: "18px",
      fontWeight: "500",
      marginBottom: "16px",
    },
    buttonContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "16px",
    },
    button: {
      padding: "8px 16px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
    },
    errorText: {
      color: "red",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        <Link to="/social" style={styles.iconLink} aria-label="Go to Social">
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </Link>
        <h1 style={styles.title}>{title}</h1>
        <Link to="/chat" style={styles.iconLink} aria-label="Go to Chat">
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
