import React from "react";

const LectureCallJunGong = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecClassification,
  setLecClassification,
  handleSubmit,
}) => {
  React.useEffect(() => {
    setLecClassification("전선");
  }, [setLecClassification]);

  return (
    <form onSubmit={handleSubmit}>
      전공
      <input
        type="hidden"
        id="userGrade"
        name="userGrade"
        value={userGrade}
        onChange={(e) => setUserGrade(e.target.value)}
        required
      />
      <input
        type="hidden"
        id="userBunban"
        name="userBunban"
        value={userBunban}
        onChange={(e) => setUserBunban(e.target.value)}
        required
      />
      <label htmlFor="lecClassification">전공 분류:</label>
      <select
        id="lecClassification"
        name="lecClassification"
        value={lecClassification}
        onChange={(e) => setLecClassification(e.target.value)}
        required
      >
        <option value="교선">전선</option>
        <option value="교필">전필</option>
      </select>
      <br />
      <br />
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallJunGong;
