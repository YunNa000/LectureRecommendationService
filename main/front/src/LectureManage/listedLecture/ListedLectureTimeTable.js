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

  const noTimeLectures = [];

  const timetable = Array.from({ length: maxHour }, () =>
    Array(daysOfWeek.length - 1)
      .fill(null)
      .map(() => ({ lectures: [], conflict: false }))
  );

  lectures.forEach((lecture) => {
    if (lecture.lecTime && lecture.lecTime !== "0" && lecture.lectime == null) {
      const times = lecture.lecTime.split(",");
      times.forEach((time) => {
        const [day, hour] = time.replace(/[()]/g, "").split(":").map(Number);
        if (hour >= 0 && hour < timetable.length) {
          const cell = timetable[hour][day - 1];
          if (cell.lectures.length > 0) {
            cell.conflict = true;
          }
          cell.lectures.push(lecture);
        }
      });
    } else {
      noTimeLectures.push(lecture);
    }
  });

  function stringToRGB(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const r = (((hash & 0xff0000) >> 16) % 86) + 170;
    const g = (((hash & 0x00ff00) >> 8) % 86) + 170;
    const b = ((hash & 0x0000ff) % 86) + 170;

    return `rgb(${r}, ${g}, ${b})`;
  }

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
                  {cell.lectures.length > 0 ? (
                    cell.lectures.map((lecture, index) => (
                      <div
                        key={index}
                        className="lecture-clickable"
                        onClick={() =>
                          handleEditClick(lecture, rowIndex, cellIndex, index)
                        }
                        style={{
                          backgroundColor: `${stringToRGB(lecture.lecName)}`,
                        }}
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
                          <p className="listed-lec-timetable-isLecClose">
                            폐강된 강의
                          </p>
                        ) : null}
                        {editingLectureIndex ===
                          `${rowIndex}-${cellIndex}-${index}` && (
                          <>
                            <div
                              className="modal-overlay"
                              onClick={() => handleUpdate(lecture)}
                            />
                            <div className="edit-lecture">
                              <p className="listed-lec-timetable-more-lecName">
                                {lecture.lecName}
                              </p>
                              <p className="listed-lec-timetable-more-lecProfessor">
                                {lecture.lecProfessor}
                              </p>
                              <button
                                className="edit-lecture-unckeck"
                                onClick={() => {
                                  const confirmRemove = window.confirm(
                                    "정말로 시간표에서 제외하시겠습니까?"
                                  );
                                  if (confirmRemove) {
                                    updateLecturePriority(
                                      lecture.lecNumber,
                                      priority
                                    );
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    lecture.priority &&
                                    lecture.priority
                                      .split(" ")
                                      .includes(priority)
                                  }
                                  readOnly
                                />
                                <p className="edit-lecture-uncheck-text">
                                  시간표에서 제외하기
                                </p>
                              </button>

                              <input
                                type="text"
                                value={classroom}
                                onChange={(e) => setClassroom(e.target.value)}
                                placeholder="강의실"
                                className="input-classroom"
                              />
                              <input
                                type="text"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="메모"
                                className="input-memo"
                              />
                              <button
                                onClick={() => handleUpdate(lecture)}
                                className="update-button"
                              >
                                완료
                              </button>
                              <button className="detail-a-button">
                                강의 자세히 보기
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-cell"></div>
                  )}
                  {cell.conflict && (
                    <p className="conflict-message">시간이 겹쳐요!</p>
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
