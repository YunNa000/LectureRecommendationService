import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Timetable = ({
  checkedLectures,
  year,
  semester,
  handleCheck,
  setListedLectures,
  completedLectures,
  setCompletedLectures,
}) => {
  const [editLecture, setEditLecture] = useState(null);
  const [classroom, setClassroom] = useState("");
  const [memo, setMemo] = useState("");
  const [warnings, setWarnings] = useState({});
  const [warningDetails, setWarningDetails] = useState({});
  const prevCheckedLecturesRef = useRef([]);

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
          userListedLecNumber: editLecture.userListedLecNumber,
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
          lecture.userListedLecNumber === editLecture.userListedLecNumber &&
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

  const handleCompleteClick = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/complete_lecture",
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
          takenLecCredit: lecture.lecCredit,
        },
        {
          withCredentials: true,
        }
      );

      setCompletedLectures((prev) => [
        ...prev,
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
          takenLecCredit: lecture.lecCredit,
        },
      ]);
    } catch (error) {
      console.error("Error completing lecture:", error);
    }
  };

  const handleUncompleteClick = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/uncomplete_lecture",
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
        },
        {
          withCredentials: true,
        }
      );

      setCompletedLectures((prev) =>
        prev.filter(
          (completedLecture) =>
            !(
              completedLecture.takenLecName === lecture.userListedLecName &&
              completedLecture.takenLecClassification ===
                lecture.lecClassification
            )
        )
      );
    } catch (error) {
      console.error("Error uncompleting lecture:", error);
    }
  };

  const isLectureCompleted = (lecture) => {
    return completedLectures.some(
      (completedLecture) =>
        completedLecture.takenLecName === lecture.userListedLecName &&
        completedLecture.takenLecClassification === lecture.lecClassification
    );
  };

  useEffect(() => {
    const previousCheckedLectures = prevCheckedLecturesRef.current;
    prevCheckedLecturesRef.current = checkedLectures;

    if (checkedLectures.length > previousCheckedLectures.length) {
      const updatedLectures = filteredCheckedLectures.map((lecture) => ({
        ...lecture,
      }));

      updatedLectures.forEach((lecture, index) => {
        if (index > 0 && index < updatedLectures.length - 1) {
          const prevLecture = updatedLectures[index - 1];
          const nextLecture = updatedLectures[index + 1];

          if (
            (prevLecture.userListedLecClassRoom.startsWith("누리") &&
              nextLecture.userListedLecClassRoom.startsWith("새빛")) ||
            (prevLecture.userListedLecClassRoom.startsWith("새빛") &&
              nextLecture.userListedLecClassRoom.startsWith("누리"))
          ) {
            setWarnings((prevWarnings) => ({
              ...prevWarnings,
              [index]: true,
            }));

            setWarningDetails((prevDetails) => ({
              ...prevDetails,
              [index]: {
                from: prevLecture.userListedLecClassRoom.includes("누리")
                  ? "누리"
                  : "새빛",
                to: nextLecture.userListedLecClassRoom.includes("누리")
                  ? "누리"
                  : "새빛",
              },
            }));

            setTimeout(() => {
              setWarnings((prevWarnings) => ({
                ...prevWarnings,
                [index]: false,
              }));
              setWarningDetails((prevDetails) => ({
                ...prevDetails,
                [index]: null,
              }));
            }, 5000);
          }
        }
      });
    }
  }, [checkedLectures]);

  const renderTimetable = () => {
    const days = [
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
      "일요일",
    ];
    const periods = [
      "0교시",
      "1교시",
      "2교시",
      "3교시",
      "4교시",
      "5교시",
      "6교시",
      "7교시",
      "8교시",
      "9교시",
      "10교시",
    ];

    let minRow = Infinity;
    let maxRow = 0;
    let maxCol = 0;

    filteredCheckedLectures.forEach((lecture) => {
      const times = lecture.userListedLecTime.match(/\((\d+):(\d+)\)/g);
      if (times) {
        times.forEach((time) => {
          const [_, col, row] = time.match(/\((\d+):(\d+)\)/);
          const rowNum = parseInt(row);
          const colNum = parseInt(col);
          if (rowNum > maxRow) maxRow = rowNum;
          if (rowNum < minRow) minRow = rowNum;
          if (colNum > maxCol) maxCol = colNum;
        });
      }
    });

    minRow = minRow === Infinity ? 1 : minRow;

    let timetable = Array(maxRow - minRow + 1)
      .fill(null)
      .map(() => Array(maxCol).fill(null));

    filteredCheckedLectures.forEach((lecture) => {
      const times = lecture.userListedLecTime.match(/\((\d+):(\d+)\)/g);
      if (times) {
        const timePositions = times.map((time) => {
          const [_, col, row] = time.match(/\((\d+):(\d+)\)/);
          return { col: parseInt(col), row: parseInt(row) };
        });

        const firstRow = Math.min(...timePositions.map((pos) => pos.row));
        const lastRow = Math.max(...timePositions.map((pos) => pos.row));

        timePositions.forEach((pos, index) => {
          const rowIndex = pos.row - minRow;
          const colIndex = pos.col - 1;

          let isOverlap = false;
          if (rowIndex < timetable.length && colIndex < timetable[0].length) {
            isOverlap = !!timetable[rowIndex][colIndex];
          }

          const cellContent = (
            <>
              <button onClick={() => handleEditClick(lecture)}>
                {pos.row === firstRow && <p>{lecture.userListedLecName}</p>}
                {pos.row === lastRow && !isOverlap && (
                  <small>
                    {lecture.lecProfessor} | {lecture.userListedLecClassRoom}
                  </small>
                )}
                {editLecture &&
                  editLecture.userListedLecNumber ===
                    lecture.userListedLecNumber && (
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
                      <div>
                        <button onClick={() => handleCheck(lecture)}>
                          uncheck
                        </button>
                        <button
                          onClick={() => {
                            isLectureCompleted(lecture)
                              ? handleUncompleteClick(lecture)
                              : handleCompleteClick(lecture);
                          }}
                        >
                          {isLectureCompleted(lecture)
                            ? "수강 완료 취소"
                            : "수강 완료"}
                        </button>
                      </div>
                    </div>
                  )}
              </button>
            </>
          );

          if (rowIndex < timetable.length && colIndex < timetable[0].length) {
            if (timetable[rowIndex][colIndex]) {
              timetable[rowIndex][colIndex] = (
                <>
                  {timetable[rowIndex][colIndex]}
                  <hr />
                  {cellContent}
                </>
              );
            } else {
              timetable[rowIndex][colIndex] = cellContent;
            }
          }
        });
      }
    });

    return (
      <div className="timetable-container">
        <table className="timetable">
          <thead>
            <tr>
              <th>
                <div></div>
              </th>
              {Array.from({ length: maxCol }, (_, index) => (
                <th key={index}>
                  <p>{days[index % days.length]}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>
                  <p>{periods[rowIndex + minRow]}</p>
                </td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <div>{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // CSS
  const styles = `
    .timetable-container {
      display: block;
      width: 100%;
      overflow-x: auto;
    }
  
    .timetable {
      width: 100%;
      border-collapse: collapse;
    }
  
    .timetable th,
    .timetable td {
      border: 1px solid #ddd;
      text-align: left;
      padding: 8px;
    }
  
    .timetable th {
      background-color: #f2f2f2;
    }
  
    .timetable thead tr th:first-child {
      width: 80px;
      height: 50px;
      background-color: red;
    }
  
    .timetable tbody tr td:first-child {
      width: 60px;
      height: 100px;
    }
  
    .timetable tbody tr td {
      min-height: 100px;
    }
  `;

  document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

  const renderNullLectures = () => {
    return filteredCheckedLectures
      .filter((lecture) => !lecture.userListedLecTime.match(/\((\d+):(\d+)\)/g))
      .map((lecture, index) => (
        <p key={index}>
          {lecture.userListedLecName} ({lecture.lecProfessor})
          <button onClick={() => handleCheck(lecture)}>uncheck</button>
          <button onClick={() => handleEditClick(lecture)}>수정</button>
          {editLecture &&
            editLecture.userListedLecNumber === lecture.userListedLecNumber && (
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
                <div>
                  <button
                    onClick={() => {
                      isLectureCompleted(lecture)
                        ? handleUncompleteClick(lecture)
                        : handleCompleteClick(lecture);
                    }}
                  >
                    {isLectureCompleted(lecture)
                      ? "수강 완료 취소"
                      : "수강 완료"}
                  </button>
                </div>
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
      <div>
        <div>
          <p>온라인</p>
        </div>
        <div>{renderNullLectures()}</div>
      </div>

      {Object.values(warnings).some((warning) => warning) &&
        (() => {
          const [index, details] =
            Object.entries(warningDetails).find(
              ([index, details]) => warnings[index] && details
            ) || [];
          return (
            details && (
              <p>
                {details.from}관에서 {details.to}관 사이의 거리는 700m 가까이
                돼요. 수많은 계단과 경사도 포함하죠. 15분이라는 시간이 촉박할
                수도 있어요.
              </p>
            )
          );
        })()}
    </div>
  );
};

export default Timetable;
