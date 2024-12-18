import React, { useEffect, useState } from "react";
import "./ListedLectureList.css";
import { useNavigate } from "react-router-dom";

const FullStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HalfStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="half" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="#000000" />
        <stop offset="50%" stopColor="#D3D3D3" />
      </linearGradient>
    </defs>
    <path
      fill="url(#half)"
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

const EmptyStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#D3D3D3">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ListedLectureList = ({
  filteredLectures,
  updateLecturePriority,
  priority,
  unselectLecture,
  updateLectureInfo,
  totalGPA,
  totalCredits,
  markLectureAsCompleted,
  takenLectures,
  year,
  semester,
}) => {
  const [editingLectureIndex, setEditingLectureIndex] = useState(null);
  const [memo, setMemo] = useState("");
  const [classroom, setClassroom] = useState("");
  const [isListVisible, setIsListVisible] = useState(false);
  const [showButtons, setShowButtons] = useState(
    Array(filteredLectures.length).fill(false)
  );
  const navigate = useNavigate();

  // if (filteredLectures.length === 0) {
  //   return <p>강의를 추가해주세요.</p>;
  // }

  const checkedLectures = filteredLectures.filter(
    (lecture) =>
      lecture.priority && lecture.priority.split(" ").includes(priority)
  );

  const maxCredits = checkedLectures.some((lecture) =>
    lecture.lecName.includes("광운인되기")
  )
    ? totalGPA < 3.5
      ? 20
      : 23
    : totalGPA < 3.5
    ? 19
    : 22;

  const [showWarning, setShowWarning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (
      (totalGPA < 3.5 && totalCredits > maxCredits) ||
      (totalGPA >= 3.5 && totalCredits > maxCredits)
    ) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setFadeOut(true);
        const removeTimer = setTimeout(() => {
          setShowWarning(false);
          setFadeOut(false);
        }, 500);
        return () => clearTimeout(removeTimer);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [totalGPA, totalCredits, maxCredits, priority]);

  const warningMessage = showWarning && (
    <div
      className={`listed-lecture-warning-message ${fadeOut ? "fade-out" : ""}`}
    >
      <p className="listed-lecture-warning-message-text">
        {checkedLectures.some((lecture) =>
          lecture.lecName.includes("광운인되기")
        )
          ? `광운인되기를 포함해서 ${maxCredits}학점 까지 들을 수 있어요.`
          : `${maxCredits}학점 까지 들을 수 있어요.`}
      </p>
    </div>
  );

  const handleUnselect = (lecNumber, year, semester) => {
    unselectLecture(lecNumber, year, semester);
  };

  const handleEditClick = (lecture, index) => {
    setEditingLectureIndex(index);
    setMemo(lecture.memo);
    setClassroom(lecture.classroom);
  };

  const handleUpdate = async (lecture) => {
    await updateLectureInfo({
      user_id: lecture.user_id,
      lecNumber: lecture.lecNumber,
      year: lecture.year,
      semester: lecture.semester,
      memo,
      classroom,
    });
    setEditingLectureIndex(null);
  };

  const handleMarkComplete = async (lecture) => {
    try {
      await markLectureAsCompleted({
        user_id: lecture.user_id,
        year: lecture.year,
        semester: lecture.semester,
        lecName: lecture.lecName,
        lecNumber: lecture.lecNumber,
      });
      setEditingLectureIndex(null);
    } catch (error) {
      console.error("error handle mark complete", error);
    }
  };

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
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
      return `${day}${uniquePeriods.join(",")}`;
    });

    return timeSlots.join(", ");
  };

  const renderStarRatingImages = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FullStar key={`full-${i}`} />);
    }
    if (halfStar === 1) {
      stars.push(<HalfStar key="half" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<EmptyStar key={`empty-${i}`} />);
    }

    return <div className="listed-lec-star">{stars}</div>;
  };

  const handleShowButtons = (index) => {
    const updatedShowButtons = [...showButtons];
    updatedShowButtons[index] = !updatedShowButtons[index];
    setShowButtons(updatedShowButtons);
  };

  return (
    <div className="list-view-box">
      {warningMessage}
      <div className="list-view-box">
        {warningMessage}
        <div
          className={`toggle-bar ${isListVisible ? "active" : ""}`}
          onClick={toggleListVisibility}
        >
          {isListVisible
            ? `▼ ${year}년 ${semester} 강의 바구니 닫기`
            : `▲ ${year}년 ${semester} 강의 바구니 보기`}
        </div>
      </div>
      {isListVisible && (
        <div className="lecture-list">
          <div className="lecture-list-inner">
            {filteredLectures.map((lecture, index) => (
              <div
                key={index}
                className="listed-lecture-box"
                onClick={(event) => {
                  if (
                    !event.target.closest("button") &&
                    !event.target.closest("input") &&
                    !event.target.closest("label")
                  ) {
                    handleShowButtons(index);
                  }
                }}
              >
                <div className="lsited-lecture-checkNnameNprof-box">
                  <label className="lsited-lecture-checkNnameNprof">
                    <div className="listed-lecture-left">
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
                      <p
                        className={`listed-lec-lecName ${
                          lecture.isCompleted === 1
                            ? "listed-lec-completed"
                            : ""
                        }`}
                      >
                        {lecture.lecName}
                      </p>
                      <p className="listed-lec-lecProfessor">
                        {lecture.lecProfessor}
                      </p>
                    </div>
                    <div className="listed-lec-right">
                      <div className="listed-lec-star-box">
                        {renderStarRatingImages(lecture.star)}
                      </div>
                    </div>
                  </label>
                </div>
                <div>
                  {lecture.isLecClose === 1 ? (
                    <>
                      <p className="listed-lec-isLecClose">폐강되었어요.</p>
                      <p className="listed-lec-isLecClose-info">
                        {lecture.lecNumber}는 폐강되었어요.
                        <br />
                        정정기간까지 다른 강의를 선택해야 해요.
                      </p>
                      <button
                        className="listed-lec-remove-bucket"
                        onClick={() =>
                          handleUnselect(
                            lecture.lecNumber,
                            lecture.year,
                            lecture.semester
                          )
                        }
                      >
                        강의 바구니에서 빼기
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="listed-lec-lecNumber">
                        {lecture.lecNumber &&
                        !lecture.lecNumber.startsWith("user") &&
                        lecture.lecTime !== undefined ? (
                          <>{lecture.lecNumber}</>
                        ) : null}
                        {lecture.lecTime &&
                        !lecture.lecTime !== "undefined" &&
                        lecture.lecTime !== undefined ? (
                          <>{formatLectureTime(lecture.lecTime)}</>
                        ) : null}
                      </p>

                      <div className="listed-lec-info-second">
                        <p className="listed-lec-lecClassification">
                          {lecture.lecClassification}
                        </p>

                        {lecture.lecTheme && lecture.lecTheme.trim() !== "" && (
                          <p className="listed-lec-lecTheme">
                            ({lecture.lecTheme})
                          </p>
                        )}
                        <p className="listed-lec-lecCredit">
                          {lecture.lecCredit}학점
                        </p>
                      </div>
                      {lecture.isCompleted !== 1 &&
                        editingLectureIndex !== index && (
                          <div className="listed-lec-more-info">
                            {lecture.classroom &&
                              lecture.classroom.trim() !== "" && (
                                <p className="listed-lec-classroom">
                                  {lecture.classroom.length > 10
                                    ? `${lecture.classroom.slice(0, 10)}...`
                                    : lecture.classroom}
                                </p>
                              )}

                            {lecture.memo && lecture.memo.trim() !== "" && (
                              <p className="listed-lec-memo">
                                {lecture.memo.length > 20
                                  ? `${lecture.memo.slice(0, 20)}...`
                                  : lecture.memo}
                              </p>
                            )}
                          </div>
                        )}
                      <div
                        className={`show-buttons ${
                          showButtons[index] ? "expanded" : ""
                        }`}
                      >
                        {showButtons[index] && editingLectureIndex !== index ? (
                          <div>
                            <button
                              className="listed-lec-edit-button"
                              onClick={() => handleEditClick(lecture, index)}
                            >
                              수정
                            </button>
                            {!(
                              lecture.lecNumber.substring(0, 4) === "user"
                            ) && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/lecture/${lecture.year}/${lecture.semester}/${lecture.lecNumber}`
                                  )
                                }
                                className="listed-lec-more-info-button"
                              >
                                강의 자세히 보기
                              </button>
                            )}
                          </div>
                        ) : (
                          editingLectureIndex === index && (
                            <div>
                              <label className="listed-lec-edit-classroom-label">
                                <p className="listed-lec-edit-classroom-text">
                                  강의실:
                                </p>
                                <input
                                  className="listed-lec-edit-classroom"
                                  type="text"
                                  value={classroom}
                                  onChange={(e) => setClassroom(e.target.value)}
                                  placeholder="강의실"
                                />
                              </label>
                              <label className="listed-lec-edit-memo-label">
                                <p className="listed-lec-edit-memo-text">
                                  메모:
                                </p>
                                <input
                                  className="listed-lec-edit-memo"
                                  type="text"
                                  value={memo}
                                  onChange={(e) => setMemo(e.target.value)}
                                  placeholder="메모"
                                />
                              </label>
                              <button
                                className="listed-lec-edit-button"
                                onClick={() => handleUpdate(lecture)}
                              >
                                저장
                              </button>

                              <button
                                className="listed-lec-remove-bucket"
                                onClick={() =>
                                  handleUnselect(
                                    lecture.lecNumber,
                                    lecture.year,
                                    lecture.semester
                                  )
                                }
                              >
                                강의 바구니에서 빼기
                              </button>
                              {lecture.isCompleted !== 1 ? (
                                <button
                                  className="listed-lec-completed-button"
                                  onClick={() => {
                                    const isConfirmed = window.confirm(
                                      "해당 강의를 수강 완료하셨나요? 수강 완료 취소는 mypage에서 가능해요."
                                    );
                                    if (isConfirmed) {
                                      handleMarkComplete(lecture);
                                    }
                                  }}
                                >
                                  수강 완료 처리
                                </button>
                              ) : (
                                <p>수강 완료했어요!</p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListedLectureList;
