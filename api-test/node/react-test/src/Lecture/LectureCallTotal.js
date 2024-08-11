import React from "react";
import UserTimeTable from "./UserTimeTable";

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
  semester,
  setSemester,
  year,
  setYear,
  coordinates,
  setCoordinates
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
      <label>year</label>
      <input
        id="year"
        name="year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <label>semester</label>
      <select
        id="semester"
        name="semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      >
        <option value="1학기">1학기</option>
        <option value="여름학기">여름학기</option>
        <option value="2학기">2학기</option>
        <option value="겨울학기">겨울학기</option>
      </select>
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
                  <UserTimeTable 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <button type="submit">강의 리스트 불러오기</button>
    </form>
  );
};

export default LectureCallTotal;
