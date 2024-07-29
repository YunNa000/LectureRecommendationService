import React, { useState } from "react";

/**
 * user가 조건들 추가해서 요청 보내고, 응답 받아서 결과 표시
 * 이렇게 요청 보내고, 받아온다 정도로만 해석, 피그마에 적은 각 페이지별 요구? 데이터들 보면서 작업 필요
 *
 * @returns {JSX.Element} - LectureRequestForm componetn
 */
function LectureRequestForm() {
  /**
   * user 학년
   * @type {string}
   */
  const [userGrade, setUserGrade] = useState("");

  /**
   * user 분반반
   * @type {string}
   */
  const [userBunban, setUserBunban] = useState("");

  /**
   * 강의 분류
   * @type {string}
   */
  const [lecClassification, setLecClassification] = useState("");

  /**
   * server response result state
   * @type {Array<Object>}
   */
  const [result, setResult] = useState([]);

  /**
   * form submit handler
   * form submit할 경우 데이터를 서버에 post 요청, response data를 result에 저장
   *
   * @param {React.FormEvent<HTMLFormElement>} event - form submit event
   */
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
