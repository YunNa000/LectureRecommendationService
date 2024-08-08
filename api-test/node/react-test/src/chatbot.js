import React, { useState } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { message: inputMessage });
      setMessages((prevMessages) => [...prevMessages, { text: res.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "오류가 발생했습니다. 다시 시도해 주세요.";
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
      }
      setMessages((prevMessages) => [...prevMessages, { text: errorMessage, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
    
    setInputMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? "You: " : "Bot: "}</strong>{msg.text}
          </div>
        ))}
        {isLoading && <div className="message bot">Bot is typing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="질문을 입력하세요..."
          disabled={isLoading}
        />
        <button type="submit" className="chat-button" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;