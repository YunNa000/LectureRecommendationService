import React, { useState } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
    setMessages(newMessages);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { message: inputMessage });
      setMessages((prevMessages) => [...prevMessages, { text: res.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error(error);
    }
    
    setInputMessage("");
  };

  return (
    <div className="chat-container">
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
        />
        <button type="submit" className="chat-button">Send</button>
      </form>
      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <li key={index} className={msg.sender}>
                {msg.sender === 'user' ? "User: " : "Bot: "}{msg.text}
              </li>
            ))
          ) : (
            <li>No messages</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
