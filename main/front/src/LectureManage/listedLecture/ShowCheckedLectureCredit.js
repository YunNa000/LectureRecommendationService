import React from "react";
import "./ShowCheckedLectureCredit.css";

const ShowCheckedLectureCredit = ({
  totalCredits,
  majorCredits,
  gyoYangCredits,
  otherCredits,
}) => {
  return (
    <div className="showCheckedLectureCredit">
      <p>전체: {totalCredits}</p>
      <p>전공: {majorCredits}</p>
      <p>교양: {gyoYangCredits}</p>
      <p>기타: {otherCredits}</p>
    </div>
  );
};

export default ShowCheckedLectureCredit;
