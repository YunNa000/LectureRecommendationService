import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

import Login from "./Login";
import CallLecture from "./lecture/CallLecture";
import UpdateUserInfo from "./user/UpdateUserInfo";
import UpdateTakenLecture from "./user/UpdateTakenLecture";
import ListedLecture from "./listedLecture/ListedLecture";
import GraduationRequirements from "./user/GraduationRequirements";
import ChatBot from "./chatBot/ChatBot";
import CallLectureForAdmin from "./admin/CallLectureForAdmin";

function LoginPage() {
  return (
    <div>
      <Login />
    </div>
  );
}

function MainPage() {
  return (
    <div>
      <CallLecture />
      <ListedLecture />
    </div>
  );
}

function UserPage() {
  return (
    <div>
      <UpdateUserInfo />
      <UpdateTakenLecture />
      <GraduationRequirements />
    </div>
  );
}

function ChatBotPage() {
  return (
    <div>
      <ChatBot />
    </div>
  );
}

function AdminPage() {
  return (
    <div>
      <CallLectureForAdmin />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<UserPage />} />
        <Route path="/chat" element={<ChatBotPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
