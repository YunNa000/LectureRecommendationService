import React from "react";

const Timetable = ({ checkedLectures }) => {
  const renderTimetable = () => {
    let timetable = Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));

    checkedLectures.forEach((lecture) => {
      const times = lecture.lecTime.match(/\((\d+):(\d+)\)/g);
      times.forEach((time) => {
        const [_, col, row] = time.match(/\((\d+):(\d+)\)/);

        // 배열의 크기를 동적으로 조정
        while (timetable.length < row) {
          timetable.push(Array(timetable[0].length).fill(null));
        }
        while (timetable[0].length < col) {
          timetable = timetable.map((row) => [...row, null]);
        }

        timetable[row - 1][
          col - 1
        ] = `${lecture.lecClassName} (${lecture.lecProfessor})`;
      });
    });

    return timetable.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, colIndex) => (
          <td key={colIndex}>{cell}</td>
        ))}
      </tr>
    ));
  };

  return (
    <table border="1">
      <tbody>{renderTimetable()}</tbody>
    </table>
  );
};

export default Timetable;
