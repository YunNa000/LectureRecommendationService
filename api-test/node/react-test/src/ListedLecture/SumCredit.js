import React from "react";

const SumCredit = ({ listedLectures, checkedLectures }) => {
  const totalCredits = listedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );
  const checkedCredits = checkedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );

  return (
    <div>
      <p>총 학점: {totalCredits}</p>
      <p>체크한 강의 학점: {checkedCredits}</p>
    </div>
  );
};

export default SumCredit;
