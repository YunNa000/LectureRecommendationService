import React from "react";
import { useParams } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useParams } from 'react-router-dom';
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import Login from "./Login/Login";
import UpdateUserInfo from "./user/UpdateUserInfo";
import UpdateTakenLecture from "./user/UpdateTakenLecture";
import GraduationRequirements from "./user/GraduationRequirements";
import ChatBot from "./chatBot/ChatBot";
import CallLectureForAdmin from "./admin/CallLectureForAdmin";
import LectureManage from "./LectureManage/LectureManage";

import FriendRequest from "./Friend/FriendRequest";
import UserList from "./Friend/UserList";
import FriendList from "./Friend/FriendList";

import TopBar from "./CommonPart/TopBar";
import TopBarBack from "./CommonPart/TopBarBack";

import LectureDetail from "./CommonPart/LectureDetail";
import TopBarBackAddFriend from "./CommonPart/TopBarBackAddFriend";
import CrawlingNewLecture from "./admin/CrawlingNewLecture";

function LoginPage() {
  return (
    <div>
      <TopBarBack title="로그인" />
      <Login />
    </div>
  );
}

function MainPage() {
  return (
    <div>
      <TopBar title="앱 이름 " />
      <LectureManage />
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

function UserPage() {
  return (
    <div>
      <TopBarBack title="마이페이지" />
      <UpdateUserInfo />
      <UpdateTakenLecture />
      <GraduationRequirements />
    </div>
  );
}

function ChatBotPage() {
  return (
    <div>
      <TopBarBack title="챗봇" />
      <ChatBot />
    </div>
  );
}

function AdminPage() {
  return (
    <div>
      <CallLectureForAdmin />
      <CrawlingNewLecture />
    </div>
  );
}

function LectureDetailPage() {
  const { year, semester, lectureNumber } = useParams();
  return (
    <div>
      <TopBarBack title="강의세부사항" />
      <LectureDetail
        year={year}
        semester={semester}
        lectureNumber={lectureNumber}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <div className="center">
        <div className="background">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mypage" element={<UserPage />} />
            <Route path="/social" element={<SocialFeatures />} />
            <Route path="/users" element={<SocialFeatures2 />} />
            <Route path="/chat" element={<ChatBotPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/lecture/:year/:semester/:lectureNumber" element={<LectureDetailPage />} />
            <Route path="/lecture/:lectureNumber" element={<LectureDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
