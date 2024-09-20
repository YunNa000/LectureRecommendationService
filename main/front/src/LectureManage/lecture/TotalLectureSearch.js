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
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)}
          className="total-search-lecturename"
          placeholder="강의명/학정번호/교수명"
        />
        <button onClick={fetchLectures} className="total-search-button">
          강의 검색
        </button>
      </div>
      <div className="total-search-button-box"></div>
    </div>
  );
};

export default TotalLectureSearch;
