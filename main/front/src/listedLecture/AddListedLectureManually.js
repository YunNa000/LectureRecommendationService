import React, { useState } from "react";
import axios from "axios";

const AddListedLectureManaully = ({ user }) => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [classroom, setClassroom] = useState("");
  const [memo, setMemo] = useState("");
  const [lecName, setLecName] = useState("");
  const [lecTime, setLecTime] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/user/add_user_listed_lecture_manually",
        {
          user_id: user,
          year: parseInt(year),
          semester: semester,
          classroom: classroom,
          memo: memo,
          lecName: lecName,
          lecTime: lecTime,
        }
      );
      setSuccess(response.data.detail);
      setYear("");
      setSemester("");
      setClassroom("");
      setMemo("");
      setLecName("");
      setLecTime("");
    } catch (err) {
      setError(
        err.response.data.detail || "강의 수동 추가 중 오류가 밠애했어요."
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <label>년도</label>
        </div>
        <div>
          <input
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
          />
          <label>학기:</label>
        </div>
        <div>
          <label>강의실:</label>
          <input
            type="text"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
          />
        </div>
        <div>
          <label>메모:</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <div>
          <label>강의명:</label>
          <input
            type="text"
            value={lecName}
            onChange={(e) => setLecName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>강의 시간:</label>
          <input
            type="text"
            value={lecTime}
            onChange={(e) => setLecTime(e.target.value)}
          />
        </div>
        <button type="submit">강의 추가</button>
      </form>
      {error && <div>{error}</div>}
      {success && <div>{success}</div>}
    </div>
  );
};

export default AddListedLectureManaully;
