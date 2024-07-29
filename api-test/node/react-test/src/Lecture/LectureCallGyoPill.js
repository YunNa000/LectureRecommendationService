import React from "react";

const LectureCallGyoPill = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecClassification,
  setLecClassification,
  handleSubmit,
}) => {
  React.useEffect(() => {
    setLecClassification("교필");
  }, [setLecClassification]);

  return (
    <form onSubmit={handleSubmit}>
      교필
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

export default LectureCallGyoPill;
