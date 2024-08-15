import React, { useState } from "react";

const ListedLectureList = ({
  filteredLectures,
  updateLecturePriority,
  priority,
  unselectLecture,
  updateLectureInfo,
  totalGPA,
  totalCredits,
}) => {
  const [editingLectureIndex, setEditingLectureIndex] = useState(null);
  const [memo, setMemo] = useState("");
  const [classroom, setClassroom] = useState("");

  if (filteredLectures.length === 0) {
    return <p>강의를 추가해주세요.</p>;
  }

  const checkedLectures = filteredLectures.filter(
    (lecture) =>
      lecture.priority && lecture.priority.split(" ").includes(priority)
  );

  const maxCredits = checkedLectures.some((lecture) =>
    lecture.lecName.includes("광운인되기")
  )
    ? totalGPA < 3.5
      ? 20
      : 23
    : totalGPA < 3.5
    ? 19
    : 22;

  const warningMessage =
    (totalGPA < 3.5 && totalCredits > maxCredits) ||
    (totalGPA >= 3.5 && totalCredits > maxCredits) ? (
      <p>
        {checkedLectures.some((lecture) =>
          lecture.lecName.includes("광운인되기")
        )
          ? `광운인되기를 포함해서 ${maxCredits}학점 까지 들을 수 있어요.`
          : `${maxCredits}학점 까지 들을 수 있어요.`}
      </p>
    ) : null;

  const handleUnselect = (lecNumber, year, semester) => {
    unselectLecture(lecNumber, year, semester);
  };

  const handleEditClick = (lecture, index) => {
    setEditingLectureIndex(index);
    setMemo(lecture.memo);
    setClassroom(lecture.classroom);
  };

  const handleUpdate = async (lecture) => {
    await updateLectureInfo({
      user_id: lecture.user_id,
      lecNumber: lecture.lecNumber,
      year: lecture.year,
      semester: lecture.semester,
      memo,
      classroom,
    });
    setEditingLectureIndex(null);
  };

  return (
    <div>
      {warningMessage}
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
            {lecture.gradeAmount} | {lecture.reviewSummary} |{" "}
            {lecture.lecCredit}
          </p>
          {editingLectureIndex === index ? (
            <div>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모"
              />
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="강의실"
              />
              <button onClick={() => handleUpdate(lecture)}>저장</button>
            </div>
          ) : (
            <button onClick={() => handleEditClick(lecture, index)}>
              수정
            </button>
          )}
          <button
            onClick={() =>
              handleUnselect(lecture.lecNumber, lecture.year, lecture.semester)
            }
          >
            unselect
          </button>
        </div>
      ))}
    </div>
  );
};

export default ListedLectureList;
