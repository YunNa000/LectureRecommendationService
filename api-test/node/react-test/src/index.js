import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import UpdateUserInfo from "./User/updateUserInfo";
import LectureManagement from "./Lecture/LectureManagement";
import Chat from "./chatbot";
import GetListedLectureData from "./ListedLecture/GetListedLectureData";
import CreditList from "./MyPage/creditList";
import UserInfo from "./MyPage/userInfo";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    {/* <UpdateUserInfo />
    <LectureManagement />
    <Chat />
    <GetListedLectureData />  */}
    <CreditList />
    <UserInfo />
  </React.StrictMode>
);

reportWebVitals();
