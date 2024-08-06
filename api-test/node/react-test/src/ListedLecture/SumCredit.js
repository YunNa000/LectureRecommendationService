import React from "react";

const SumCredit = ({ listedLectures, checkedLectures }) => {
  // 전체 학점 계산
  const totalCredits = listedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );

  // 체크한 강의의 학점 계산
  const checkedCredits = checkedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );

  // 체크한 강의의 학점을 분류하여 계산
  const checkedCreditDetails = checkedLectures.reduce(
    (acc, lecture) => {
      switch (lecture.lecClassification) {
        case "전필":
          acc.majorRequired += lecture.lecCredit;
          break;
        case "전선":
          acc.majorElective += lecture.lecCredit;
          break;
        case "교필":
          acc.generalRequired += lecture.lecCredit;
          break;
        case "교선":
          acc.generalElective += lecture.lecCredit;
          break;
        default:
          acc.others += lecture.lecCredit;
          break;
      }
      return acc;
    },
    {
      majorRequired: 0,
      majorElective: 0,
      generalRequired: 0,
      generalElective: 0,
      others: 0,
    }
  );

  return (
    <div>
      <p>총 학점: {totalCredits}</p>
      <p>체크한 강의 총 학점: {checkedCredits}</p>
      <p>
        전공 학점:{" "}
        {checkedCreditDetails.majorRequired +
          checkedCreditDetails.majorElective}
      </p>
      <p>
        교양 학점:{" "}
        {checkedCreditDetails.generalRequired +
          checkedCreditDetails.generalElective}
      </p>
      <p>기타 학점: {checkedCreditDetails.others}</p>
    </div>
  );
};

export default SumCredit;
