import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import chatbotImage from "./chatbot.png";
import { Send } from "lucide-react";
import "./ChatBot.css";

const ChatBot = () => {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);

  useEffect(() => {
    checkLoginStatus();
    fetchAvailableThemes();
  }, []);

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
          console.log("User logged in:", data.user_id);
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.error("ChatBot.js - checkLogin", err);
    }
  };

  const fetchAvailableThemes = async () => {
    try {
      const response = await fetch("http://localhost:8000/themes/");
      const data = await response.json();
      setAvailableThemes(data.themes);
    } catch (err) {
      console.error("Error fetching available themes:", err);
    }
  };

  const formatText = (text) => {
    if (typeof text !== "string") return "";
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const getThemeContent = (theme) => {
    switch (theme) {
      case "수강신청":
        return `<수강신청>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

• 수강신청 편성 
• 학점범위 
• 일정 
• 유의사항
• 재수강제도 
• 수강인원 제한기준 및 폐강기준
• 절대평가기준 
• p/np 평가 교과목 
• 수강신청방법

어떤 점이 궁금하세요?`;

      case "졸업요건":
        return `<졸업요건>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

• 입학년도 
• 편입생 여부
• 공학인증학과 
• 다전공 여부

어떤 점이 궁금하세요?`;
      case "기타학사정보":
        return `<기타학사정보>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

• 교양필수교과목 
• 공학인증제도 
• 다전공안내
• 다학년다학기프로젝트 
• 현장실습학기제
• 참빛설계학기 
• 서비스러닝 
• 매치업 
• KMOOC
• 편입생 관련 
• 학석사연계과정 
• 특별교육과정

어떤 점이 궁금하세요?`;
      case "교내전화번호안내":
        return `<교내전화번호안내>에서는 아래와 같이 적어주시면 알맞은 전화번호를 안내해드리도록 하겠습니다.

        • 예) 정보융합학부(정융) 과사무실 전화번호
        
        어떤 점이 궁금하세요?`;
      default:
        return "";
    }
  };

  const handleThemeSelection = async (theme) => {
    setSelectedTheme(theme);
    try {
      const response = await fetch("http://localhost:8000/selecttheme/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: theme }),
      });
      const data = await response.json();
      console.log(data.message);
      const themeContent = getThemeContent(theme);
      setChatLog([{ type: "system", text: themeContent }]);
    } catch (err) {
      console.error("Error selecting theme:", err);
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    if (inputText.toLowerCase() === "/홈") {
      setChatLog([]);
      setInputText("");
      setSelectedTheme(null);

      return;
    }

    setChatLog([...chatLog, { type: "user", text: inputText }]);

    try {
      const response = await fetch("http://localhost:8000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: selectedTheme, question: inputText }),
      });
      const data = await response.json();
      setChatLog((prevLog) => [
        ...prevLog,
        { type: "system", text: data.answer },
      ]);
    } catch (err) {
      console.error("Error asking question:", err);
      setChatLog((prevLog) => [
        ...prevLog,
        { type: "system", text: "죄송합니다. 오류가 발생했습니다." },
      ]);
    }

    setInputText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header"></div>
      <div className="chatbot-content">
        <div className="intro-section">
          <img
            src={chatbotImage}
            alt="Chatbot"
            className="chatbot-avatar-small"
          />
          <div className="intro-message">
            <p>
              수강신청자료집에 대한 모든 것을 알고 있어요😏
              <br />
              궁금한 테마를 선택해주세요.
            </p>
          </div>
        </div>
        <div className="theme-selection">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeSelection(theme)}
              className={`theme-button ${
                selectedTheme === theme ? "selected" : ""
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
        <div className="chat-log">
          {chatLog.map((entry, index) => (
            <div key={index} className={`chat-message ${entry.type}`}>
              {entry.type === "system" && (
                <img
                  src={chatbotImage}
                  alt="Chatbot"
                  className="chatbot-avatar-small"
                />
              )}
              <div className="message-content">{formatText(entry.text)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메세지를 입력해주세요..."
          className="message-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
