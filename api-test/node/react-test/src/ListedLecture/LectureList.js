import React from "react";

const LectureList = ({
  lectures,
  checkedLectures,
  handleCheck,
  handleDelete,
}) => {
  return (
    <div>
      {lectures.length === 0 ? (
        <div>해당 학기에 선택한 강의가 없어요.</div>
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
                {lecture.lecProfessor} | {lecture.lecTime} | {lecture.year} |
                {lecture.semester}
              </small>
              <button onClick={() => handleDelete(lecture)}>삭제</button>
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default LectureList;
