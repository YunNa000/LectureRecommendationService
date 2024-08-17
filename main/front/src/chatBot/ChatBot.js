import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

function ChatBot() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/files/");
        setFiles(response.data.files);
      } catch (error) {
        console.error("error fetching files");
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = async (event) => {
    const fileName = event.target.value;
    const filePath =
      "/home/ga111o/document/VSCode/kwu-lecture-recommendation-service/api-test/server/.cache/files/" +
      fileName;
    setSelectedFile(fileName);

    if (filePath) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/selectfile/", {
          file_name: filePath,
        });
      } catch (error) {
        console.error("error selecting file");
      }
    }
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleAskQuestion = async () => {
    if (question.trim() === "") return;

    setChatLog((prevLog) => [...prevLog, { type: "question", text: question }]);

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask/", {
        question,
      });
      const formattedAnswer = response.data.answer.replace(/\n/g, "<br>");

      setChatLog((prevLog) => [
        ...prevLog,
        { type: "answer", text: formattedAnswer },
      ]);
    } catch (error) {
      console.error("Error asking question");
    }

    setQuestion("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAskQuestion();
    }
  };

  return (
    <div>
      <label>저는 "</label>
      <select onChange={handleFileChange} value={selectedFile}>
        <option value=""></option>
        {files.map((file) => {
          const displayFileName = file.split(".")[0];
          return (
            <option key={file} value={file}>
              {displayFileName}
            </option>
          );
        })}
      </select>
      <label>" 에 대해 물어보고 싶어요.</label>
      <input
        type="text"
        value={question}
        onChange={handleQuestionChange}
        onKeyDown={handleKeyDown}
        placeholder="질문을 입력하세요"
      />
      <button onClick={handleAskQuestion}>질문하기</button>
      <div>
        {chatLog.map((entry, index) => (
          <div
            key={index}
            className={
              entry.type === "question" ? "chat-question" : "chat-answer"
            }
          >
            <p dangerouslySetInnerHTML={{ __html: entry.text }}></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatBot;
