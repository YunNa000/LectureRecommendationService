import React from "react";
import "./TotalLectureSearch.css";

const TotalLectureSearch = ({ fetchLectures, lectureName, setLectureName }) => {
  const isDisabled = !lectureName;

  return (
    <div className="total-search-box">
      <div className="total-search-conditions-bar">
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)}
          className="total-search-lecturename"
          placeholder="강의명/학정번호/교수명"
        />
        <button
          onClick={fetchLectures}
          className={`total-search-button ${
            isDisabled ? "total-search-button-disabled" : ""
          }`}
          disabled={isDisabled}
        >
          강의 검색
        </button>
      </div>
    </div>
  );
};

export default TotalLectureSearch;
