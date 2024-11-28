import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import chatbotImage from "./chatbot.png";
import "./ChatBot.css";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThemesLoading, setIsThemesLoading] = useState(true);
  const [isLoginChecking, setIsLoginChecking] = useState(true);
  const [userData, setUserData] = useState({
    hakBun: "",
    bunBan: "",
    userYear: "",
    userMajor: "",
    username: "",
    isForeign: null,
    isMultipleMajor: null,
    whatMultipleMajor: "없음",
    whatMultipleMajorDepartment: "없음",
  });
  const chatLogRef = useRef(null);

  useEffect(() => {
    checkLoginStatus();
    fetchAvailableThemes();
  }, []);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog, isLoading]);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.user_id) {
          console.log("User logged in:", data.user_id);
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("ChatBot.js - checkLogin", err);
    } finally {
      setIsLoginChecking(false);
    }
  };

  const fetchAvailableThemes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/themes/`);
      const data = await response.json();
      setAvailableThemes(data.themes);
    } catch (err) {
      console.error("Error fetching available themes:", err);
    } finally {
      setIsThemesLoading(false);
    }
  };

  const getThemeContent = (theme) => {
    switch (theme) {
      case "수강신청":
        return `<수강신청>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

- 수강신청 편성 
- 학점범위 
- 일정 
- 유의사항
- 재수강제도 
- 수강인원 제한기준 및 폐강기준
- 절대평가기준 
- p/np 평가 교과목 
- 수강신청방법

어떤 점이 궁금하세요?`;

      case "졸업요건":
        return `<졸업요건>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

- 입학년도 
- 편입생 여부
- 공학인증학과 
- 다전공 여부

어떤 점이 궁금하세요?`;
      case "기타학사정보":
        return `<기타학사정보>에서는 아래의 내용에 대해 도움을 드릴 수 있습니다.

- 교양필수교과목 
- 공학인증제도 
- 다전공안내
- 다학년다학기프로젝트 
- 현장실습학기제
- 참빛설계학기 
- 서비스러닝 
- 매치업 
- KMOOC
- 편입생 관련 
- 학석사연계과정 
- 특별교육과정

어떤 점이 궁금하세요?`;
      case "교내전화번호안내":
        return `<교내전화번호안내>에서는 아래와 같이 적어주시면 알맞은 전화번호를 안내해드리도록 하겠습니다.

- 예) 정보융합학부(정융) 과사무실 전화번호

어떤 점이 궁금하세요?`;
      default:
        return "";
    }
  };

  const handleThemeSelection = async (theme) => {
    setSelectedTheme(theme);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/selecttheme/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme: theme }),
        }
      );
      const data = await response.json();
      console.log(data.message);
      const themeContent = getThemeContent(theme);
      setChatLog([{ type: "system", text: themeContent }]);
    } catch (err) {
      console.error("Error selecting theme:", err);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);

    try {
      console.log(userData);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/chatbot/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            theme: selectedTheme,
            question: inputText,
            user_data: JSON.stringify(userData),
          }),
        }
      );
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
    } finally {
      setIsLoading(false);
    }

    setInputText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log(data.bunBan);

        if (response.ok && data.user_id) {
          if (
            !data.hakBun ||
            !data.bunBan ||
            !data.userYear ||
            !data.userMajor ||
            !data.username ||
            data.isForeign === null ||
            data.isMultipleMajor === null
          ) {
            window.location.href = "/mypage";
          } else {
            console.log("good!");
            console.log(data.hakBun);
            setUserData({
              hakBun: data.hakBun,
              bunBan: data.bunBan,
              userYear: data.userYear,
              userMajor: data.userMajor,
              username: data.username,
              isForeign: data.isForeign,
              isMultipleMajor: data.isMultipleMajor,
              whatMultipleMajor: data.whatMultipleMajor,
              whatMultipleMajorDepartment: data.whatMultipleMajorDepartment,
            });
          }
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("CallLecture.js - checkLogin");
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header"></div>
      <div className="chatbot-content">
        {isLoginChecking ? (
          <div className="loader">
            <div className="spinner"></div>
            <p>챗봇 불러오는 중...</p>
          </div>
        ) : (
          <>
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
              {isThemesLoading ? (
                <div className="loading-message">
                  <div className="loader">
                    <div className="spinner"></div>
                    <p>테마를 불러오고 있어요.</p>
                  </div>
                </div>
              ) : (
                availableThemes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeSelection(theme)}
                    className={`theme-button ${
                      selectedTheme === theme ? "selected" : ""
                    }`}
                  >
                    {theme}
                  </button>
                ))
              )}
            </div>
            <div className="chat-log" ref={chatLogRef}>
              {chatLog.map((entry, index) => (
                <div key={index} className={`chat-message ${entry.type}`}>
                  {entry.type === "system" && (
                    <img
                      src={chatbotImage}
                      alt="Chatbot"
                      className="chatbot-avatar-small"
                    />
                  )}
                  <div className="message-content">
                    <ReactMarkdown>{entry.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message system">
                  <img
                    src={chatbotImage}
                    alt="Chatbot"
                    className="chatbot-avatar-small"
                  />
                  <div className="message-content">
                    <div className="chat-bot-loader">
                      <div className="chat-bot-spinner"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="chat-bot-input-area">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedTheme ? "메세지를 입력해주세요..." : "테마를 선택해주세요."
          }
          className={`message-input ${
            !selectedTheme ? "chatbot-input-disabled" : ""
          }`}
          disabled={!selectedTheme || isLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`send-button ${
            !selectedTheme || isLoading ? "chatbot-button-disabled" : ""
          }`}
          disabled={!selectedTheme || isLoading}
        >
          <svg
            version="1.1"
            id="Icons"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
          >
            <path
              d="M26.4,2.9L3.8,15c-0.7,0.4-0.7,1.5,0.1,1.8l20.8,8.7c0.6,0.3,1.3-0.2,1.4-0.8l1.7-20.8
	C27.9,3,27.1,2.5,26.4,2.9z"
            />
            <path d="M26,4L13,20v7.3c0,0.9,1.2,1.4,1.8,0.7L19,23" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
