import React, { useState, useEffect } from "react";
import axios from "axios";

const LectureList = ({
  lectures,
  checkedLectures,
  handleCheck,
  handleDelete,
  setListedLectures,
  completedLectures,
  setCompletedLectures,
}) => {
  const [editLecture, setEditLecture] = useState(null);
  const [classroom, setClassroom] = useState("");
  const [memo, setMemo] = useState("");

  const handleEditClick = (lecture) => {
    setEditLecture(lecture);
    setClassroom(lecture.userListedLecClassRoom);
    setMemo(lecture.userListedLecMemo);
  };

  const handleSaveClick = async () => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/update_lecture_info",
        {
          userListedLecNumber: editLecture.userListedLecNumber,
          year: editLecture.year,
          semester: editLecture.semester,
          classroom: classroom,
          memo: memo,
        },
        {
          withCredentials: true,
        }
      );

      setListedLectures((prev) =>
        prev.map((lecture) =>
          lecture.userListedLecNumber === editLecture.userListedLecNumber &&
          lecture.year === editLecture.year &&
          lecture.semester === editLecture.semester
            ? {
                ...lecture,
                userListedLecClassRoom: classroom,
                userListedLecMemo: memo,
              }
            : lecture
        )
      );

      setEditLecture(null);
    } catch (error) {
      console.error("Error updating lecture info:", error);
    }
  };

  const handleCompleteClick = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/complete_lecture",
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
          takenLecCredit: lecture.lecCredit,
          year: lecture.year,
          semester: lecture.semester,
        },
        {
          withCredentials: true,
        }
      );

      setCompletedLectures((prev) => [
        ...prev,
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
          takenLecCredit: lecture.lecCredit,
        },
      ]);
    } catch (error) {
      console.error("Error completing lecture:", error);
    }
  };

  const handleUncompleteClick = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/uncomplete_lecture",
        {
          takenLecName: lecture.userListedLecName,
          takenLecClassification: lecture.lecClassification,
          year: lecture.year,
          semester: lecture.semester,
        },
        {
          withCredentials: true,
        }
      );

      setCompletedLectures((prev) =>
        prev.filter(
          (completedLecture) =>
            !(
              completedLecture.takenLecName === lecture.userListedLecName &&
              completedLecture.takenLecClassification ===
                lecture.lecClassification
            )
        )
      );
    } catch (error) {
      console.error("Error uncompleting lecture:", error);
    }
  };

  const isLectureCompleted = (lecture) => {
    return completedLectures.some(
      (completedLecture) =>
        completedLecture.takenLecName === lecture.userListedLecName &&
        completedLecture.takenLecClassification === lecture.lecClassification
    );
  };

  return (
    <div>
      {lectures.length === 0 ? (
        <div>해당 학기에 선택한 강의가 없어요.</div>
      ) : (
        lectures.map((lecture, index) => (
          <div key={index}>
            <hr />
            <div>
              <input
                type="checkbox"
                onChange={() => handleCheck(lecture)}
                checked={checkedLectures.includes(lecture)}
              />
              <p>{lecture.userListedLecName}</p>
              <small>
                {lecture.lecProfessor} | {lecture.userListedLecTime} |
                {lecture.year} |{lecture.semester}
                <br />
                <br />
                {lecture.userListedLecClassRoom} | {lecture.userListedLecMemo}
              </small>
              <button onClick={() => handleEditClick(lecture)}>수정</button>
              {editLecture &&
                editLecture.userListedLecNumber ===
                  lecture.userListedLecNumber && (
                  <div>
                    <div>
                      <button onClick={() => handleDelete(lecture)}>
                        리스트에서 제거
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                        placeholder="강의실"
                      />
                      <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="메모"
                      />
                      <button onClick={handleSaveClick}>저장</button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          isLectureCompleted(lecture)
                            ? handleUncompleteClick(lecture)
                            : handleCompleteClick(lecture);
                        }}
                      >
                        {isLectureCompleted(lecture)
                          ? "수강 완료 취소"
                          : "수강 완료"}
                      </button>
                    </div>
                    <button onClick={() => setEditLecture(null)}>취소</button>
                  </div>
                )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LectureList;
