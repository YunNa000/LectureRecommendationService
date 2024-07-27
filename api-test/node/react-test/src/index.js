import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import LectureRequestForm from "./req";
import UpdateUserInfo from "./updateUserInfo";
import LectureSelection from "./req2";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    {/* <LectureRequestForm /> */}
    <UpdateUserInfo />
    <LectureSelection />
  </React.StrictMode>
);

reportWebVitals();
