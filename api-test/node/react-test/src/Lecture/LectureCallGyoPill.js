import React from "react";

const LectureCallGyoPill = ({
  userGrade,
  setUserGrade,
  userBunban,
  setUserBunban,
  lecClassification,
  setLecClassification,
  lecStars,
  setLecStars,
  setlecAssignment,
  lecAssignment,
  lecTeamplay,
  setlecTeamplay,
  lecGrade,
  setlecGrade,
  lecSubName,
  setlecSubName,
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
        <option>상관없음</option>
        <option value="1">적음</option>
      </select>
      <label>lecTeamplay</label>
      <select
        id="lecTeamplay"
        name="lecTeamplay"
        value={lecTeamplay}
        onChange={(e) => setlecTeamplay(parseInt(e.target.value))}
      >
        <option>상관없음</option>
        <option value="1">적음</option>
      </select>
      <label>lecGrade</label>
      <select
        id="lecGrade"
        name="lecGrade"
        value={lecGrade}
        onChange={(e) => setlecGrade(parseInt(e.target.value))}
      >
        <option>상관없음</option>
        <option value="1">너그러움</option>
      </select>
      <label>lecSubName</label>
      <select
        id="lecSubName"
        name="lecSubName"
        value={lecSubName}
        onChange={(e) => setlecSubName(e.target.value)}
      >
        <option>전체보기</option>
        <option value="광운인되기">광운인되기</option>
        <option value="대학영어">대학영어</option>
        <option value="정보">정보</option>
        <option value="융합적사고와글쓰기">융합적사고와글쓰기</option>
      </select>
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallGyoPill;
