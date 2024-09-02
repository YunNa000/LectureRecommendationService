import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import GyoYangLectureSearch from "./GyoYangLectureSearch";
import JunGongLectureSearch from "./JunGongLectureSearch.js";
import TotalLectureSearch from "./TotalLectureSearch.js";
import LectureList from "./LectureList";
import "./CallLecture-CircleList.css";

const CallLecture = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [lecClassification, setLecClassification] = useState("");
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
  const [lecCredit, setLecCredit] = useState(0);
  const [lecTimeTable, setlecTimeTable] = useState([]);
  const [activeButton, setActiveButton] = useState("");

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

  const fetchYearAndSemester = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/get_year_n_semester"
      );
      const { year: fetchedYear, semester: fetchedSemester } =
        response.data.year_n_semester;
      setYear(Number(fetchedYear));

      setSemester(fetchedSemester);
    } catch (err) {
      console.error("errr fetching year and semester", err);
    } finally {
      setLoading(false);
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
      year,
      semester,
      isPillSu,
      lectureName,
      lecCredit,
      lecTimeTable,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/lectures/",
        inputData
      );
      setLectures(response.data);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchYearAndSemester();
    }
  }, [user]);

  const handleGyoYangClick = () => {
    if (activeButton === "GyoYang") {
      setLecClassification("");
      setActiveComponent(null);
      setActiveButton("");
    } else {
      setLecClassification("교양");
      setActiveComponent("GyoYang");
      setActiveButton("GyoYang");
    }
  };

  const handleJunGongClick = () => {
    if (activeButton === "JunGong") {
      setLecClassification("");
      setActiveComponent(null);
      setActiveButton("");
    } else {
      setLecClassification("전공");
      setActiveComponent("JunGong");
      setActiveButton("JunGong");
    }
  };

  const handleTotalClick = () => {
    if (activeButton === "Total") {
      setLecClassification("");
      setActiveComponent(null);
      setActiveButton("");
    } else {
      setLecClassification("전체");
      setActiveComponent("Total");
      setActiveButton("Total");
    }
  };

  useEffect(() => {
    if (lecClassification) {
      fetchLectures();
    }
  }, [lecClassification, activeComponent]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>서버의 응답이 없어요.. {error.message}</div>;

  return (
    <div>
      <div className="CircleList">
        <button
          className="circle"
          onClick={() =>
            (window.location.href = "http://localhost:3000/mypage")
          }
        >
          my page
        </button>

        <button
          onClick={handleGyoYangClick}
          className={`circle ${activeButton === "GyoYang" ? "active" : ""}`}
        >
          교양 강의
        </button>
        <button
          onClick={handleJunGongClick}
          className={`circle ${activeButton === "JunGong" ? "active" : ""}`}
        >
          전공 강의
        </button>
        <button
          onClick={handleTotalClick}
          className={`circle ${activeButton === "Total" ? "active" : ""}`}
        >
          전체 강의
        </button>
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
          setLecCredit={setLecCredit}
          lecTimeTable={lecTimeTable}
          setlecTimeTable={setlecTimeTable}
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
          setLecCredit={setLecCredit}
          lecCredit={lecCredit}
          lecTimeTable={lecTimeTable}
          setlecTimeTable={setlecTimeTable}
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
          setYear={setYear}
          setSemester={setSemester}
          year={year}
          semester={semester}
          setLecCredit={setLecCredit}
          lecCredit={lecCredit}
          lecTimeTable={lecTimeTable}
          setlecTimeTable={setlecTimeTable}
        />
      )}
      {activeComponent && <LectureList lectures={lectures} />}
    </div>
  );
};

export default CallLecture;
