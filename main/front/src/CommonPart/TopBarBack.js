import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopBarBack = ({ title = "챗봇" }) => {
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: 'white',

    },
    topSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 16px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold'
    },
    subtitle: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '16px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer'
    },
    errorText: {
      color: 'red'
    },
    iconLink: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'inherit',
        textDecoration: 'none'
      }
  };

  const handleBackClick = () => {
    navigate(-1); // 브라우저 히스토리에서 뒤로 이동
  };

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        <button onClick={handleBackClick} style={styles.iconLink} aria-label="Go Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={styles.title}>{title}</h1>
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default TopBarBack;