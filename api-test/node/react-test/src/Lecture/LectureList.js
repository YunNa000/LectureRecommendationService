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
