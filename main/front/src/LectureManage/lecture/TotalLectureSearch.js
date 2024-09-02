import React from "react";
import "./TotalLectureSearch.css";

const TotalLectureSearch = ({
  fetchLectures,
  lectureName,
  setLectureName,
  setYear,
  setSemester,
  year,
  semester,
}) => {
  return (
    <div className="total-search-box">
      <div className="total-search-conditions-bar">
        <div className="total-search-conditions-year">
          <label className="total-search-conditions-year-label">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="total-search-conditions-credit-year-input"
            />
            년도
          </label>
        </div>

        <div>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="total-search-conditions-semester"
          >
            <option value="1학기">1학기</option>
            <option value="여름학기">여름학기</option>
            <option value="2학기">2학기</option>
            <option value="겨울학기">겨울학기</option>
          </select>
        </div>

        <div>
          <input
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)}
            className="total-search-lecturename"
            placeholder="강의명/학정번호/교수명"
          />
        </div>
      </div>
      <div className="total-search-button-box">
        <button onClick={fetchLectures} className="total-search-button">
          강의 검색
        </button>
      </div>
    </div>
  );
};

export default TotalLectureSearch;
