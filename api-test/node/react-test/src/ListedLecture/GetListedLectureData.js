import React, { useEffect, useState } from "react";
import axios from "axios";
import LectureList from "./LectureList";
import Timetable from "./TimeTable";
import SumCredit from "./SumCredit";

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
    fetchUserData();
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error fetching data</div>;
  }

  return (
    <div>
      <LectureList
        lectures={listedLectures}
        checkedLectures={checkedLectures}
        handleCheck={handleCheck}
      />
      <Timetable checkedLectures={checkedLectures} />
      <SumCredit
        listedLectures={listedLectures}
        checkedLectures={checkedLectures}
      />
    </div>
  );
};

export default GetListedLectureData;
