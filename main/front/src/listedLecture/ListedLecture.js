import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

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
      console.log(response.data);
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
      <h1>강의 목록</h1>
      <div>
        <label>
          연도:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label>
          학기:
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="1학기">1학기</option>
            <option value="여름학기">여름학기</option>
            <option value="2학기">2학기</option>
            <option value="겨울학기">겨울학기</option>
          </select>
        </label>
        <label>
          우선 순위:
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
      {filteredLectures.length > 0 ? (
        <div>
          {filteredLectures.map((lecture, index) => (
            <div key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={
                    lecture.priority &&
                    lecture.priority.split(" ").includes(priority)
                  }
                  onChange={() =>
                    updateLecturePriority(lecture.lecNumber, priority)
                  }
                />
                <span>{lecture.lecName}</span>
              </label>
              <small>
                {lecture.year}년 {lecture.semester}학기
              </small>
              <p>
                {lecture.lecNumber} | {lecture.priority} | {lecture.classroom} |{" "}
                {lecture.memo} | {lecture.lecTime} | {lecture.lecTheme} |{" "}
                {lecture.lecClassification} | {lecture.star} |{" "}
                {lecture.assignmentAmount} | {lecture.teamPlayAmount} |{" "}
                {lecture.gradeAmount} | {lecture.reviewSummary} |
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>등록된 강의가 없습니다.</p>
      )}
    </div>
  );
};

export default ListedLecture;
