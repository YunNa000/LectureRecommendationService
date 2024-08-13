import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import GyoYangLectureSearch from "./GyoYangLectureSearch";
import JunGongLectureSearch from "./JunGongLectureSearch.js";
import TotalLectureSearch from "./TotalLectureSearch.js";
import LectureList from "./LectureList";

const CallLecture = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [lecClassification, setLecClassification] = useState("전공");
  const [isPillSu, setIsPillSu] = useState(false);
  const [lecTheme, setLecTheme] = useState("");
  const [teamplayAmount, setTeamplayAmount] = useState("상관없음");
  const [gradeAmount, setGradeAmount] = useState("상관없음");
  const [assignmentAmount, setAssignmentAmount] = useState("상관없음");
  const [star, setStar] = useState(0);
  const [activeComponent, setActiveComponent] = useState(null);
  const [lectureName, setLectureName] = useState("");
  const [year, setYear] = useState(24);
  const [semester, setSemester] = useState("1학기");

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
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("CallLecture.js - checkLogin");
      console.error(err);
    }
  };

  const fetchLectures = async () => {
    const inputData = {
      user_id: user,
      lecClassification,
      lecTheme,
      teamplayAmount,
      gradeAmount,
      assignmentAmount,
      star,
      userWantTime: "",
      year, // get_now_year_n_semester 으로 year와 semester 가져오기
      semester,
      isPillSu,
      lectureName,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/lectures/",
        inputData
      );
      setLectures(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchLectures();
    }
  }, [
    user,
    lecClassification,
    lecTheme,
    teamplayAmount,
    gradeAmount,
    assignmentAmount,
    star,
    isPillSu,
  ]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>서버의 응답이 없어요.. {error.message}</div>;

  const handleGyoYangClick = () => {
    setLecClassification("교양");
    setActiveComponent("GyoYang");
  };

  const handleJunGongClick = () => {
    setLecClassification("전공");
    setActiveComponent("JunGong");
  };

  const handleTotalClick = () => {
    setLecClassification("전체");
    setActiveComponent("Total");
  };

  return (
    <div>
      <div>
        <button onClick={handleGyoYangClick}>교양 강의 검색</button>
        <button onClick={handleJunGongClick}>전공 강의 검색</button>
        <button onClick={handleTotalClick}>전체 강의 검색</button>
      </div>

      {activeComponent === "GyoYang" && (
        <GyoYangLectureSearch
          lecClassification={lecClassification}
          setLecClassification={setLecClassification}
          isPillSu={isPillSu}
          setIsPillSu={setIsPillSu}
          lecTheme={lecTheme}
          setLecTheme={setLecTheme}
          teamplayAmount={teamplayAmount}
          setTeamplayAmount={setTeamplayAmount}
          gradeAmount={gradeAmount}
          setGradeAmount={setGradeAmount}
          assignmentAmount={assignmentAmount}
          setAssignmentAmount={setAssignmentAmount}
          star={star}
          setStar={setStar}
          fetchLectures={fetchLectures}
          setLectureName={setLectureName}
          lectureName={lectureName}
        />
      )}

      {activeComponent === "JunGong" && (
        <JunGongLectureSearch
          lecClassification={lecClassification}
          setLecClassification={setLecClassification}
          isPillSu={isPillSu}
          setIsPillSu={setIsPillSu}
          lecTheme={lecTheme}
          setLecTheme={setLecTheme}
          teamplayAmount={teamplayAmount}
          setTeamplayAmount={setTeamplayAmount}
          gradeAmount={gradeAmount}
          setGradeAmount={setGradeAmount}
          assignmentAmount={assignmentAmount}
          setAssignmentAmount={setAssignmentAmount}
          star={star}
          setStar={setStar}
          fetchLectures={fetchLectures}
          setLectureName={setLectureName}
          lectureName={lectureName}
        />
      )}

      {activeComponent === "Total" && (
        <TotalLectureSearch
          teamplayAmount={teamplayAmount}
          setTeamplayAmount={setTeamplayAmount}
          gradeAmount={gradeAmount}
          setGradeAmount={setGradeAmount}
          assignmentAmount={assignmentAmount}
          setAssignmentAmount={setAssignmentAmount}
          star={star}
          setStar={setStar}
          fetchLectures={fetchLectures}
          setLectureName={setLectureName}
          lectureName={lectureName}
        />
      )}

      <LectureList lectures={lectures} />
    </div>
  );
};

export default CallLecture;
