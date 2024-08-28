import React, { useState } from "react";
import "./ListedLectureTimeTable.css";

const ListedLectureTimeTable = ({
  lectures,
  priority,
  updateLecturePriority,
  updateLectureInfo,
}) => {
  let maxDay = 0;
  let maxHour = 0;

  const [editingLectureIndex, setEditingLectureIndex] = useState(null);
  const [memo, setMemo] = useState("");
  const [classroom, setClassroom] = useState("");

  lectures.forEach((lecture) => {
    if (lecture.lecTime && lecture.lecTime !== "0" && lecture.lectime == null) {
      const times = lecture.lecTime.split(",");
      times.forEach((time) => {
        const [day, hour] = time.replace(/[()]/g, "").split(":").map(Number);
        if (day > maxDay) maxDay = day;
        if (hour > maxHour) maxHour = hour;
      });
    }
  });

  maxHour = Math.max(maxHour + 1, 6);

  const handleEditClick = (lecture, rowIndex, cellIndex, index) => {
    setEditingLectureIndex(`${rowIndex}-${cellIndex}-${index}`);
    setMemo(lecture.memo || "");
    setClassroom(lecture.classroom || "");
  };

  const handleUpdate = async (lecture) => {
    await updateLectureInfo({
      user_id: lecture.user_id,
      lecNumber: lecture.lecNumber,
      year: lecture.year,
      semester: lecture.semester,
      memo,
      classroom,
    });
    setEditingLectureIndex(null);
  };

  const daysOfWeek = ["", "월", "화", "수", "목", "금"];
  const hasSaturday = lectures.some((lecture) => {
    const times = lecture.lecTime ? lecture.lecTime.split(",") : [];
    return times.some((time) => {
      const [day] = time.replace(/[()]/g, "").split(":").map(Number);
      return day === 6;
    });
  });

  const hasSunday = lectures.some((lecture) => {
    const times = lecture.lecTime ? lecture.lecTime.split(",") : [];
    return times.some((time) => {
      const [day] = time.replace(/[()]/g, "").split(":").map(Number);
      return day === 7;
    });
  });

  if (hasSaturday) {
    daysOfWeek.push("토");
  }
  if (hasSunday) {
    daysOfWeek.push("일");
  }

  const timetable = Array.from({ length: maxHour }, () =>
    Array(daysOfWeek.length - 1)
      .fill(null)
      .map(() => [])
  );

  const noTimeLectures = [];

  lectures.forEach((lecture) => {
    if (lecture.lecTime && lecture.lecTime !== "0" && lecture.lectime == null) {
      const times = lecture.lecTime.split(",");
      times.forEach((time) => {
        const [day, hour] = time.replace(/[()]/g, "").split(":").map(Number);
        if (hour >= 0 && hour < timetable.length) {
          timetable[hour][day - 1].push(lecture);
        }
      });
    } else {
      noTimeLectures.push(lecture);
    }
  });

  return (
    <div className="timetable-box">
      {noTimeLectures.length > 0 && (
        <div className="no-time-lecture-box">
          {noTimeLectures.map((lecture, index) => (
            <div key={index} className="no-time-lecture">
              <p className="no-time-lecture-lecName">{lecture.lecName}</p>
              <p className="no-time-lecture-lecProfessor">
                {lecture.lecProfessor}
              </p>
              {lecture.classroom && lecture.classroom.trim() !== "" && (
                <p className="no-time-lecture-classroom">
                  {lecture.classroom.length > 8
                    ? `${lecture.classroom.slice(0, 8)}...`
                    : lecture.classroom}
                </p>
              )}
              {lecture.memo && lecture.memo.trim() !== "" && (
                <p className="no-time-lecture-memo">
                  {lecture.memo.length > 10
                    ? `${lecture.memo.slice(0, 10)}...`
                    : lecture.memo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <table className="user-timetable">
        <thead>
          <tr>
            {daysOfWeek.map((day, index) => (
              <th key={index} className="day-header">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timetable.map((row, rowIndex) => (
            <tr key={rowIndex} className="timetable-row">
              <td className="period-cell">{rowIndex}</td>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="lecture-cell">
                  {cell.length > 0 ? (
                    cell.map((lecture, index) => (
                      <div
                        key={index}
                        className="lecture-item"
                        onClick={() =>
                          handleEditClick(lecture, rowIndex, cellIndex, index)
                        }
                      >
                        <p className="lecture-name">{lecture.lecName}</p>
                        <p className="lecture-professor">
                          {lecture.lecProfessor}
                        </p>
                        {lecture.classroom &&
                          lecture.classroom.trim() !== "" && (
                            <p className="lecture-professor">
                              {lecture.classroom.length > 8
                                ? `${lecture.classroom.slice(0, 8)}...`
                                : lecture.classroom}
                            </p>
                          )}
                        {lecture.isLecClose === 1 ? (
                          <>
                            <p className="listed-lec-timetable-isLecClose">
                              폐강된 강의
                            </p>
                          </>
                        ) : null}
                        {editingLectureIndex ===
                          `${rowIndex}-${cellIndex}-${index}` && (
                          <div className="edit-lecture">
                            <label className="edit-lecture-unckeck">
                              <input
                                type="checkbox"
                                checked={
                                  lecture.priority &&
                                  lecture.priority.split(" ").includes(priority)
                                }
                                onChange={() =>
                                  updateLecturePriority(
                                    lecture.lecNumber,
                                    priority
                                  )
                                }
                              />
                              체크해제
                            </label>

                            <input
                              type="text"
                              value={memo}
                              onChange={(e) => setMemo(e.target.value)}
                              placeholder="메모"
                              className="input-memo"
                            />
                            <input
                              type="text"
                              value={classroom}
                              onChange={(e) => setClassroom(e.target.value)}
                              placeholder="강의실"
                              className="input-classroom"
                            />
                            <button
                              onClick={() => handleUpdate(lecture)}
                              className="update-button"
                            >
                              완료
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-cell"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListedLectureTimeTable;
