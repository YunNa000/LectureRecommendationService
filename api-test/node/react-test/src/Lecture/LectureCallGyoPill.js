import React from "react";
import UserTimeTable from "./UserTimeTable";

const LectureCallGyoPill = ({
  userYear,
  setUserYear,
  bunBan,
  setBunBan,
  lecClassification,
  setLecClassification,
  star,
  setStar,
  setAssignmentAmount,
  assignmentAmount,
  setTeamplayAmount,
  teamplayAmount,
  gradeAmount,
  setGradeAmount,
  lecTheme,
  setLecTheme,
  handleSubmit,
  lecName,
  setLecName,
  coordinates,
  setCoordinates,
}) => {
  React.useEffect(() => {
    setLecClassification("교필");
  }, [setLecClassification]);

  return (
    <form onSubmit={handleSubmit}>
      교필
      <input
        type="hidden"
        id="userYear"
        name="userYear"
        value={userYear}
        onChange={(e) => setUserYear(e.target.value)}
        required
      />
      <input
        type="hidden"
        id="bunBan"
        name="bunBan"
        value={bunBan}
        onChange={(e) => setBunBan(e.target.value)}
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
        id="star"
        name="star"
        value={star}
        onChange={(e) => setStar(e.target.value)}
      />
      <label>assignment</label>
      <select
        id="assignmentAmount"
        name="assignmentAmount"
        value={assignmentAmount}
        onChange={(e) => setAssignmentAmount(parseInt(e.target.value))}
      >
        <option>상관없음</option>
        <option value="1">적음</option>
      </select>
      <label>teamplay</label>
      <select
        id="teamplayAmount"
        name="teamplayAmount"
        value={teamplayAmount}
        onChange={(e) => setTeamplayAmount(parseInt(e.target.value))}
      >
        <option>상관없음</option>
        <option value="1">적음</option>
      </select>
      <label>grade amount</label>
      <select
        id="gradeAmount"
        name="gradeAmount"
        value={gradeAmount}
        onChange={(e) => setGradeAmount(parseInt(e.target.value))}
      >
        <option>상관없음</option>
        <option value="1">너그러움</option>
      </select>
      <label>theme</label>
      <select
        id="lecTheme"
        name="lecTheme"
        value={lecTheme}
        onChange={(e) => setLecTheme(e.target.value)}
      >
        <option>전체보기</option>
        <option value="광운인되기">광운인되기</option>
        <option value="대학영어">대학영어</option>
        <option value="정보">정보</option>
        <option value="융합적사고와글쓰기">융합적사고와글쓰기</option>
      </select>
      <label>lecture name</label>
      <input
        id="lecName"
        name="lecName"
        value={lecName}
        onChange={(e) => setLecName(e.target.value)}
      />
      <UserTimeTable
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallGyoPill;
