import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";
import LectureRequestForm from "./req";
import UpdateUserInfo from "./updateUserInfo";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    <LectureRequestForm />
    <UpdateUserInfo />
  </React.StrictMode>
);

reportWebVitals();
