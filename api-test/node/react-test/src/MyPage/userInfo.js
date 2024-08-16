import React, { useState, useEffect } from "react";
import axios from "axios";

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    major: "",
    hakbun: "",
    multiplemajor: "",
  });

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/userInfo", {
        withCredentials: true,
      });
      const userData = response.data;

      setUserInfo({
        name: userData.name,
        major: userData.major,
        hakbun: userData.hakbun,
        multiplemajor: userData.multiplemajor,
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
        <h1>사용자 정보</h1>
        <p>이름: {userInfo.name || "정보 없음"}</p>
        <p>전공: {userInfo.major || "정보 없음"}</p>
        <p>학번: {userInfo.hakbun || "정보 없음"}</p>
        <p>다전공: {userInfo.multiplemajor || "정보 없음"}</p>
      </header>
    </div>
  );
};

export default UserInfo;
