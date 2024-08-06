// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Login from "./Login";
// import reportWebVitals from "./reportWebVitals";
// import UpdateUserInfo from "./User/updateUserInfo";
// import LectureManagement from "./Lecture/LectureManagement";
// import Chat from "./chatbot";
// import GetListedLectureData from "./ListedLecture/GetListedLectureData";
// import UserList from "./Friend/UserList";
// import FriendList from "./Friend/FriendList";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <Login />
//     <UpdateUserInfo />
//     <LectureManagement />
//     <Chat />
//     <GetListedLectureData />
//     <UserList />
//     <FriendList />
//   </React.StrictMode>
// );

// reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

// 기존 컴포넌트들을 import
import Login from "./Login";
import UpdateUserInfo from "./User/updateUserInfo";
import LectureManagement from "./Lecture/LectureManagement";
import Chat from "./chatbot";
import GetListedLectureData from "./ListedLecture/GetListedLectureData";
import UserList from "./Friend/UserList";
import FriendList from "./Friend/FriendList";

// UserManagement 컴포넌트
function UserManagement() {
  return (
    <div>
      <h1>사용자 관리</h1>
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
      <UpdateUserInfo />
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
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
