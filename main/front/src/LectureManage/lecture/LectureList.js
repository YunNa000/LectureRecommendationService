import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./LectureList.css";

const LectureList = ({ lectures, selectedLectures, setSelectedLectures }) => {
  const [user, setUser] = useState(null);
  const [expandedLectures, setExpandedLectures] = useState({});
  const [visibleButtons, setVisibleButtons] = useState({}); // 새로운 상태 변수 추가

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

  const handleLectureSelect = async (lecture) => {
    const lecNumber = lecture.lecNumber;
    const year = lecture.year;
    const semester = lecture.semester;
    const lectureKey = `${lecNumber}-${year}-${semester}`;
    const isSelected = !!selectedLectures[lectureKey];

    try {
      if (isSelected) {
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
      } else {
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
      }
    } catch (error) {
      console.error("LectureList.js - lecture select/unselect error:", error);
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

  const handleButtonVisibilityToggle = (lectureKey) => {
    setVisibleButtons((prev) => ({
      ...prev,
      [lectureKey]: !prev[lectureKey],
    }));
  };

  const formatLectureTime = (lecTime) => {
    const dayMapping = {
      1: "월",
      2: "화",
      3: "수",
      4: "목",
      5: "금",
      6: "토",
      7: "일",
    };

    const dayPeriods = {};

    lecTime.split(",").forEach((slot) => {
      const [day, period] = slot.replace(/[()]/g, "").split(":");
      const dayName = dayMapping[day];

      if (!dayPeriods[dayName]) {
        dayPeriods[dayName] = [];
      }
      dayPeriods[dayName].push(period);
    });

    const timeSlots = Object.entries(dayPeriods).map(([day, periods]) => {
      const uniquePeriods = [...new Set(periods)].sort();
      return `${day}${uniquePeriods.join("")}`;
    });

    return timeSlots.join(", ");
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    fetchSelectedLectures();
  }, [user]);

  const groupedLectures = groupLecturesByName(lectures);

  return (
    <div className="lecturelist">
      {lectures.length === 0 ? (
        <div className="lecturelist-no-lecture">
          <p className="lecturelist-no-lecture-text">
            조건에 맞는 강의가 없어요😥
          </p>
        </div>
      ) : (
        Object.entries(groupedLectures).map(([lecName, lectureGroup]) => {
          const isSoloLecture = lectureGroup.length === 1;
          return (
            <div key={lecName} className="lecturelist-lecture">
              {isSoloLecture ? (
                lectureGroup.map((lecture, index) => {
                  const lectureKey = `${lecture.lecNumber}-${lecture.year}-${lecture.semester}`;
                  const isSelected = !!selectedLectures[lectureKey];
                  return (
                    <div
                      key={`${lecture.lectureID}-${index}`}
                      onClick={() => handleButtonVisibilityToggle(lectureKey)}
                    >
                      <label>
                        <p className="lecturelist-lecture-moreinfo">
                          {lecture.moreInfo}
                        </p>
                        <div className="lecturelist-lecNameNstar-box">
                          <div className="lecturelist-lecName-box">
                            {isSelected ? "✔️ " : ""}
                            <p className="lecturelist-lecName">
                              {lecture.lecName}
                            </p>
                            <p className="lecturelist-lecProfessor">
                              {lecture.lecProfessor}
                            </p>
                          </div>
                          <div className="lecturelist-lecStar-box"></div>
                        </div>
                        <div className="lecturelist-lec-detail">
                          <p className="lecturelist-lecClassification">
                            {lecture.lecClassification}
                          </p>
                          <p className="lecturelist-lecCredit">
                            {lecture.lecCredit}학점
                          </p>
                          <p className="lecturelist-lecTime">
                            {lecture.lecTime &&
                            !lecture.lecTime !== "undefined" &&
                            lecture.lecTime !== undefined ? (
                              <>{formatLectureTime(lecture.lecTime)}</>
                            ) : null}
                          </p>
                          <p className="lecturelist-lecClassroom">
                            {lecture.lecClassroom}
                          </p>
                        </div>
                        <div>
                          에타정보도 받아와야해요. 백엔드에서 return하는 값에
                          포함시켜야 해요.
                        </div>
                      </label>
                      {visibleButtons[lectureKey] && (
                        <div className="lecturelist-buttons">
                          <button
                            onClick={() => handleLectureSelect(lecture)}
                            className="lecture-list-button-getlecture"
                          >
                            {selectedLectures[lectureKey]
                              ? "강의 바구니에서 빼기"
                              : "강의 바구니에 담기"}
                          </button>
                          <button className="lecture-list-button-godetail">
                            강의 자세히 보기
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <p
                    onClick={() => handleToggle(lecName)}
                    style={{ cursor: "pointer" }}
                    className="lectureslist-samename-lectures-toggle"
                  >
                    {expandedLectures[lecName] ? "▼" : "▲"} {lecName} (
                    {lectureGroup.length})
                  </p>
                  {expandedLectures[lecName] &&
                    lectureGroup.map((lecture, index) => {
                      const lectureKey = `${lecture.lecNumber}-${lecture.year}-${lecture.semester}`;
                      return (
                        <div
                          key={`${lecture.lectureID}-${index}`}
                          onClick={() =>
                            handleButtonVisibilityToggle(lectureKey)
                          }
                          className="lecturelist-samename-lectures"
                        >
                          <label>
                            <p className="lecturelist-lecture-moreinfo">
                              {lecture.moreInfo}
                            </p>
                            <div className="lecturelist-lecNameNstar-box">
                              <div className="lecturelist-lecName-box">
                                <p className="lecturelist-lecName">
                                  {lecture.lecName}
                                </p>
                                <p className="lecturelist-lecProfessor">
                                  {lecture.lecProfessor}
                                </p>
                              </div>
                              <div className="lecturelist-lecStar-box"></div>
                            </div>
                            <div className="lecturelist-lec-detail">
                              <p className="lecturelist-lecClassification">
                                {lecture.lecClassification}
                              </p>
                              <p className="lecturelist-lecCredit">
                                {lecture.lecCredit}학점
                              </p>
                              <p className="lecturelist-lecTime">
                                {lecture.lecTime &&
                                !lecture.lecTime !== "undefined" &&
                                lecture.lecTime !== undefined ? (
                                  <>{formatLectureTime(lecture.lecTime)}</>
                                ) : null}
                              </p>
                              <p className="lecturelist-lecClassroom">
                                {lecture.lecClassroom}
                              </p>
                            </div>
                          </label>
                          {visibleButtons[lectureKey] && (
                            <div className="lecturelist-buttons">
                              <button
                                onClick={() => handleLectureSelect(lecture)}
                              >
                                {selectedLectures[lectureKey]
                                  ? "강의 취소"
                                  : "강의 담기"}
                              </button>
                              <div>테스트용버튼</div>
                            </div>
                          )}
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
