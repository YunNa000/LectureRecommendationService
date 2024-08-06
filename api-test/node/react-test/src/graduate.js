import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GradesCredit = ({ userId }) => {
  const [grades, setGrades] = useState({
    total: 0,  // 전체학점
    major: 0,  // 전공학점
    general: 0,  // 교양학점
    other: 0,  // 기타학점
  });

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/gradesCredit", {
        withCredentials: true,
      });
      const userData = response.data;
      console.log(response.data);
      console.log("hello!");

      setGrades({
        total: userData.total,
        major: userData.major,
        general: userData.general,
        other: userData.other,
      });
    } catch (error) {
      console.error("errr fetching user data", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]); // userId가 변경될 때마다 fetchUserData를 호출합니다.

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grade Overview</h1>
        <p>Total GPA: {grades.total}</p>
        <p>Major GPA: {grades.major}</p>
        <p>General GPA: {grades.general}</p>
        <p>Other GPA: {grades.other}</p>
      </header>
    </div>
  );
}

export default GradesCredit;
