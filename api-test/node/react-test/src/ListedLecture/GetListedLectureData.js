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
  const [priority, setPriority] = useState("1순위");
  const [creditWarning, setCreditWarning] = useState("");
  const [grades, setGrades] = useState({
    totalGPA: 0,
  });

  const fetchGPA = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/total_gpa",
        {
          withCredentials: true,
        }
      );
      const userData = response.data;

      setGrades({
        totalGPA: userData.totalGPA,
      });
    } catch (error) {
      console.error("errr fetching user gpa", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lectures_data",
        {
          withCredentials: true,
        }
      );
      setListedLectures(response.data);
      const initialCheckedLectures = response.data.filter((lecture) =>
        lecture.priority.split(", ").includes(priority)
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
    const updatedPriority = isChecked
      ? `${lecture.priority}, ${priority}`
          .split(", ")
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ")
      : lecture.priority
          .split(", ")
          .filter((p) => p !== priority)
          .join(", ") || "0순위";

    try {
      await axios.post(
        "http://localhost:8000/user/data/update_lecture_priority",
        {
          lec_number: lecture.lecNumber,
          year: lecture.year,
          semester: lecture.semester,
          priority: updatedPriority,
        },
        { withCredentials: true }
      );

      setCheckedLectures((prev) =>
        isChecked ? [...prev, lecture] : prev.filter((item) => item !== lecture)
      );
      setListedLectures((prev) =>
        prev.map((item) =>
          item.lecNumber === lecture.lecNumber &&
          item.year === lecture.year &&
          item.semester === lecture.semester
            ? { ...item, priority: updatedPriority }
            : item
        )
      );
    } catch (error) {
      console.error("error updating lecture priority", error);
    }
  };

  const handleDelete = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/delete_lecture",
        {
          lec_number: lecture.lecNumber,
          year: lecture.year,
          semester: lecture.semester,
        },
        { withCredentials: true }
      );

      setListedLectures((prev) => prev.filter((item) => item !== lecture));
      setCheckedLectures((prev) => prev.filter((item) => item !== lecture));
    } catch (error) {
      console.error("error deleting lecture", error);
    }
  };

  useEffect(() => {
    fetchLatestYearSemester();
    fetchUserData();
    fetchGPA();
  }, []);

  useEffect(() => {
    const updatedCheckedLectures = listedLectures.filter((lecture) =>
      lecture.priority.split(", ").includes(priority)
    );
    setCheckedLectures(updatedCheckedLectures);
  }, [listedLectures, priority]);

  const filteredLectures = listedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );
  const filteredCheckedLectures = checkedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );

  const checkedCredits = filteredCheckedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );
  useEffect(() => {
    if (grades.totalGPA < 3.5) {
      if (checkedCredits > 19) {
        setCreditWarning("최대 19학점까지 들을 수 있어요.");
      } else {
        setCreditWarning("");
      }
    } else if (grades.totalGPA >= 3.5) {
      if (checkedCredits > 22) {
        setCreditWarning("최대 22학점까지 들을 수 있어요.");
      } else {
        setCreditWarning("");
      }
    } else {
      setCreditWarning("");
    }
  }, [checkedCredits, grades.totalGPA]);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error fetching data</div>;
  }

  return (
    <div>
      <SumCredit
        listedLectures={filteredLectures}
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
      />
      {creditWarning && <div>{creditWarning}</div>}

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
        <label>
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="1순위">1순위</option>
            <option value="2순위">2순위</option>
            <option value="3순위">3순위</option>
          </select>
        </label>
      </div>
      <LectureList
        lectures={filteredLectures}
        checkedLectures={checkedLectures}
        handleCheck={handleCheck}
        handleDelete={handleDelete}
      />
      <Timetable
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
      />
    </div>
  );
};

export default GetListedLectureData;
