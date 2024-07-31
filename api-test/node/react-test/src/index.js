import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import LectureRequestForm from "./trash-bin/req";
import UpdateUserInfo from "./updateUserInfo";
import LectureSelection from "./trash-bin/req2";
import LectureManagement from "./Lecture/LectureManagement";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    {/* <LectureRequestForm /> */}
    <UpdateUserInfo />
    {/* <LectureManagement /> */}
  </React.StrictMode>
);

reportWebVitals();
