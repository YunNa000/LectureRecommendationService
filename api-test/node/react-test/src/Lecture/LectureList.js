import React from "react";

const LectureList = ({ lectures, selectedLectures, handleLectureSelect }) => {
  return (
    <div id="result">
      <h1>강의 선택</h1>
      <ul>
        {lectures.map((lecture) => (
          <li key={lecture.lecNumber}>
            <label>
              <input
                type="checkbox"
                checked={selectedLectures.includes(lecture.lecNumber)}
                onChange={() => handleLectureSelect(lecture.lecNumber)}
              />
              {lecture.lecClassName} ({lecture.lecNumber})
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LectureList;
