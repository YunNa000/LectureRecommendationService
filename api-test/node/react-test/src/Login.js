import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get("http://localhost:8000/", {
          withCredentials: true,
        });
        console.log("========", response.data);
        console.log("========data.message", response.data.message);
        if (response.data.message.includes("Hello")) {
          setUserName(response.data.message.split(", ")[1]);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
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
        <p>hello!, {userName}</p>
      ) : (
        <div>
          <button onClick={handleLogin}>login</button>
        </div>
      )}
    </div>
  );
};

export default App;
