import React, { useState } from "react";
import axios from "axios";

const LectureList = ({
  lectures,
  checkedLectures,
  handleCheck,
  handleDelete,
  setListedLectures, // prop으로 전달된 setListedLectures
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
      const response = await axios.post(
        "http://localhost:8000/user/data/update_lecture_info",
        {
          lec_number: editLecture.lecNumber,
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
          lecture.lecNumber === editLecture.lecNumber &&
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
              <p>{lecture.lecClassName}</p>{" "}
              <small>
                {lecture.lecProfessor} | {lecture.lecTime} | {lecture.year} |
                {lecture.semester}
                <br />
                <br />
                {lecture.userListedLecClassRoom} | {lecture.userListedLecMemo}
              </small>
              <button onClick={() => handleDelete(lecture)}>삭제</button>
              <button onClick={() => handleEditClick(lecture)}>수정</button>
              {editLecture && editLecture.lecNumber === lecture.lecNumber && (
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
