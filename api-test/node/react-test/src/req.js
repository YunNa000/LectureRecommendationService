import React, { useState } from "react";

function LectureRequestForm() {
  const [userGrade, setUserGrade] = useState("");
  const [userBunban, setUserBunban] = useState("");
  const [lecClassification, setLecClassification] = useState("");
  const [result, setResult] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch("http://127.0.0.1:8000/lectures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userGrade: userGrade,
        userBunban: userBunban,
        lecClassification: lecClassification,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("!response.ok");
        }
        return response.json();
      })
      .then((data) => {
        setResult(data);
      })
      .catch((error) => {
        setResult([{ lecClassName: "errrrr", lecNumber: error.message }]);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="userGrade">학년:</label>
        <input
          type="number"
          id="userGrade"
          name="userGrade"
          value={userGrade}
          onChange={(e) => setUserGrade(e.target.value)}
          required
        />
        <br />
        <br />

        <label htmlFor="userBunban">분반:</label>
        <input
          type="text"
          id="userBunban"
          name="userBunban"
          value={userBunban}
          onChange={(e) => setUserBunban(e.target.value)}
          required
        />
        <br />
        <br />

        <label htmlFor="lecClassification">전공 분류:</label>
        <input
          type="text"
          id="lecClassification"
          name="lecClassification"
          value={lecClassification}
          onChange={(e) => setLecClassification(e.target.value)}
          required
        />
        <br />
        <br />

        <button type="submit">buttttton</button>
      </form>

      <div id="result">
        {result.map((lecture, index) => (
          <p key={index}>
            {lecture.lecClassName} - {lecture.lecNumber}
          </p>
        ))}
      </div>
    </div>
  );
}

export default LectureRequestForm;
