import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ListedLectureList from "./ListedLectureList";
import ListedLectureFilter from "./ListedLectureFilter";

const ListedLecture = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(24);
  const [semester, setSemester] = useState("1학기");
  const [priority, setPriority] = useState("1순위");
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch("http://localhost:8000/", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.user_id) {
          setUser(data.user_id);
          fetchLectures(data.user_id);
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("ListedLecture.js - checkLogin");
      console.error(err);
    }
  };

  const fetchYearAndSemester = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/get_year_n_semester"
      );
      const { year: fetchedYear, semester: fetchedSemester } =
        response.data.year_n_semester;
      setYear(fetchedYear);
      setSemester(fetchedSemester);
    } catch (err) {
      console.error("errr fetching year and semester", err);
    }
  };

  const fetchLectures = async (userID) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/listed_lecture",
        { user_id: userID }
      );
      setLectures(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const filterLectures = () => {
    const filtered = lectures.filter((lecture) => {
      return lecture.year === year && lecture.semester === semester;
    });
    setFilteredLectures(filtered);
  };

  const updateLecturePriority = async (lecNumber, newPriority) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/update_listed_lecture_priority",
        {
          user_id: user,
          lecNumber: lecNumber,
          year: year,
          semester: semester,
          priority: newPriority,
        }
      );
      fetchLectures(user);
    } catch (err) {
      console.error("err update lecture priority", err);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchYearAndSemester();
      fetchLectures(user);
    }
  }, [user]);

  useEffect(() => {
    filterLectures();
  }, [year, semester, lectures]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>서버의 응답이 없어요.. {error.message}</div>;

  return (
    <div>
      <ListedLectureFilter
        year={year}
        setYear={setYear}
        semester={semester}
        setSemester={setSemester}
        priority={priority}
        setPriority={setPriority}
      />
      <ListedLectureList
        filteredLectures={filteredLectures}
        updateLecturePriority={updateLecturePriority}
        priority={priority}
      />
    </div>
  );
};

export default ListedLecture;
