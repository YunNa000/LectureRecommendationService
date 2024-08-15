import React from "react";

const ListedLectureFilter = ({
  year,
  setYear,
  semester,
  setSemester,
  priority,
  setPriority,
}) => {
  return (
    <div>
      <label>
        연도:
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </label>
      <label>
        학기:
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="1학기">1학기</option>
          <option value="여름학기">여름학기</option>
          <option value="2학기">2학기</option>
          <option value="겨울학기">겨울학기</option>
        </select>
      </label>
      <label>
        우선 순위:
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="1순위">1순위</option>
          <option value="2순위">2순위</option>
          <option value="3순위">3순위</option>
        </select>
      </label>
    </div>
  );
};

export default ListedLectureFilter;
