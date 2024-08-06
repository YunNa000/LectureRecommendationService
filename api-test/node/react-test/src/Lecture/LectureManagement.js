import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import LectureCallGyoPill from "./LectureCallGyoPill";
import LectureCallGyoSun from "./LectureCallGyoSun";
import LectureCallJunGong from "./LectureCallJunGong";
import LectureCallTotal from "./LectureCallTotal";
import LectureList from "./LectureList";

const LectureManagement = () => {
  const [userGrade, setUserGrade] = useState("");
  const [userBunban, setUserBunban] = useState("");
  const [lecClassification, setLecClassification] = useState("");
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedButton, setSelectedButton] = useState("교양");
  const [lecStars, setLecStars] = useState();
  const [lecAssignment, setlecAssignment] = useState();
  const [lecTeamplay, setlecTeamplay] = useState();
  const [lecGrade, setlecGrade] = useState();
  const [lecSubName, setlecSubName] = useState();
  const [lecClassName, setLecClassName] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  useEffect(() => {
    const fetchUserId = () => {
      const cookieUserId = Cookies.get("user_id");
      if (cookieUserId) {
        setUserId(cookieUserId);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get("http://localhost:8000/user/data", {
          withCredentials: true,
        });
        const userData = response.data[0];
        console.log("userData", userData);
        setUserGrade(userData.userYear || "");
        setUserBunban(userData.userBunban || "");
        setLecClassification(userData.userMajor || "");
        setSelectedLectures(userData.selectedLecNumbers || []);
      } catch (error) {
        console.error("fetch user data errrr:", error);
        alert(
          error.response?.data?.detail ||
            "유저 정보를 가져오는 중 오류가 발생했어요."
        );
      }
    };

    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  useEffect(() => {
    const fetchLatestYearSemester = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/other/now_year_n_semester"
        );
        const { latest_year, latest_semester } = response.data;
        setYear(latest_year);
        setSemester(latest_semester);
      } catch (error) {
        console.error("fetch latest year and semester error:", error);
        alert(error.response?.data?.detail || "errr fetching year & semester");
      }
    };

    fetchLatestYearSemester();
  }, []);

  const handleSubmitTotalLec = (event) => {
    event.preventDefault();

    axios
      .post(
        "http://127.0.0.1:8000/lectures/total",
        {
          userGrade: userGrade,
          userBunban: userBunban,
          lecClassification: lecClassification,
          lecStars: lecStars,
          lecAssignment: lecAssignment,
          lecTeamplay: lecTeamplay,
          lecGrade: lecGrade,
          lecSubName: lecSubName,
          lecClassName: lecClassName,
          year: year,
          semester: semester,
          userId: userId,
        },
        { withCredentials: true }
      )
      .then((response) => {
        setLectures(response.data);
      })
      .catch((error) => {
        console.error("fetch lec list errrr:", error);
        setLectures([{ lecClassName: "errrrr", lecNumber: error.message }]);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post(
        "http://127.0.0.1:8000/lectures",
        {
          userGrade: userGrade,
          userBunban: userBunban,
          lecClassification: lecClassification,
          lecStars: lecStars,
          lecAssignment: lecAssignment,
          lecTeamplay: lecTeamplay,
          lecGrade: lecGrade,
          lecSubName: lecSubName,
          lecClassName: lecClassName,
          userId: userId,
        },
        { withCredentials: true }
      )
      .then((response) => {
        setLectures(response.data);
      })
      .catch((error) => {
        console.error("fetch lec list errrr:", error);
        setLectures([{ lecClassName: "errrrr", lecNumber: error.message }]);
      });
  };

  const handleLectureSelect = async (lecNumber) => {
    if (!userId) {
      alert("로그인이 필요해요.");
      return;
    }

    const updatedSelectedLectures = selectedLectures.includes(lecNumber)
      ? selectedLectures.filter((num) => num !== lecNumber)
      : [...selectedLectures, lecNumber];

    setSelectedLectures(updatedSelectedLectures);

    try {
      await axios.post(
        "http://127.0.0.1:8000/user/update_select_lectures",
        {
          lecNumbers: updatedSelectedLectures,
          userId: userId,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("update select lectures errrr:", error);
      alert("강의 업데이트 중 오류가 발생했어요.");
    }
  };

  const renderSelectedComponent = () => {
    switch (selectedButton) {
      case "교필":
        return (
          <LectureCallGyoPill
            userGrade={userGrade}
            setUserGrade={setUserGrade}
            userBunban={userBunban}
            setUserBunban={setUserBunban}
            lecClassification={lecClassification}
            setLecClassification={setLecClassification}
            handleSubmit={handleSubmit}
            lecStars={lecStars}
            setLecStars={setLecStars}
            setlecAssignment={setlecAssignment}
            setlecTeamplay={setlecTeamplay}
            setlecGrade={setlecGrade}
            setlecSubName={setlecSubName}
            lecClassName={lecClassName}
            setLecClassName={setLecClassName}
          />
        );
      case "교선":
        return (
          <LectureCallGyoSun
            userGrade={userGrade}
            setUserGrade={setUserGrade}
            userBunban={userBunban}
            setUserBunban={setUserBunban}
            lecClassification={lecClassification}
            setLecClassification={setLecClassification}
            handleSubmit={handleSubmit}
            lecStars={lecStars}
            setLecStars={setLecStars}
            setlecAssignment={setlecAssignment}
            setlecTeamplay={setlecTeamplay}
            setlecGrade={setlecGrade}
            setlecSubName={setlecSubName}
            lecClassName={lecClassName}
            setLecClassName={setLecClassName}
          />
        );
      case "전공":
        return (
          <LectureCallJunGong
            userGrade={userGrade}
            setUserGrade={setUserGrade}
            userBunban={userBunban}
            setUserBunban={setUserBunban}
            lecClassification={lecClassification}
            setLecClassification={setLecClassification}
            setLecStars={setLecStars}
            setlecAssignment={setlecAssignment}
            setlecTeamplay={setlecTeamplay}
            setlecGrade={setlecGrade}
            handleSubmit={handleSubmit}
            lecClassName={lecClassName}
            setLecClassName={setLecClassName}
          />
        );
      case "전체":
        return (
          <LectureCallTotal
            userGrade={userGrade}
            setUserGrade={setUserGrade}
            userBunban={userBunban}
            setUserBunban={setUserBunban}
            handleSubmit={handleSubmitTotalLec}
            lecStars={lecStars}
            setLecStars={setLecStars}
            setlecAssignment={setlecAssignment}
            setlecTeamplay={setlecTeamplay}
            setlecGrade={setlecGrade}
            lecClassName={lecClassName}
            setLecClassName={setLecClassName}
            year={year}
            semester={semester}
            setYear={setYear}
            setSemester={setSemester}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setSelectedButton("교필")}>교필</button>
        <button onClick={() => setSelectedButton("교선")}>교선</button>
        <button onClick={() => setSelectedButton("전공")}>전공</button>
        <button onClick={() => setSelectedButton("전체")}>전체</button>
      </div>
      {renderSelectedComponent()}
      <LectureList
        lectures={lectures}
        selectedLectures={selectedLectures}
        handleLectureSelect={handleLectureSelect}
      />
    </div>
  );
};

export default LectureManagement;
