import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, useParams  } from "react-router-dom";
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
import FriendRequest from "./Friend/FriendRequest";
import TopBarBackAddFriend from "./CommonPart/TopBarBackAddFriend";




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
      <TopBarBack title="My Page" />
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
      <TopBarBackAddFriend title="친구" />
      <FriendList />
      <FriendRequest />
    </div>
  );
}


// SocialFeatures 컴포넌트
function SocialFeatures2() {
  return (
    <div>
      <TopBarBack title="유저 검색" />
      <UserList />
    </div>
  );
}

function Sebu() {
  const { lectureNumber } = useParams();
  return (
    <div>
      <TopBarBack title="강의세부사항" />
      <LectureDetails lectureNumber={lectureNumber} />
    </div>
  );
}

function Test() {
  const { lectureNumber } = useParams();
  return (
    <div>
      <TopBarBack title="강의세부사항" />
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
        <Route path="/users" element={<SocialFeatures2 />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/Lecture" element={<Sebu/>} />
        <Route path="/lecture/:lectureNumber" element={<Sebu />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
