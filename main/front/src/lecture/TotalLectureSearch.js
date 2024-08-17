import React from "react";
import UserTimeTable from "./UserTimeTable";

const TotalLectureSearch = ({
  teamplayAmount,
  setTeamplayAmount,
  gradeAmount,
  setGradeAmount,
  assignmentAmount,
  setAssignmentAmount,
  fetchLectures,
  star,
  setStar,
  lectureName,
  setLectureName,
  setYear,
  setSemester,
  year,
  semester,
  lecCredit,
  setLecCredit,
  lecTimeTable,
  setlecTimeTable,
}) => {
  return (
    <div>
      {/* <div>
        <label>별점</label>
        <select value={star} onChange={(e) => setStar(e.target.value)}>
          <option value={0}>상관없음</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div>
        <label>팀플 양:</label>
        <select
          value={teamplayAmount}
          onChange={(e) => setTeamplayAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="적음">적음</option>
        </select>
      </div>

      <div>
        <label>성적 양:</label>
        <select
          value={gradeAmount}
          onChange={(e) => setGradeAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="너그러움">너그러움</option>
        </select>
      </div>

      <div>
        <label>과제 양:</label>
        <select
          value={assignmentAmount}
          onChange={(e) => setAssignmentAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="적음">적음</option>
        </select>
      </div> */}
      <div>
        <label>학점</label>
        <select
          value={lecCredit}
          onChange={(e) => setLecCredit(e.target.value)}
        >
          <option value={0}>상관없음</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4 이상</option>
        </select>
      </div>
      <div>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <label>년도</label>
      </div>

      <div>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="1학기">1학기</option>
          <option value="여름학기">여름학기</option>
          <option value="2학기">2학기</option>
          <option value="겨울학기">겨울학기</option>
        </select>
      </div>

      <div>
        <label>강의명</label>
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)}
        />
      </div>
      <UserTimeTable 
        coordinates={lecTimeTable}
        setCoordinates={setlecTimeTable}
      />
      <button onClick={fetchLectures}>강의 검색</button>
    </div>
  );
};

export default TotalLectureSearch;
