import React, { useEffect, useState, useCallback } from "react";
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
  const [takenLectures, setTakenLectures] = useState(null);

  const checkLoginStatus = useCallback(async () => {
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
          getTakenLecture(data.user_id);
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("ListedLecture.js - checkLogin");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

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
      console.log(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const filterLectures = useCallback(() => {
    const filtered = lectures.filter((lecture) => {
      return lecture.year === year && lecture.semester === semester;
    });
    setFilteredLectures(filtered);
  }, [year, semester, lectures]);

  const updateLecturePriority = async (lecNumber, newPriority) => {
    try {
      await axios.post(
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

  const getCheckedLectures = useCallback(() => {
    return lectures.filter(
      (lecture) =>
        lecture.priority &&
        lecture.priority.split(" ").includes(priority) &&
        lecture.year === year &&
        lecture.semester === semester
    );
  }, [lectures, priority, year, semester]);

  const unselectLecture = async (lecNumber, year, semester) => {
    try {
      await axios.post("http://localhost:8000/lecture_unselect", {
        user_id: user,
        lecNumber: lecNumber,
        year: year,
        semester: semester,
      });
      fetchLectures(user);
    } catch (error) {
      console.error("err unlist lecture", error);
    }
  };

  const updateLectureInfo = async (lectureData) => {
    try {
      lectureData.user_id = user;
      await axios.post(
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

  const getTakenLecture = async (user) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/get_taken_lectures",
        { user_id: user },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setTakenLectures(response.data.taken_lectures);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  const markLectureAsCompleted = async (lectureData) => {
    try {
      lectureData.user_id = user;
      await axios.post(
        "http://localhost:8000/user/add_taken_lecture_auto",
        lectureData
      );
      fetchLectures(user);
    } catch (error) {
      console.error("err update lecture info", error);
    }
  };

  useEffect(() => {
    const checkedLectures = getCheckedLectures();

    const total = Math.floor(
      checkedLectures.reduce(
        (sum, lecture) => Math.floor(sum) + Math.floor(lecture.lecCredit),
        0
      )
    );
    const major = Math.floor(
      checkedLectures
        .filter(
          (lecture) =>
            lecture.lecClassification === "전필" ||
            lecture.lecClassification === "전선"
        )
        .reduce((sum, lecture) => sum + lecture.lecCredit, 0)
    );
    const gyoYang = Math.floor(
      checkedLectures
        .filter(
          (lecture) =>
            lecture.lecClassification === "교필" ||
            lecture.lecClassification === "교선"
        )
        .reduce((sum, lecture) => sum + lecture.lecCredit, 0)
    );
    const other = Math.floor(
      checkedLectures
        .filter(
          (lecture) =>
            !["전필", "전선", "교필", "교선"].includes(
              lecture.lecClassification
            )
        )
        .reduce((sum, lecture) => sum + lecture.lecCredit, 0)
    );

    setTotalCredits(total);
    setMajorCredits(major);
    setGyoYangCredits(gyoYang);
    setOtherCredits(other);
  }, [filteredLectures, year, semester, priority, getCheckedLectures]);

  useEffect(() => {
    if (user) {
      fetchYearAndSemester();
      fetchLectures(user);
    }
  }, [user]);

  useEffect(() => {
    filterLectures();
  }, [year, semester, lectures, filterLectures]);

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
        user={user}
        fetchLectures={fetchLectures}
      />

      <ShowCheckedLectureCredit
        totalCredits={totalCredits}
        majorCredits={majorCredits}
        gyoYangCredits={gyoYangCredits}
        otherCredits={otherCredits}
      />
      <ListedLectureTimeTable
        lectures={getCheckedLectures()}
        priority={priority}
        updateLecturePriority={updateLecturePriority}
        updateLectureInfo={updateLectureInfo}
      />
      <ListedLectureList
        filteredLectures={filteredLectures}
        updateLecturePriority={updateLecturePriority}
        priority={priority}
        unselectLecture={unselectLecture}
        updateLectureInfo={updateLectureInfo}
        totalGPA={totalGPA}
        totalCredits={totalCredits}
        markLectureAsCompleted={markLectureAsCompleted}
        takenLectures={takenLectures}
      />
    </div>
  );
};

export default ListedLecture;
