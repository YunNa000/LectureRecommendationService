import React from "react";

const UserForm = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecClassification,
  setLecClassification,
  handleSubmit,
}) => {
  return (
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

      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default UserForm;
