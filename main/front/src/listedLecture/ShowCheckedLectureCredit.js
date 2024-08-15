import React from "react";

const ShowCheckedLectureCredit = ({
  totalCredits,
  majorCredits,
  gyoYangCredits,
  otherCredits,
}) => {
  return (
    <div>
      <p>전체: {totalCredits}</p>
      <p>전공: {majorCredits}</p>
      <p>교양: {gyoYangCredits}</p>
      <p>🎸: {otherCredits}</p>
    </div>
  );
};

export default ShowCheckedLectureCredit;
