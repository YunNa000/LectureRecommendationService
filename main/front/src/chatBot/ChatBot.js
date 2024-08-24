import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import TopBarBack from '../CommonPart/TopBarBack';
import "./ChatBot.css";

function ChatBot() {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [user, setUser] = useState(null);

  const themes = ["수강신청", "재수강", "졸업"];
  // 강의계획서와 에브리타임 강의평 
  // -> 애초에 메인페이지 강의선택할때 다 볼 수 있기 때문에 
  // 따라서, 수강신청 자료집에서만 테마를 나누어서 진행


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
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("CallLecture.js - checkLogin");
      console.error(err);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
    setChatLog([...chatLog, { type: "system", text: `'${theme}'을 선택하셨군요! 어떤 점이 궁금하세요?` }]);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;
    
    if (inputText.toLowerCase() === '/홈') {
      setSelectedTheme("");
      setChatLog([]);
      setInputText("");
      return;
    }

    setChatLog([...chatLog, { type: "user", text: inputText }]);
    // Here you would typically send the message to your backend and get a response
    // For now, we'll just echo the message
    setChatLog(prevLog => [...prevLog, { type: "system", text: `You said: ${inputText}` }]);
    setInputText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <TopBarBack />
      <div className="intro-message">
        수강신청자료집과 강의계획서, 에브리타임 강의평 등을 알고 있어요😏
        궁금한 테마를 선택해주세요.
        '/홈' 이라고 입력하시면 아래와 같이 테마를 선택지로 올 수 있습니다.
      </div>
      {!selectedTheme ? (
        <div className="theme-buttons">
          {themes.map((theme) => (
            <button key={theme} onClick={() => handleThemeSelection(theme)}>
              {theme}
            </button>
          ))}
        </div>
      ) : (
        <div className="chat-log">
          {chatLog.map((entry, index) => (
            <div key={index} className={`chat-message ${entry.type}`}>
              {entry.text}
            </div>
          ))}
        </div>
      )}
      <div className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
}

export default ChatBot;