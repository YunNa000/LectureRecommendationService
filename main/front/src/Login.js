import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch("http://localhost:8000/", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.user_id) {
          setUser(data.user_id);
        }
      } else {
        console.log("로그인 해주세요.");
        // window.location.href = "http://127.0.0.1:3000/login";
        // 로그인 페이지가 아닌, 다른 페이지에서는 이 주석 해제
      }
    } catch (err) {
      console.log("Login.js - checkLoginStatus");
      console.error(err);
    }
  };

  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/login";
  };

  const handleLogout = async () => {
    setUser(null);
    window.location.href = "http://127.0.0.1:3000/";
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>log in</button>
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;
