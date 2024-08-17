import React, { useState, useEffect } from "react";
import axios from "axios";

const CreditList = () => {
  const [grades, setGrades] = useState({
    total: 0, // 전체학점
    major: 0, // 전공학점
    general: 0, // 교양학점
    other: 0, // 기타학점
    totalGPA: 0, // 전체 GPA
    junGPA: 0, // 전공 GPA
  });

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/creditList", {
        withCredentials: true,
      });
      const userData = response.data;

      console.log("creditList.js", response.data);

      setGrades({
        total: userData.total,
        major: userData.major,
        general: userData.general,
        other: userData.other,
        totalGPA: userData.totalGPA,
        junGPA: userData.junGPA,
      });
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>MyPage_학점</h1>
        <p>전체학점: {grades.total}</p>
        <p>전공학점: {grades.major}</p>
        <p>교양학점: {grades.general}</p>
        <p>기타학점: {grades.other}</p>
        <p>전체 GPA: {grades.totalGPA}</p>
        <p>전공 GPA: {grades.junGPA}</p>
      </header>
    </div>
  );
};

export default CreditList;
