import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [userName, setUserName] = useState(null);

  useEffect(() => {
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

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return (
    <div>
      {userName ? (
        <p>Hello!, {userName}</p>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
