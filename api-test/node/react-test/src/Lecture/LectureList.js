import React, { useState } from "react";

const LectureList = ({ lectures, selectedLectures, handleLectureSelect }) => {
  const [openLectures, setOpenLectures] = useState({});

  const handleToggle = (lecClassName) => {
    setOpenLectures((prevOpenLectures) => ({
      ...prevOpenLectures,
      [lecClassName]: !prevOpenLectures[lecClassName],
    }));
  };

  const groupedLectures = lectures.reduce((acc, lecture) => {
    if (!acc[lecture.lecClassName]) {
      acc[lecture.lecClassName] = [];
    }
    acc[lecture.lecClassName].push(lecture);
    return acc;
  }, {});

  return (
    <div id="result">
      <h1>강의 선택</h1>
      {lectures.length === 1 && lectures[0].lecNumber === "noLecture" ? (
        <p>조건에 맞는 강의가 없어요.😥</p>
      ) : (
        <ul>
          {Object.keys(groupedLectures).map((lecClassName) => {
            const lectureGroup = groupedLectures[lecClassName];
            const isMultiple = lectureGroup.length > 1;

            return (
              <li key={lecClassName}>
                {isMultiple ? (
                  <button onClick={() => handleToggle(lecClassName)}>
                    {lecClassName} (겹치는 강의 수: {lectureGroup.length})
                  </button>
                ) : (
                  <></>
                )}
                {(isMultiple ? openLectures[lecClassName] : true) &&
                  lectureGroup.map((lecture) => (
                    <li key={lecture.lecNumber}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedLectures.includes(lecture.lecNumber)}
                          onChange={() =>
                            handleLectureSelect(lecture.lecNumber)
                          }
                        />
                        {lecture.userCanNotTake === "userCanNotTake"
                          ? "(분반이 다른 걸요. 아니면 학년 제한에 걸렸을 수도 있어요.) "
                          : lecture.userCanNotTake === "userAlreadyTaken"
                          ? "(이미수강한 강의인걸요) "
                          : ""}
                        {lecture.MajorRecog != null
                          ? "| " + lecture.MajorRecog + " |"
                          : ""}
                        {lecture.lecClassName} ({lecture.lecNumber})
                        {lecture.lecProfessor}| 학점: {lecture.lecCredit} |
                        시간: {lecture.lecTime} | 테마명:
                        {lecture.lecSubName} | 과제 양(높을수록 적음):
                        {lecture.lecAssignment} | 팀플 양(높을수록 적음):
                        {lecture.lecTeamplay} | 성적 난이도 (높을수록 너그러움):{" "}
                        {lecture.lecGrade} | 강의 요약:{" "}
                        {lecture.lecSummaryReview} | 강의 별점:{" "}
                        {lecture.lecStars} | 이수 구분:{" "}
                        {lecture.lecClassification}
                      </label>
                    </li>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LectureList;
