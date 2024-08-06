import React from "react";

const LectureList = ({ lectures, checkedLectures, handleCheck }) => {
  return (
    <div>
      {lectures.length === 0 ? (
        <div>선택한 강의가 없어요.</div>
      ) : (
        lectures.map((lecture, index) => (
          <div key={index}>
            <input
              type="checkbox"
              onChange={() => handleCheck(lecture)}
              checked={checkedLectures.includes(lecture)}
            />
            <p>
              {lecture.lecClassName}
              <small>
                {lecture.lecProfessor} | {lecture.lecTime}
              </small>
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default LectureList;
