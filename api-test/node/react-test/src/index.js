import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import UpdateUserInfo from "./updateUserInfo";
import LectureManagement from "./Lecture/LectureManagement";
import Chat from "./chatbot";
import GetListedLectureData from "./GetListedLectureData";
import UserList from "./Friend/UserList";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    <UpdateUserInfo />
    <LectureManagement />
    <Chat />
    <GetListedLectureData />
    <UserList />
  </React.StrictMode>
);

reportWebVitals();
