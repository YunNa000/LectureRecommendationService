import React, { useState } from "react";
import UserTimeTable from "./UserTimeTable";
import "./GyoYangLectureSearch.css";

const GyoYangLectureSearch = ({
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
    <div className="gyoyang-search-box">
      <div className="gyoyang-search-classification">
        {lecClassification === "교양" && !isPillSu && (
          <div>
            <select
              value={lecTheme}
              onChange={(e) => setLecTheme(e.target.value)}
              className="gyoyang-search-classification-select"
            >
              <option value="">전체 주제</option>
              <option value="과학과기술">과학과기술</option>
              <option value="인간과철학">인간과철학</option>
              <option value="사회와경제">사회와경제</option>
              <option value="글로벌문화와제2외국어">
                글로벌문화와제2외국어
              </option>
              <option value="예술과체육">예술과체육</option>
              <option value="수리와자연">수리와자연</option>
            </select>
          </div>
        )}

        {lecClassification === "교양" && isPillSu && (
          <div>
            <select
              value={lecTheme}
              onChange={(e) => setLecTheme(e.target.value)}
              className="gyoyang-search-classification-select"
            >
              <option value="">전체 주제</option>
              <option value="광운인되기">광운인되기</option>
              <option value="대학영어">대학영어</option>
              <option value="정보">정보</option>
              <option value="융합적사고와글쓰기">융합적사고와글쓰기</option>
            </select>
          </div>
        )}
        <label>
          <input
            type="checkbox"
            checked={isPillSu}
            onChange={(e) => setIsPillSu(e.target.checked)}
          />
          필수 과목만 보기
        </label>
      </div>
      <div className="gyoyang-search-conditions-bar">
        <div>
          <input
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)} //백엔드에서 강의명, 학정번호, 교수명으로 동시에 검색할 수 있도록 하는 것이 필요해요
            placeholder="강의명/학정번호/교수명"
            className="gyoyang-search-lecturename"
          />
        </div>
        <div className="gyoyang-search-conditions-credit">
          <label>학점:</label>
          <select
            value={lecCredit}
            onChange={(e) => setLecCredit(e.target.value)}
            className="gyoyang-search-conditions-credit-select"
          >
            <option value={0}>상관없음</option>
            <option value={1}>1학점</option>
            <option value={2}>2학점</option>
            <option value={3}>3학점</option>
            <option value={4}>4학점 이상</option>
          </select>
        </div>
        <div className="gyoyang-search-conditions-credit">
          <label>별점:</label>
          <select
            value={star}
            onChange={(e) => setStar(e.target.value)}
            className="gyoyang-search-conditions-credit-select"
          >
            <option value={0}>상관없음</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div className="gyoyang-search-conditions-credit">
          <label>팀플 양:</label>
          <select
            value={teamplayAmount}
            onChange={(e) => setTeamplayAmount(e.target.value)}
            className="gyoyang-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="적음">적음</option>
          </select>
        </div>

        <div className="gyoyang-search-conditions-credit">
          <label>성적 양:</label>
          <select
            value={gradeAmount}
            onChange={(e) => setGradeAmount(e.target.value)}
            className="gyoyang-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="너그러움">너그러움</option>
          </select>
        </div>
        <div className="gyoyang-search-conditions-credit">
          <label>과제 양:</label>
          <select
            value={assignmentAmount}
            onChange={(e) => setAssignmentAmount(e.target.value)}
            className="gyoyang-search-conditions-credit-select"
          >
            <option value="상관없음">상관없음</option>
            <option value="적음">적음</option>
          </select>
        </div>
        <button
          onClick={toggleTimeTable}
          className="gyoyang-search-user-can-time-button"
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
      <div className="gyoyang-search-button-box">
        <button onClick={fetchLectures} className="gyoyang-search-button">
          강의 검색
        </button>
      </div>
    </div>
  );
};

export default GyoYangLectureSearch;
