import React, { useState } from "react";
import UserTimeTable from "./UserTimeTable";
import "./JunGongLectureSearch.css";
const JunGongLectureSearch = ({
  lecClassification,
  isPillSu,
  setIsPillSu,
  lecTheme,
  setLecTheme,
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
  lecCredit,
  setLecCredit,
  lecTimeTable,
  setlecTimeTable,
}) => {
  const [isTimeTableVisible, setIsTimeTableVisible] = useState(false);

  const toggleTimeTable = () => {
    setIsTimeTableVisible((prev) => !prev);
  };

  return (
    <div className="jungong-search-box">
      <div className="jungong-search-view-only-require">
        <label>
          <input
            type="checkbox"
            checked={isPillSu}
            onChange={(e) => setIsPillSu(e.target.checked)}
          />
          필수 과목만 보기
        </label>
      </div>
      <div className="jungong-search-conditions-bar">
        <div>
          <input
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)} //백엔드에서 강의명, 학정번호, 교수명으로 동시에 검색할 수 있도록 하는 것이 필요해요
            placeholder="강의명/학정번호/교수명"
            className="jungong-search-lecturename"
          />
        </div>
        <div className="jungong-search-conditions-credit">
          <label>학점:</label>
          <select
            value={lecCredit}
            onChange={(e) => setLecCredit(e.target.value)}
            className="jungong-search-conditions-credit-select"
          >
            <option value={0}>상관없음</option>
            <option value={1}>1학점</option>
            <option value={2}>2학점</option>
            <option value={3}>3학점</option>
            <option value={4}>4학점 이상</option>
          </select>
        </div>
        <div className="jungong-search-conditions-credit">
          <label>별점:</label>
          <select
            value={star}
            onChange={(e) => setStar(e.target.value)}
            className="jungong-search-conditions-credit-select"
          >
            <option value={0}>상관없음</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div className="jungong-search-conditions-credit">
          <label>팀플 양:</label>
          <select
            value={teamplayAmount}
            onChange={(e) => setTeamplayAmount(e.target.value)}
            className="jungong-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="적음">적음</option>
          </select>
        </div>

        <div className="jungong-search-conditions-credit">
          <label>성적 양:</label>
          <select
            value={gradeAmount}
            onChange={(e) => setGradeAmount(e.target.value)}
            className="jungong-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="너그러움">너그러움</option>
          </select>
        </div>
        <div className="jungong-search-conditions-credit">
          <label>과제 양:</label>
          <select
            value={assignmentAmount}
            onChange={(e) => setAssignmentAmount(e.target.value)}
            className="jungong-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="적음">적음</option>
          </select>
        </div>
        <button
          onClick={toggleTimeTable}
          className="jungong-search-user-can-time-button"
        >
          {isTimeTableVisible ? "시간 선택 숨기기" : "가능한 시간 선택"}
        </button>
      </div>
      {isTimeTableVisible && (
        <UserTimeTable
          coordinates={lecTimeTable}
          setCoordinates={setlecTimeTable}
        />
      )}
      <div className="jungong-search-button-box-box">
        <p className="jungong-search-info">
          타과 전공은 뜨지 않아요.
          <br />
          타과 전공은 전체 강의나 강의 추천 탭을 이용해주세요.
        </p>
        <div className="jungong-search-button-box">
          <button onClick={fetchLectures} className="jungong-search-button">
            강의 검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default JunGongLectureSearch;
