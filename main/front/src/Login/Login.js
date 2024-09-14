import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./Login.css";

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
      setError(err);
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
    <div className="login-box">
      {user ? (
        <div className="logged-in">
          <p className="logout-text">
            아래 버튼을 통해 로그아웃을 할 수 있어요
          </p>
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <div className="logged-out">
          <p className="login-text">맞춤형 추천을 위해선 로그인이 필요해요.</p>
          <p className="login-text-detail">
            사용자 식별을 위해 구글에서 제공하는 난수 외에 어떠한 값도 요구하지
            않아요.
          </p>
          <p className="login-text-detail">
            서비스마다 구글에서 제공하는 난수가 달라지기에 해당 난수로 사용자를
            유추하는 것 또한 불가능해요.
          </p>
          <button className="login-button" onClick={handleLogin}>
            구글로 로그인
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;
