import React, { useState } from "react";
import axios from "axios";

const Timetable = ({
  checkedLectures,
  year,
  semester,
  handleCheck,
  setListedLectures,
}) => {
  const [editLecture, setEditLecture] = useState(null);
  const [classroom, setClassroom] = useState("");
  const [memo, setMemo] = useState("");

  const filteredCheckedLectures = checkedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );

  const handleEditClick = (lecture) => {
    setEditLecture(lecture);
    setClassroom(lecture.userListedLecClassRoom);
    setMemo(lecture.userListedLecMemo);
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/data/update_lecture_info",
        {
          lec_number: editLecture.lecNumber,
          year: editLecture.year,
          semester: editLecture.semester,
          classroom: classroom,
          memo: memo,
        },
        {
          withCredentials: true,
        }
      );

      setListedLectures((prev) =>
        prev.map((lecture) =>
          lecture.lecNumber === editLecture.lecNumber &&
          lecture.year === editLecture.year &&
          lecture.semester === editLecture.semester
            ? {
                ...lecture,
                userListedLecClassRoom: classroom,
                userListedLecMemo: memo,
              }
            : lecture
        )
      );

      setEditLecture(null);
    } catch (error) {
      console.error("Error updating lecture info", error);
    }
  };

  const renderTimetable = () => {
    let timetable = Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));

    filteredCheckedLectures.forEach((lecture) => {
      const times = lecture.lecTime.match(/\((\d+):(\d+)\)/g);
      if (times) {
        times.forEach((time) => {
          const [_, col, row] = time.match(/\((\d+):(\d+)\)/);

          while (timetable.length < row) {
            timetable.push(Array(timetable[0].length).fill(null));
          }
          while (timetable[0].length < col) {
            timetable = timetable.map((row) => [...row, null]);
          }

          timetable[row - 1][col - 1] = (
            <>
              <p>{lecture.lecClassName}</p>
              <small>
                {lecture.lecProfessor} | {lecture.userListedLecClassRoom}
              </small>
              <button onClick={() => handleCheck(lecture)}>uncheck</button>
              <button onClick={() => handleEditClick(lecture)}>수정</button>
              {editLecture && editLecture.lecNumber === lecture.lecNumber && (
                <div>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="강의실"
                  />
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="메모"
                  />
                  <button onClick={handleSaveClick}>저장</button>
                  <button onClick={() => setEditLecture(null)}>취소</button>
                </div>
              )}
            </>
          );
        });
      }
    });

    return timetable.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, colIndex) => (
          <td key={colIndex}>{cell}</td>
        ))}
      </tr>
    ));
  };

  const renderNullLectures = () => {
    return filteredCheckedLectures
      .filter((lecture) => !lecture.lecTime.match(/\((\d+):(\d+)\)/g))
      .map((lecture, index) => (
        <p key={index}>
          {lecture.lecClassName} ({lecture.lecProfessor})
          <button onClick={() => handleCheck(lecture)}>uncheck</button>
          <button onClick={() => handleEditClick(lecture)}>수정</button>
          {editLecture && editLecture.lecNumber === lecture.lecNumber && (
            <div>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="강의실"
              />
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모"
              />
              <button onClick={handleSaveClick}>저장</button>
              <button onClick={() => setEditLecture(null)}>취소</button>
            </div>
          )}
        </p>
      ));
  };

  return (
    <div>
      <table border="1">
        <tbody>{renderTimetable()}</tbody>
      </table>
      {renderNullLectures()}
    </div>
  );
};

export default Timetable;
