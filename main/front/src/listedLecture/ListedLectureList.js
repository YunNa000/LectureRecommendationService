import React from "react";

const ListedLectureList = ({
  filteredLectures,
  updateLecturePriority,
  priority,
}) => {
  if (filteredLectures.length === 0) {
    return <p>등록된 강의가 없습니다.</p>;
  }

  return (
    <div>
      {filteredLectures.map((lecture, index) => (
        <div key={index}>
          <label>
            <input
              type="checkbox"
              checked={
                lecture.priority &&
                lecture.priority.split(" ").includes(priority)
              }
              onChange={() =>
                updateLecturePriority(lecture.lecNumber, priority)
              }
            />
            <span>{lecture.lecName}</span>
          </label>
          <small>
            {lecture.year}년 {lecture.semester}학기
          </small>
          <p>
            {lecture.lecNumber} | {lecture.priority} | {lecture.classroom} |{" "}
            {lecture.memo} | {lecture.lecTime} | {lecture.lecTheme} |{" "}
            {lecture.lecClassification} | {lecture.star} |{" "}
            {lecture.assignmentAmount} | {lecture.teamPlayAmount} |{" "}
            {lecture.gradeAmount} | {lecture.reviewSummary} |
          </p>
        </div>
      ))}
    </div>
  );
};

export default ListedLectureList;
