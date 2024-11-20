import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./LectureList.css";
import "../../loader.css";
import { useNavigate } from "react-router-dom";

const LectureList = ({
  lectures,
  selectedLectures,
  setSelectedLectures,
  showSpinner,
}) => {
  const [user, setUser] = useState(null);
  const [expandedLectures, setExpandedLectures] = useState({});
  const [visibleButtons, setVisibleButtons] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const groupedLectures = groupLecturesByName(lectures);
    const initialExpandedState = {};
    Object.keys(groupedLectures).forEach((lecName) => {
      initialExpandedState[lecName] = true;
    });
    setExpandedLectures(initialExpandedState);
  }, [lectures]);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/`, {
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
        await axios.post(`${process.env.REACT_APP_API_URL}/lecture_unselect`, {
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
        await axios.post(`${process.env.REACT_APP_API_URL}/lecture_select`, {
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
        `${process.env.REACT_APP_API_URL}/selected_lecture`,
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

  const renderStarRatingImages = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    for (let i = 0; i < fullStars; i++) {
      stars.push("★");
    }
    if (halfStar === 1) {
      stars.push("✮");
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push("☆");
    }

    return <p className="lecture-list-star">{stars}</p>;
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

  const getColor = (value) => {
    const red = Math.max(50, 255 - value * 2.3);
    const green = Math.max(0, value * 2 + 25);
    return `rgb(${red}, ${green}, 0)`;
  };

  const getWidth = (amount, what) => {
    console.log(what, amount);
    if (what === "assignment") {
      if (amount === 0.1) {
        return null;
      }
      return amount;
    } else if (what === "grade" || what === "teamplay") {
      if (amount === 0.1 || amount === 0.1) {
        return null;
      }
      return 100 - amount;
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    fetchSelectedLectures();
  }, [user]);

  const isItHard = (amount, what) => {
    console.log(amount);
    if (what === "assignment") {
      if (amount === (0.1 || 99.9)) {
        return "정보 없음";
      } else if (amount >= 70) {
        return "적음";
      } else if (amount >= 50) {
        return "보통";
      } else if (amount > 0) {
        return "많음";
      }
    } else if (what === "grade") {
      if (amount === 0.1 || amount === 99.9) {
        return "정보 없음";
      } else if (amount >= 70) {
        return "쉬움";
      } else if (amount >= 50) {
        return "보통";
      } else if (amount > 0) {
        return "힘듦";
      }
    } else if (what === "teamplay") {
      if (amount === (0.1 || 99.9)) {
        return "정보 없음";
      } else if (amount >= 70) {
        return "많음";
      } else if (amount >= 50) {
        return "보통";
      } else if (amount > 0) {
        return "적음";
      }
    }

    return "정보 없음";
  };

  if (showSpinner) {
    return (
      <div className="lecturelist">
        <div className="loader">
          <div className="spinner"></div>
          <p>강의들을 불러오고 있어요.</p>
        </div>
      </div>
    );
  }
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
                      <label className="lecturelist-lecture-check-box">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleLectureSelect(lecture)}
                        />
                        <div className="lecturelist-lecNameNstar-box">
                          <div className="lecturelist-lecName-box">
                            <p className="lecturelist-lecName">
                              {lecture.lecName}
                            </p>
                            <p className="lecturelist-lecProfessor">
                              {lecture.lecProfessor}
                            </p>
                          </div>
                          <div className="lecturelist-lecStar-box">
                            {renderStarRatingImages(lecture.star)}
                          </div>
                        </div>
                      </label>
                      <p className="lecturelist-lecture-moreinfo">
                        {lecture.moreInfo}
                      </p>
                      <div className="lecturelist-lec-detail">
                        <p className="lecturelist-lecNumber">
                          {lecture.lecNumber}
                        </p>
                        <p className="lecturelist-lecTime">
                          {lecture.lecTime &&
                          lecture.lecTime !== "undefined" &&
                          lecture.lecTime !== undefined ? (
                            <>{formatLectureTime(lecture.lecTime)}</>
                          ) : null}
                        </p>
                      </div>
                      <div className="lecturelist-lec-detail">
                        <p className="lecturelist-lecClassification">
                          {lecture.lecClassification}
                        </p>
                        {lecture.lecTheme && lecture.lecTheme.trim() !== "" && (
                          <p className="lecturelist-lecTheme">
                            ({lecture.lecTheme})
                          </p>
                        )}
                        <p className="lecturelist-lecCredit">
                          {lecture.lecCredit}학점
                        </p>
                        <p className="lecturelist-lecClassroom">
                          {lecture.lecClassroom}
                        </p>
                      </div>
                      {visibleButtons[lectureKey] && (
                        <>
                          <div className="lecturelist-reviewSummary">
                            <p className="lecturelist-reviewSummary-text">
                              {lecture.reviewSummary}
                            </p>
                          </div>
                          <div className="lecturelist-expanded">
                            <div className="lecturelist-amount">
                              <div className="lecturelist-amount-infoNbar">
                                <p className="lecturelist-amount-info-text">
                                  과제
                                </p>
                                <div className="lecturelist-bar">
                                  <div
                                    className="lecturelist-bar-fill"
                                    style={{
                                      width: `${getWidth(
                                        lecture.assignmentAmount,
                                        "assignment"
                                      )}%`,
                                      backgroundColor: getColor(
                                        lecture.assignmentAmount
                                      ),
                                    }}
                                  />
                                </div>
                                <p className="lecturelist-amount-info-text">
                                  {isItHard(
                                    lecture.assignmentAmount,
                                    "assignment"
                                  )}
                                </p>
                              </div>
                              <div className="lecturelist-amount-infoNbar">
                                <p className="lecturelist-amount-info-text">
                                  성적
                                </p>
                                <div className="lecturelist-bar">
                                  <div
                                    className="lecturelist-bar-fill"
                                    style={{
                                      width: `${getWidth(
                                        lecture.gradeAmount,
                                        "grade"
                                      )}%`,
                                      backgroundColor: getColor(
                                        100 - lecture.gradeAmount
                                      ),
                                    }}
                                  />
                                </div>
                                <p className="lecturelist-amount-info-text">
                                  {isItHard(100 - lecture.gradeAmount, "grade")}
                                </p>
                              </div>
                              <div className="lecturelist-amount-infoNbar">
                                <p className="lecturelist-amount-info-text">
                                  팀플
                                </p>
                                <div className="lecturelist-bar">
                                  <div
                                    className="lecturelist-bar-fill"
                                    style={{
                                      width: `${getWidth(
                                        lecture.teamPlayAmount,
                                        "teamplay"
                                      )}%`,
                                      backgroundColor: getColor(
                                        100 - lecture.teamPlayAmount
                                      ),
                                    }}
                                  />
                                </div>
                                <p className="lecturelist-amount-info-text">
                                  {isItHard(lecture.teamPlayAmount, "teamplay")}
                                </p>
                              </div>
                            </div>
                            <div className="lecturelist-buttons">
                              <button
                                className="lecture-list-button-godetail"
                                onClick={() =>
                                  navigate(
                                    `/lecture/${lecture.year}/${lecture.semester}/${lecture.lecNumber}`
                                  )
                                }
                              >
                                강의 자세히 보기
                              </button>
                            </div>
                          </div>
                        </>
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
                      const isSelected = !!selectedLectures[lectureKey];
                      return (
                        <div
                          key={`${lecture.lectureID}-${index}`}
                          className="lecturelist-samename-lectures"
                          onClick={() =>
                            handleButtonVisibilityToggle(lectureKey)
                          }
                        >
                          <label className="lecturelist-lecture-check-box">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleLectureSelect(lecture)}
                            />
                            <div className="lecturelist-lecNameNstar-box">
                              <div className="lecturelist-lecName-box">
                                <p className="lecturelist-lecName">
                                  {lecture.lecName}
                                </p>
                                <p className="lecturelist-lecProfessor">
                                  {lecture.lecProfessor}
                                </p>
                              </div>
                              <div className="lecturelist-lecStar-box">
                                {renderStarRatingImages(lecture.star)}
                              </div>
                            </div>
                          </label>
                          <p className="lecturelist-lecture-moreinfo">
                            {lecture.moreInfo}
                          </p>
                          <div className="lecturelist-lec-detail">
                            <p className="lecturelist-lecNumber">
                              {lecture.lecNumber}
                            </p>
                            <p className="lecturelist-lecTime">
                              {lecture.lecTime &&
                              lecture.lecTime !== "undefined" &&
                              lecture.lecTime !== undefined ? (
                                <>{formatLectureTime(lecture.lecTime)}</>
                              ) : null}
                            </p>
                          </div>
                          <div className="lecturelist-lec-detail">
                            <p className="lecturelist-lecClassification">
                              {lecture.lecClassification}
                            </p>
                            {lecture.lecTheme &&
                              lecture.lecTheme.trim() !== "" && (
                                <p className="lecturelist-lecTheme">
                                  ({lecture.lecTheme})
                                </p>
                              )}
                            <p className="lecturelist-lecCredit">
                              {lecture.lecCredit}학점
                            </p>
                            <p className="lecturelist-lecClassroom">
                              {lecture.lecClassroom}
                            </p>
                          </div>
                          {visibleButtons[lectureKey] && (
                            <>
                              <div className="lecturelist-reviewSummary">
                                <p className="lecturelist-reviewSummary-text">
                                  {lecture.reviewSummary}
                                </p>
                              </div>
                              <div className="lecturelist-expanded">
                                <div className="lecturelist-amount">
                                  <div className="lecturelist-amount-infoNbar">
                                    <p className="lecturelist-amount-info-text">
                                      과제
                                    </p>
                                    <div className="lecturelist-bar">
                                      <div
                                        className="lecturelist-bar-fill"
                                        style={{
                                          width: `${getWidth(
                                            lecture.assignmentAmount,
                                            "assignment"
                                          )}%`,
                                          backgroundColor: getColor(
                                            lecture.assignmentAmount
                                          ),
                                        }}
                                      />
                                    </div>
                                    <p className="lecturelist-amount-info-text">
                                      {isItHard(
                                        lecture.assignmentAmount,
                                        "assignment"
                                      )}
                                    </p>
                                  </div>
                                  <div className="lecturelist-amount-infoNbar">
                                    <p className="lecturelist-amount-info-text">
                                      성적
                                    </p>
                                    <div className="lecturelist-bar">
                                      <div
                                        className="lecturelist-bar-fill"
                                        style={{
                                          width: `${getWidth(
                                            lecture.gradeAmount,
                                            "grade"
                                          )}%`,
                                          backgroundColor: getColor(
                                            100 - lecture.gradeAmount
                                          ),
                                        }}
                                      />
                                    </div>
                                    <p className="lecturelist-amount-info-text">
                                      {isItHard(
                                        100 - lecture.gradeAmount,
                                        "grade"
                                      )}
                                    </p>
                                  </div>
                                  <div className="lecturelist-amount-infoNbar">
                                    <p className="lecturelist-amount-info-text">
                                      팀플
                                    </p>
                                    <div className="lecturelist-bar">
                                      <div
                                        className="lecturelist-bar-fill"
                                        style={{
                                          width: `${getWidth(
                                            lecture.teamPlayAmount,
                                            "teamplay"
                                          )}%`,
                                          backgroundColor: getColor(
                                            100 - lecture.teamPlayAmount
                                          ),
                                        }}
                                      />
                                    </div>
                                    <p className="lecturelist-amount-info-text">
                                      {isItHard(
                                        lecture.teamPlayAmount,
                                        "teamplay"
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="lecturelist-buttons">
                                  <button className="lecture-list-button-godetail">
                                    강의 자세히 보기
                                  </button>
                                </div>
                              </div>
                            </>
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
