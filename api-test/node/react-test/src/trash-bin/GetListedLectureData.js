import React, { useEffect, useState } from "react";
import axios from "axios";

const GetListedLectureData = () => {
  const [listedLectures, setListedLectures] = useState([]);
  const [checkedLectures, setCheckedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lectures_data",
        {
          withCredentials: true,
        }
      );
      setListedLectures(response.data);
      setLoading(false);
      console.log("user listed lectures's data", response.data);
    } catch (error) {
      console.error("error fetching user data", error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleCheck = (lecture) => {
    setCheckedLectures((prev) =>
      prev.includes(lecture)
        ? prev.filter((item) => item !== lecture)
        : [...prev, lecture]
    );
  };

  const renderTimetable = () => {
    let timetable = Array(5)
      .fill(null)
      .map(() => Array(7).fill(null));

    checkedLectures.forEach((lecture) => {
      const times = lecture.lecTime.match(/\((\d+):(\d+)\)/g);
      times.forEach((time) => {
        const [_, col, row] = time.match(/\((\d+):(\d+)\)/);

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

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error fetching data</div>;
  }

  return (
    <div>
      {listedLectures.length === 0 ? (
        <div>선택한 강의가 없어요.</div>
      ) : (
        <div>
          {listedLectures.map((lecture, index) => (
            <div key={index}>
              <input
                type="checkbox"
                onChange={() => handleCheck(lecture)}
                checked={checkedLectures.includes(lecture)}
              />
              <p>
                {lecture.lecClassName}
                <small>
                  {lecture.lecProfessor} | {lecture.lecTime}
                </small>
              </p>
            </div>
          ))}
          <table border="1">
            <tbody>{renderTimetable()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetListedLectureData;
