import React, { useState } from "react";
import axios from "axios";

const Chat = () => {
  const [message, setMessage] = useState([]);
  const [response, setResponse] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage([...message, inputMessage]);
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: inputMessage,
      });
      setResponse([...response, res.data.response]);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response ? error.response.data : error.message;
      setResponse([...response, errorMessage]);
    }

    let check = 0;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={inputMessage} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
      <div>
        {
          // 유저가 입력 -> check = 1
          // 만약 check이 1이라면
          // {Array.isArray(message) && message.length > 0 ? (
          //   message.map((msg, index) => <li key={index}>{msg}</li>)
          // ) : (
          //   <li>No messages</li>
          // )}
          // check -> -1
          // 만약 check이 -1이라면
          // {Array.isArray(response) && response.length > 0 ? (
          //   response.map((res, index) => <li key={index}>{res}</li>)
          // ) : (
          //   <li>No responses</li>
          // )}
          // check = 0
        }
        <ul>
          {Array.isArray(message) &&
          Array.isArray(response) &&
          (message.length > 0 || response.length > 0) ? (
            [
              ...message.map((msg, index) => ({
                type: "message",
                content: msg,
                key: `m-${index}`,
              })),
              ...response.map((res, index) => ({
                type: "response",
                content: res,
                key: `r-${index}`,
              })),
            ].map((item) => <li key={item.key}>{item.content}</li>)
          ) : (
            <li>No messages</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
