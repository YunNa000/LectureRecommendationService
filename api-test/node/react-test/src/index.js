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
import TopBar from "./CommonPart/TopBar";
import TopBarBack from "./CommonPart/TopBarBack";
import LectureDetails from "./CommonPart/LectureDetail";



// LectureView 컴포넌트
function BasicView() {
  return (
    <div>
      <TopBar title="강의 관리 및 조회" />
      <Login />
      <LectureManagement />
      <GetListedLectureData />
    </div>
  );
}

// UserManagement 컴포넌트
function UserManagement() {
  return (
    <div>
      <TopBar title="My Page" />
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
      <TopBarBack title="챗봇" />
      <Chat />
    </div>
  );
}


// SocialFeatures 컴포넌트
function SocialFeatures() {
  return (
    <div>
      <TopBarBack title="친구" />
      <UserList />
      <FriendList />
    </div>
  );
}


function Sebu() {
  return (
    <div>
      <TopBarBack title="강의세부사항" />
      <LectureDetails />
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
        <Route path="/sebu" element={<Sebu />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
