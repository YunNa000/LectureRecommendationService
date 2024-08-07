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
              {lecture.userCanNotTake === "userCanNotTake"
                ? "(분반이 다른 걸요. 아니면 학년 제한에 걸렸을 수도 있어요.) "
                : lecture.userCanNotTake === "userAlreadyTaken"
                ? "(이미수강한 강의인걸요) "
                : ""}
              {lecture.MajorRecog != null
                ? "| " + lecture.MajorRecog + " |"
                : ""}
              {console.log(lecture.MajorRecog)}
              {lecture.lecClassName} ({lecture.lecNumber}){lecture.lecProfessor}{" "}
              | 학점: {lecture.lecCredit} | 시간: {lecture.lecTime} | 테마명:
              {lecture.lecSubName} | 과제 양(높을수록 적음):
              {lecture.lecAssignment} | 팀플 양(높을수록 적음):
              {lecture.lecTeamplay} | 성적 난이도 (높을수록 너그러움):{" "}
              {lecture.lecGrade} | 강의 요약: {lecture.lecSummaryReview} | 강의
              별점: {lecture.lecStars} | 이수 구분: {lecture.lecClassification}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LectureList;
