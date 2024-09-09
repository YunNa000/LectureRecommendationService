import React, { useState } from "react";
import "./ListedLectureFilter.css";
import AddListedLectureManually from "./AddListedLectureManually";

const ListedLectureFilter = ({
  year,
  setYear,
  semester,
  setSemester,
  priority,
  setPriority,
  user,
  fetchLectures,
}) => {
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);

  const toggleAddLecture = () => {
    setIsAddLectureOpen(!isAddLectureOpen);
  };

  return (
    <div>
      <div className="FilterBar">
        <label className="year">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          년도
        </label>
        <select
          className="semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="1학기">1학기</option>
          <option value="여름학기">여름학기</option>
          <option value="2학기">2학기</option>
          <option value="겨울학기">겨울학기</option>
        </select>

        <select
          className="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="1순위">1순위</option>
          <option value="2순위">2순위</option>
          <option value="3순위">3순위</option>
        </select>

        <button className="manuallyAddbutton" onClick={toggleAddLecture}>
          {isAddLectureOpen ? "추가 취소" : "수동 추가"}
        </button>
      </div>

      {isAddLectureOpen && (
        <div className="manually">
          <AddListedLectureManually user={user} fetchLectures={fetchLectures} />
        </div>
      )}
    </div>
  );
};

export default ListedLectureFilter;
