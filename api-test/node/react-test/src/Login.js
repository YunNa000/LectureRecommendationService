import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * 유저 cookie가 서버 db에 있다면 ? 사용자 이름 가져옴. : 로그인 버튼
 * `이러한 방식으로 로그인 요청 보낸다` 정도로만 해석하면 됨.
 *
 * @returns {JSX.Element} - login component
 */
const App = () => {
  /**
   * user name state
   * @type {string|null}
   */
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    /**
     * user name 가져와서 받아와 졌다면 저장, 아니면 err
     * @async
     * @function fetchUserName
     * @returns {Promise<void>}
     */
    const fetchUserName = async () => {
      try {
        const response = await axios.get("http://localhost:8000/user/data", {
          withCredentials: true,
        });
        const users = response.data;
        if (users.length > 0) {
          setUserName(users[0].userName);
          console.log(users);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setUserName(null);
        } else {
          console.error("err while fetching user name:", error);
        }
      }
    };

    fetchUserName();
  }, []);

  /**
   * 로그인 버튼 클릭 시 server/login으로 리다이렉트
   * @function handleLogin
   */
  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  /**
   * 로그아웃 버튼 클릭 시 /logout으로 요청보내고 메인 페이지로 리다이렉트
   * @function handleLogout
   */
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/logout",
        {},
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setUserName(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("err while logging out:", error);
    }
  };

  /**
   * 회원 탈퇴 버튼 클릭 시 /delete_account으로 요청보내고 메인 페이지로 리다이렉트
   * @function handleDeleteAccount
   */
  const handleDeleteAccount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/delete_account",
        {},
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setUserName(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("err while deleting account:", error);
    }
  };

  return (
    <div>
      {userName ? (
        <div>
          <p>hello, {userName}!</p>
          <button onClick={handleLogout}>로그아웃</button>
          {/* <button onClick={handleDeleteAccount}>탈퇴</button> */}
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>로그인</button>
        </div>
      )}
    </div>
  );
};

export default App;
