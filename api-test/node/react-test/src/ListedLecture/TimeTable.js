import React from "react";

const Timetable = ({ checkedLectures, year, semester, handleCheck }) => {
  const filteredCheckedLectures = checkedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );

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
              {`${lecture.lecClassName} (${lecture.lecProfessor})`}
              <button onClick={() => handleCheck(lecture)}>uncheck</button>
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
