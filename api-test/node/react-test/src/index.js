import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import Login from "./Login";
import UpdateUserInfo from "./User/updateUserInfo";
import LectureManagement from "./Lecture/LectureManagement";
import Chat from "./chatbot";
import GetListedLectureData from "./ListedLecture/GetListedLectureData";
import UserList from "./Friend/UserList";
import FriendList from "./Friend/FriendList";

import CreditList from "./MyPage/creditList";
import UserInfo from "./MyPage/userInfo";

// UserManagement 컴포넌트
function UserManagement() {
  return (
    <div>
      <h1>사용자 관리</h1>
      <CreditList />
      <UserInfo />
      <UpdateUserInfo />
    </div>
  );
}

// chatbot 컴포넌트
function Chatbot() {
  return (
    <div>
      <h1>챗봇</h1>
      <Chat />
    </div>
  );
}

// LectureView 컴포넌트
function BasicView() {
  return (
    <div>
      <h1>강의 관리 및 조회</h1>
      <Login />
      <LectureManagement />
      <GetListedLectureData />
    </div>
  );
}

// SocialFeatures 컴포넌트
function SocialFeatures() {
  return (
    <div>
      <h1>소셜 기능</h1>
      <UserList />
      <FriendList />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<BasicView />} />
        <Route path="/mypage" element={<UserManagement />} />
        <Route path="/social" element={<SocialFeatures />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
