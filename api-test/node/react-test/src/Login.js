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

  return (
    <div>
      {userName ? (
        <p>hello, {userName}!</p>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
