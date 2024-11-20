import React from "react";
import "./TotalLectureSearch.css";

const TotalLectureSearch = ({ fetchLectures, lectureName, setLectureName }) => {
  const isDisabled = !lectureName;

  return (
    <div className="total-search-box">
      <div className="total-search-conditions-bar">
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)} //백엔드에서 강의명, 학정번호, 교수명으로 동시에 검색할 수 있도록 하는 것이 필요해요
          placeholder="강의명/학정번호/교수명"
          className="total-search-lecturename"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchLectures();
            }
          }}
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
