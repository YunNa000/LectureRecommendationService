import React from "react";

const LectureCallGyoSun = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecClassification,
  setLecClassification,
  handleSubmit,
}) => {
  React.useEffect(() => {
    setLecClassification("교선");
  }, [setLecClassification]);

  return (
    <form onSubmit={handleSubmit}>
      교선
      <input
        type="hidden"
        id="userGrade"
        name="userGrade"
        value={userGrade}
        onChange={(e) => setUserGrade(e.target.value)}
        required
      />
      <br />
      <input
        type="hidden"
        id="userBunban"
        name="userBunban"
        value={userBunban}
        onChange={(e) => setUserBunban(e.target.value)}
        required
      />
      <br />
      <br />
      <input
        type="hidden"
        id="lecClassification"
        name="lecClassification"
        value={lecClassification}
        required
      />
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallGyoSun;
