import React from "react";

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
}) => {
  return (
    <div>
      <div>
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
      </div>

      <hr />
      <div>
        <label>강의명</label>
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)}
        />
      </div>
      <button onClick={fetchLectures}>강의 검색</button>
    </div>
  );
};

export default TotalLectureSearch;
