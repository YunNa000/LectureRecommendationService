import React, { useState, useEffect } from "react";
import axios from "axios";
import LectureList from "./LectureList";
import Timetable from "./TimeTable";
import SumCredit from "./SumCredit";

const GetListedLectureData = () => {
  const [listedLectures, setListedLectures] = useState([]);
  const [checkedLectures, setCheckedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lectures_data",
        {
          withCredentials: true,
        }
      );
      setListedLectures(response.data);
      const initialCheckedLectures = response.data.filter(
        (lecture) => lecture.isChecked
      );
      setCheckedLectures(initialCheckedLectures);
      setLoading(false);
      console.log("user listed lectures's data", response.data);
    } catch (error) {
      console.error("error fetching user data", error);
      setError(error);
      setLoading(false);
    }
  };

  const fetchLatestYearSemester = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/other/now_year_n_semester"
      );
      setYear(response.data.latest_year);
      setSemester(response.data.latest_semester);
    } catch (error) {
      console.error("error fetching latest year and semester", error);
    }
  };

  const handleCheck = async (lecture) => {
    const isChecked = !checkedLectures.includes(lecture);

    try {
      await axios.post(
        "http://localhost:8000/user/data/update_lecture_check_status",
        {
          lec_number: lecture.lecNumber,
          year: lecture.year,
          semester: lecture.semester,
          is_checked: isChecked,
        },
        { withCredentials: true }
      );

      setCheckedLectures((prev) =>
        isChecked ? [...prev, lecture] : prev.filter((item) => item !== lecture)
      );
    } catch (error) {
      console.error("error updating lecture check status", error);
    }
  };

  useEffect(() => {
    fetchLatestYearSemester();
    fetchUserData();
  }, []);

  const filteredLectures = listedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error fetching data</div>;
  }

  return (
    <div>
      <div>
        <label>
          Year:
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {Array.from(
              new Set(listedLectures.map((lecture) => lecture.year))
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Semester:
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            {Array.from(
              new Set(listedLectures.map((lecture) => lecture.semester))
            ).map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>
      </div>
      <LectureList
        lectures={filteredLectures}
        checkedLectures={checkedLectures}
        handleCheck={handleCheck}
      />
      <Timetable
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
      />
      <SumCredit
        listedLectures={filteredLectures}
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
      />
    </div>
  );
};

export default GetListedLectureData;
