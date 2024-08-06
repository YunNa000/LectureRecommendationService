import React from "react";

const LectureCallTotal = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecStars,
  setLecStars,
  setlecAssignment,
  lecAssignment,
  lecTeamplay,
  setlecTeamplay,
  lecGrade,
  setlecGrade,
  handleSubmit,
  lecClassName,
  setLecClassName,
}) => {
  return (
    <form onSubmit={handleSubmit}>
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
      <label>star</label>
      <input
        id="lecStars"
        name="lecStars"
        value={lecStars}
        onChange={(e) => setLecStars(e.target.value)}
      />
      <label>assignment</label>
      <select
        id="lecAssignment"
        name="lecAssignment"
        value={lecAssignment}
        onChange={(e) => setlecAssignment(parseInt(e.target.value))}
      >
        <option value="1">적음</option>
        <option>상관없음</option>
      </select>
      <label>lecTeamplay</label>
      <select
        id="lecTeamplay"
        name="lecTeamplay"
        value={lecTeamplay}
        onChange={(e) => setlecTeamplay(parseInt(e.target.value))}
      >
        <option value="1">적음</option>
        <option>상관없음</option>
      </select>
      <label>lecGrade</label>
      <select
        id="lecGrade"
        name="lecGrade"
        value={lecGrade}
        onChange={(e) => setlecGrade(parseInt(e.target.value))}
      >
        <option value="1">너그러움</option>
        <option>상관없음</option>
      </select>
      <label>lecClassName</label>
      <input
        id="lecClassName"
        name="lecClassName"
        value={lecClassName}
        onChange={(e) => setLecClassName(e.target.value)}
      />
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallTotal;
