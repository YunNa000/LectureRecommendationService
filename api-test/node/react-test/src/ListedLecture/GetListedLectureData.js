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
