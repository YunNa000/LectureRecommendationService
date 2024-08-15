import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ListedLectureList from "./ListedLectureList";
import ListedLectureFilter from "./ListedLectureFilter";
import AddListedLectureManaully from "./AddListedLectureManually";
import ListedLectureTimeTable from "./ListedLectureTimeTable";
import ShowCheckedLectureCredit from "./ShowCheckedLectureCredit";

const ListedLecture = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(24);
  const [semester, setSemester] = useState("1학기");
  const [priority, setPriority] = useState("1순위");
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [totalGPA, setTotalGPA] = useState(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [majorCredits, setMajorCredits] = useState(0);
  const [gyoYangCredits, setGyoYangCredits] = useState(0);
  const [otherCredits, setOtherCredits] = useState(0);

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
          fetchTotalGPA(data.user_id);
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

  const getCheckedLectures = () => {
    return lectures.filter(
      (lecture) =>
        lecture.priority && lecture.priority.split(" ").includes(priority)
    );
  };

  const unselectLecture = async (lecNumber, year, semester) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/lecture_unselect",
        {
          user_id: user,
          lecNumber: lecNumber,
          year: year,
          semester: semester,
        }
      );
      fetchLectures(user);
    } catch (error) {
      console.error("err unlist lecture", error);
    }
  };

  const updateLectureInfo = async (lectureData) => {
    try {
      lectureData.user_id = user;
      const response = await axios.post(
        "http://localhost:8000/user/update_user_listed_lecture_info",
        lectureData
      );
      fetchLectures(user);
    } catch (error) {
      console.error("err update lecture info", error);
    }
  };

  const fetchTotalGPA = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/data/totalgpa",
        { user_id: userId }
      );
      setTotalGPA(response.data);
    } catch (error) {
      console.error("err update lecture info", error);
    }
  };

  useEffect(() => {
    const checkedLectures = getCheckedLectures();

    const total = checkedLectures.reduce(
      (sum, lecture) => sum + lecture.lecCredit,
      0
    );
    const major = checkedLectures
      .filter(
        (lecture) =>
          lecture.lecClassification === "전필" ||
          lecture.lecClassification === "전선"
      )
      .reduce((sum, lecture) => sum + lecture.lecCredit, 0);
    const gyoYang = checkedLectures
      .filter(
        (lecture) =>
          lecture.lecClassification === "교필" ||
          lecture.lecClassification === "교선"
      )
      .reduce((sum, lecture) => sum + lecture.lecCredit, 0);
    const other = checkedLectures
      .filter(
        (lecture) =>
          !["전필", "전선", "교필", "교선"].includes(lecture.lecClassification)
      )
      .reduce((sum, lecture) => sum + lecture.lecCredit, 0);

    setTotalCredits(total);
    setMajorCredits(major);
    setGyoYangCredits(gyoYang);
    setOtherCredits(other);
  }, [filteredLectures, priority]);

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
      <AddListedLectureManaully user={user} />
      <ShowCheckedLectureCredit
        totalCredits={totalCredits}
        majorCredits={majorCredits}
        gyoYangCredits={gyoYangCredits}
        otherCredits={otherCredits}
      />
      <ListedLectureList
        filteredLectures={filteredLectures}
        updateLecturePriority={updateLecturePriority}
        priority={priority}
        unselectLecture={unselectLecture}
        updateLectureInfo={updateLectureInfo}
        totalGPA={totalGPA}
        totalCredits={totalCredits}
      />
      <ListedLectureTimeTable
        lectures={getCheckedLectures()}
        priority={priority}
        updateLecturePriority={updateLecturePriority}
        updateLectureInfo={updateLectureInfo}
      />
    </div>
  );
};

export default ListedLecture;
