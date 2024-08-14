import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const LectureList = ({ lectures }) => {
  const [user, setUser] = useState(null);
  const [selectedLectures, setSelectedLectures] = useState({});
  const [expandedLectures, setExpandedLectures] = useState({});

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
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("Login.js - checkLoginStatus");
      console.error(err);
    }
  };

  const handleCheckboxChange = async (lecture) => {
    const lecNumber = lecture.lecNumber;
    const year = lecture.year;
    const semester = lecture.semester;
    const lectureKey = `${lecNumber}-${year}-${semester}`;
    const isSelected = !!selectedLectures[lectureKey];

    if (isSelected) {
      try {
        await axios.post("http://localhost:8000/lecture_unselect", {
          user_id: user,
          lecNumber: lecNumber,
          year: year,
          semester: semester,
        });
        setSelectedLectures((prev) => {
          const newSelected = { ...prev };
          delete newSelected[lectureKey];
          return newSelected;
        });
      } catch (error) {
        console.error("LectureList.js when unselecting lecture:", error);
      }
    } else {
      try {
        await axios.post("http://localhost:8000/lecture_select", {
          user_id: user,
          lecNumber: lecNumber,
          year: year,
          semester: semester,
        });
        setSelectedLectures((prev) => ({
          ...prev,
          [lectureKey]: true,
        }));
      } catch (error) {
        console.error("LectureList.js when selecting lecture:", error);
      }
    }
  };

  const fetchSelectedLectures = async () => {
    if (!user) return;
    try {
      const response = await axios.post(
        "http://localhost:8000/selected_lecture",
        {
          user_id: user,
        }
      );
      const lecturesData = response.data.lectures || [];
      const selectedLecturesMap = {};
      lecturesData.forEach((lecture) => {
        const lectureKey = `${lecture.lecNumber}-${lecture.year}-${lecture.semester}`;
        selectedLecturesMap[lectureKey] = true;
      });
      setSelectedLectures(selectedLecturesMap);
    } catch (error) {
      console.error("Error fetching selected lectures", error);
    }
  };

  const groupLecturesByName = (lectures) => {
    return lectures.reduce((acc, lecture) => {
      const { lecName } = lecture;
      if (!acc[lecName]) {
        acc[lecName] = [];
      }
      acc[lecName].push(lecture);
      return acc;
    }, {});
  };

  const handleToggle = (lecName) => {
    setExpandedLectures((prev) => ({
      ...prev,
      [lecName]: !prev[lecName],
    }));
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    fetchSelectedLectures();
  }, [user]);

  const groupedLectures = groupLecturesByName(lectures);

  return (
    <div>
      {lectures.length === 0 ? (
        <p>조건에 맞는 강의가 없어요😥</p>
      ) : (
        Object.entries(groupedLectures).map(([lecName, lectureGroup]) => {
          const isSoloLecture = lectureGroup.length === 1;
          return (
            <div key={lecName}>
              {isSoloLecture ? (
                lectureGroup.map((lecture, index) => {
                  const lectureKey = `${lecture.lecNumber}-${lecture.year}-${lecture.semester}`;
                  return (
                    <div key={`${lecture.lectureID}-${index}`}>
                      <input
                        type="checkbox"
                        checked={!!selectedLectures[lectureKey]}
                        onChange={() => handleCheckboxChange(lecture)}
                      />
                      <label>
                        {lecture.moreInfo}
                        {lecture.lecName} | {lecture.lecProfessor} |{" "}
                        {lecture.lecCredit} | {lecture.lecTime} |{" "}
                        {lecture.lecClassroom} | {lecture.year}년{" "}
                        {lecture.semester}
                      </label>
                      <hr />
                    </div>
                  );
                })
              ) : (
                <>
                  <p
                    onClick={() => handleToggle(lecName)}
                    style={{ cursor: "pointer" }}
                  >
                    {expandedLectures[lecName] ? "▼" : "▲"} {lecName} (
                    {lectureGroup.length})
                  </p>
                  {expandedLectures[lecName] &&
                    lectureGroup.map((lecture, index) => {
                      const lectureKey = `${lecture.lecNumber}-${lecture.year}-${lecture.semester}`;
                      return (
                        <div key={`${lecture.lectureID}-${index}`}>
                          <input
                            type="checkbox"
                            checked={!!selectedLectures[lectureKey]}
                            onChange={() => handleCheckboxChange(lecture)}
                          />
                          <label>
                            {lecture.moreInfo}
                            {lecture.lecName} | {lecture.lecProfessor} |{" "}
                            {lecture.lecCredit} | {lecture.lecTime} |{" "}
                            {lecture.lecClassroom} | {lecture.year}년{" "}
                            {lecture.semester}
                          </label>
                          <hr />
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default LectureList;
